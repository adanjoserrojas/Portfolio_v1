require 'minitest/autorun'
require_relative 'app'
require 'rack/mock'

class AuthorizationTest < Minitest::Test
  def setup
    ENV['COGNITO_ISSUER']='https://cognito-idp.us-east-1.amazonaws.com/test-pool'
    ENV['COGNITO_CLIENT_ID']='test-client'
    @key=OpenSSL::PKey::RSA.generate(2048)
    @jwk=JWT::JWK.new(@key)
    ProjectsController.class_variable_set(:@@jwks,{'keys'=>[@jwk.export]})
    ProjectsController.class_variable_set(:@@jwks_time,Time.now.to_i)
    ProjectsController.define_method(:get){|_|{'projects'=>[],'revision'=>0}}
    @app=Rack::MockRequest.new(BoardApp)
    @claims={'iss'=>ENV['COGNITO_ISSUER'],'sub'=>'admin','exp'=>Time.now.to_i+300,'token_use'=>'access','client_id'=>'test-client','cognito:groups'=>['admin'],'scope'=>'board/read board/write'}
  end
  def call(claims,method='GET')
    token=JWT.encode(claims,@key,'RS256',kid:@jwk.kid)
    @app.request(method,'/v1/admin/projects','HTTP_AUTHORIZATION'=>"Bearer #{token}")
  end
  def test_requires_authentication_and_expiry
    assert_equal 401,@app.get('/v1/admin/projects').status
    assert_equal 401,call(@claims.merge('exp'=>Time.now.to_i-60)).status
  end
  def test_requires_admin_access_token_for_this_client_and_scope
    assert_equal 200,call(@claims).status
    [{'cognito:groups'=>[]},{'token_use'=>'id'},{'client_id'=>'other'},{'scope'=>'openid'}].each do |patch|
      assert_equal 403,call(@claims.merge(patch)).status
    end
    assert_equal 403,call(@claims.merge('scope'=>'board/read'),'POST').status
  end
end
