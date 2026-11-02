# API Gateway HTTP API -> Rack. Rails owns routing, controllers and validation.
require_relative 'app'
require 'stringio'
require 'base64'
def handler(event:, context:)
  request=event.fetch('requestContext').fetch('http')
  body=event['body'].to_s
  body=Base64.decode64(body) if event['isBase64Encoded']
  env={'REQUEST_METHOD'=>request['method'],'PATH_INFO'=>event['rawPath'],'QUERY_STRING'=>event['rawQueryString'].to_s,'SERVER_NAME'=>'lambda','SERVER_PORT'=>'443','rack.url_scheme'=>'https','rack.input'=>StringIO.new(body),'rack.errors'=>$stderr,'SCRIPT_NAME'=>'','CONTENT_LENGTH'=>body.bytesize.to_s}
  event.fetch('headers',{}).each do |key,value|
    name=key.upcase.tr('-','_');name="HTTP_#{name}" unless ['CONTENT_TYPE','CONTENT_LENGTH'].include?(name);env[name]=value
  end
  status,headers,response=BoardApp.call(env)
  output='';response.each{|chunk|output<<chunk};response.close if response.respond_to?(:close)
  {statusCode:status,headers:headers.merge('cache-control'=>'private, no-store'),body:output}
rescue => e
  warn({error:e.class.name,requestId:context.aws_request_id}.to_json)
  {statusCode:500,headers:{'content-type'=>'application/json'},body:'{"error":"Unable to complete request"}'}
end
