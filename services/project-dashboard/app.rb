require 'bundler/setup'
require 'rails'
require 'action_controller/railtie'
require 'aws-sdk-dynamodb'
require 'jwt'
require 'net/http'
require 'securerandom'
require 'digest'
require 'time'

class BoardApp < Rails::Application
  config.eager_load = false
  config.secret_key_base = ENV.fetch('SECRET_KEY_BASE') { SecureRandom.hex(64) }
  config.hosts.clear
  config.logger = Logger.new($stdout)
  config.log_level = :warn
  config.api_only = true
end

class ProjectsController < ActionController::API
  before_action :authorize_admin
  STATUSES = %w[not_started in_progress in_review finished].freeze
  FIELDS = %w[title description status tags demoUrl repoUrl visible archived privateNotes position].freeze
  PUBLIC_FIELDS = %w[id title description status tags demoUrl repoUrl position version updatedAt].freeze
  rescue_from ArgumentError do |e|
    render json: {error:e.message}, status:422
  end
  def index
    board = get('PRIVATE') || {'projects'=>[], 'revision'=>0}
    render json: board.slice('projects','revision')
  end
  def create; save_project(nil); end
  def update; save_project(params[:id]); end
  def destroy
    input=request.request_parameters.except('project')
    raise ArgumentError,'Expected a positive project version' unless input.keys==['version'] && input['version'].is_a?(Integer) && input['version']>0
    return if replayed_request?('DELETE',params[:id],input)
    board=get('PRIVATE')||{'pk'=>'PRIVATE','projects'=>[],'revision'=>0}
    project=board['projects'].find{|p|p['id']==params[:id]}
    return render(json:{error:'Project not found'},status:404) unless project
    return render(json:{error:'This project changed. Refresh before deleting.'},status:409) unless project['version'].to_i==input['version']
    projects=board['projects'].reject{|p|p['id']==project['id']}
    commit_projects(board,projects,{'deletedId'=>project['id'],'revision'=>board['revision'].to_i+1},200)
  end

  rescue_from Aws::DynamoDB::Errors::TransactionCanceledException do
    replay=get("REQUEST##{@request_key}")
    if replay&&replay['fingerprint']==@fingerprint
      render json:replay['result']
    else
      render json:{error:'The board changed. Refresh and try again.'},status:409
    end
  end

  private
  def db; @db ||= Aws::DynamoDB::Client.new; end
  def table; ENV.fetch('BOARD_TABLE'); end
  def get(key); normalize_numbers(db.get_item(table_name:table,key:{pk:key},consistent_read:true).item); end
  # The Ruby SDK returns DynamoDB numbers as BigDecimal. Rails otherwise emits
  # these as JSON strings, breaking version validation after a browser reload.
  def normalize_numbers(value)
    case value
    when BigDecimal then value.frac.zero? ? value.to_i : value.to_f
    when Array then value.map{|item|normalize_numbers(item)}
    when Hash then value.transform_values{|item|normalize_numbers(item)}
    else value
    end
  end
  def authorize_admin
    token=request.headers['Authorization'].to_s.sub(/^Bearer /,'')
    issuer=ENV.fetch('COGNITO_ISSUER')
    loader=lambda do |opts|
      if !defined?(@@jwks) || opts[:invalidate] || Time.now.to_i-(@@jwks_time||0)>3600
        response=Net::HTTP.get_response(URI("#{issuer}/.well-known/jwks.json"))
        raise 'Identity service unavailable' unless response.is_a?(Net::HTTPSuccess)
        @@jwks=JSON.parse(response.body);@@jwks_time=Time.now.to_i
      end
      @@jwks
    end
    claims=JWT.decode(token,nil,true,{algorithms:['RS256'],jwks:loader,iss:issuer,verify_iss:true,verify_expiration:true,required_claims:['exp','sub','iss']}).first
    scope=request.get? ? 'board/read' : 'board/write'
    unless claims['token_use']=='access' && claims['client_id']==ENV.fetch('COGNITO_CLIENT_ID') && claims.fetch('cognito:groups',[]).include?('admin') && claims.fetch('scope','').split.include?(scope)
      render json:{error:'Admin access required'},status:403
    end
  rescue JWT::DecodeError
    render json:{error:'Authentication required'},status:401
  end
  def save_project(id)
    input=request.request_parameters.except('project')
    raise ArgumentError,'Unexpected fields' unless (input.keys-(FIELDS+['version'])).empty?
    raise ArgumentError,'Title is required (100 characters maximum)' unless input['title'].is_a?(String) && input['title'].strip.length.between?(1,100)
    input['title']=input['title'].strip
    raise ArgumentError,'Invalid status' unless STATUSES.include?(input['status'])
    %w[description privateNotes].each{|f| raise ArgumentError,"Invalid #{f}" unless input[f].is_a?(String) && input[f].length<=(f=='privateNotes' ? 3000 : 1500)}
    raise ArgumentError,'Invalid tags' unless input['tags'].is_a?(Array) && input['tags'].length<=6 && input['tags'].all?{|t|t.is_a?(String)&&t.strip.length.between?(1,30)}
    %w[demoUrl repoUrl].each do |f|
      v=input[f]; raise ArgumentError,'Links must use HTTPS' unless v.is_a?(String) && (v.empty? || (URI.parse(v).is_a?(URI::HTTPS) && URI.parse(v).host))
    rescue URI::InvalidURIError;raise ArgumentError,'Invalid link';end
    %w[visible archived].each{|f|raise ArgumentError,"Invalid #{f}" unless [true,false].include?(input[f])}
    raise ArgumentError,'Invalid position' unless input['position'].is_a?(Integer)&&input['position'].between?(0,9999)
    return if replayed_request?(id ? 'PATCH' : 'POST',id,input)
    board=get('PRIVATE')||{'pk'=>'PRIVATE','projects'=>[],'revision'=>0}
    revision=board['revision'].to_i
    old=board['projects'].find{|p|p['id']==id} if id
    return render(json:{error:'Project not found'},status:404) if id&&!old
    return render(json:{error:'This project changed. Refresh before saving.'},status:409) if old&&old['version'].to_i!=input['version']
    project=input.slice(*FIELDS).merge('id'=>id||SecureRandom.uuid,'version'=>(old ? old['version'].to_i+1 : 1),'updatedAt'=>Time.now.utc.iso8601)
    projects=board['projects'].reject{|p|p['id']==id}+[project]
    commit_projects(board,projects,{'project'=>project,'revision'=>revision+1},id ? 200 : 201)
  end
  def replayed_request?(operation,id,input)
    @request_key=request.headers['Idempotency-Key'].to_s
    raise ArgumentError,'Invalid request identifier' unless @request_key.match?(/\A[a-zA-Z0-9-]{16,80}\z/)
    @fingerprint=Digest::SHA256.hexdigest(JSON.generate([operation,id,input.sort.to_h]))
    previous=get("REQUEST##{@request_key}")
    return false unless previous
    if previous['fingerprint']!=@fingerprint
      render json:{error:'Request identifier already used'},status:409
    else
      render json:previous['result']
    end
    true
  end
  def commit_projects(board,projects,result,status)
    revision=board['revision'].to_i
    public_projects=projects.select{|p|p['visible']&&!p['archived']}.map{|p|p.slice(*PUBLIC_FIELDS)}.sort_by{|p|p['position']}
    private_item={'pk'=>'PRIVATE','projects'=>projects,'revision'=>revision+1}
    public_item={'pk'=>'PUBLIC','projects'=>public_projects,'revision'=>revision+1,'updatedAt'=>Time.now.utc.iso8601}
    raise ArgumentError,'Board capacity reached. Shorten descriptions or remove old content.' if [private_item,public_item].any?{|i|JSON.generate(i).bytesize>256*1024}
    db.transact_write_items(transact_items:[
      {put:{table_name:table,item:private_item,condition_expression:'attribute_not_exists(pk) OR revision = :revision',expression_attribute_values:{':revision'=>revision}}},
      {put:{table_name:table,item:public_item}},
      {put:{table_name:table,item:{pk:"REQUEST##{@request_key}",fingerprint:@fingerprint,result:result,ttl:Time.now.to_i+86400},condition_expression:'attribute_not_exists(pk)'}}
    ])
    render json:result,status:status
  end
end
BoardApp.initialize!
BoardApp.routes.draw do
  get '/v1/admin/projects',to:'projects#index'
  post '/v1/admin/projects',to:'projects#create'
  patch '/v1/admin/projects/:id',to:'projects#update'
  delete '/v1/admin/projects/:id',to:'projects#destroy'
end
