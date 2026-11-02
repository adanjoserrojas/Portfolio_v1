require 'minitest/autorun'
require_relative 'app'
require 'rack/mock'
class MemoryDb
  attr_reader :items
  def initialize;@items={};end
  def get_item(key:,**);Struct.new(:item).new(@items[key[:pk]]);end
  def transact_write_items(transact_items:)
    private_put=transact_items[0][:put]
    expected=private_put[:expression_attribute_values][':revision']
    raise Aws::DynamoDB::Errors::TransactionCanceledException.new(nil,'conflict') if @items['PRIVATE']&&@items['PRIVATE']['revision']!=expected
    transact_items.each{|t|item=t[:put][:item];@items[item['pk']||item[:pk]]=JSON.parse(JSON.generate(item))}
  end
end
class BoardTest < Minitest::Test
  def setup
    @db=MemoryDb.new
    ProjectsController.define_method(:db){BoardTest.database}
    ProjectsController.define_method(:table){'test'}
    ProjectsController.skip_before_action :authorize_admin,raise:false
    BoardTest.database=@db
    @app=Rack::MockRequest.new(BoardApp)
    @data={title:'Test project',description:'Description',status:'not_started',tags:['Ruby'],demoUrl:'',repoUrl:'',visible:true,archived:false,privateNotes:'Never public',position:0}
  end
  class << self;attr_accessor :database;end
  def request(method,path,data,key=SecureRandom.uuid)
    @app.request(method,path,'CONTENT_TYPE'=>'application/json','HTTP_IDEMPOTENCY_KEY'=>key,input:JSON.generate(data))
  end
  def test_create_projects_public_projection_and_idempotency
    key=SecureRandom.uuid
    first=request('POST','/v1/admin/projects',@data,key)
    assert_equal 201,first.status,first.body
    assert_equal 1,@db.items['PRIVATE']['projects'].size
    refute @db.items['PUBLIC'].to_json.include?('Never public')
    replay=request('POST','/v1/admin/projects',@data,key)
    assert_equal 200,replay.status
    assert_equal 1,@db.items['PRIVATE']['projects'].size
  end
  def test_update_conflict_and_unpublish
    first=JSON.parse(request('POST','/v1/admin/projects',@data).body)['project']
    response=request('PATCH',"/v1/admin/projects/#{first['id']}",@data.merge(version:1,status:'in_progress',visible:false))
    assert_equal 200,response.status,response.body
    assert_equal [],@db.items['PUBLIC']['projects']
    stale=request('PATCH',"/v1/admin/projects/#{first['id']}",@data.merge(version:1))
    assert_equal 409,stale.status
  end
  def test_validation_rejects_unknown_status_and_unsafe_url
    assert_equal 422,request('POST','/v1/admin/projects',@data.merge(status:'missing')).status
    assert_equal 422,request('POST','/v1/admin/projects',@data.merge(demoUrl:'javascript:alert(1)')).status
    assert_empty @db.items
  end
  def test_delete_removes_public_and_private_project_and_replays_safely
    project=JSON.parse(request('POST','/v1/admin/projects',@data).body)['project']
    path="/v1/admin/projects/#{project['id']}"
    key=SecureRandom.uuid
    response=request('DELETE',path,{version:1},key)
    assert_equal 200,response.status,response.body
    assert_equal project['id'],JSON.parse(response.body)['deletedId']
    assert_empty @db.items['PRIVATE']['projects']
    assert_empty @db.items['PUBLIC']['projects']
    assert_equal 2,@db.items['PUBLIC']['revision']
    assert_equal 200,request('DELETE',path,{version:1},key).status
    assert_equal 2,@db.items['PRIVATE']['revision']
    assert_equal 404,request('DELETE',path,{version:1}).status
    assert_equal 409,request('DELETE',path,{version:2},key).status
  end
  def test_delete_preserves_newer_data_and_rejects_invalid_input
    project=JSON.parse(request('POST','/v1/admin/projects',@data).body)['project']
    path="/v1/admin/projects/#{project['id']}"
    request('PATCH',path,@data.merge(version:1,title:'Updated title'))
    assert_equal 409,request('DELETE',path,{version:1}).status
    assert_equal 422,request('DELETE',path,{}).status
    assert_equal 422,request('DELETE',path,{version:2,all:true}).status
    assert_equal 422,request('DELETE',path,{version:2},'bad').status
    assert_equal 'Updated title',@db.items['PUBLIC']['projects'].first['title']
  end
  def test_numbers_read_from_dynamodb_are_json_numbers
    request('POST','/v1/admin/projects',@data)
    @db.items['PRIVATE']['revision']=BigDecimal('1')
    @db.items['PRIVATE']['projects'].first['version']=BigDecimal('1')
    @db.items['PRIVATE']['projects'].first['position']=BigDecimal('0')
    response=JSON.parse(@app.get('/v1/admin/projects').body)
    assert_equal 1,response['revision']
    assert_equal 1,response['projects'].first['version']
    assert_equal 0,response['projects'].first['position']
  end
end
