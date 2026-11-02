import * as cdk from "aws-cdk-lib";
import deployment from "./deployment-config.json";
import {
  aws_dynamodb as ddb,
  aws_iam as iam,
  aws_lambda as lambda,
  aws_cognito as cognito,
  aws_logs as logs,
  aws_s3 as s3,
  aws_apigatewayv2 as api,
  aws_cloudwatch as cw,
} from "aws-cdk-lib";
const app = new cdk.App({ outdir: "cdk.out" });
const stack = new cdk.Stack(app, "BuildlogPrototype", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT || "004575106238",
    region: "us-east-1",
  },
});
const webOrigin = process.env.BUILDLOG_WEB_ORIGIN || deployment.webOrigin;
const localOrigins = ["http://localhost:3000", "http://localhost:3100"];
// Keep local testing available alongside the explicitly configured hosted origin.
const webOrigins = [...new Set([...localOrigins, webOrigin])];
if (
  !localOrigins.includes(webOrigin) &&
  (new URL(webOrigin).protocol !== "https:" || new URL(webOrigin).origin !== webOrigin)
)
  throw new Error("Hosted dashboard origin must be an HTTPS origin without a path");
const table = new ddb.Table(stack, "Board", {
  tableName: "buildlog-prototype-board",
  partitionKey: { name: "pk", type: ddb.AttributeType.STRING },
  billingMode: ddb.BillingMode.PAY_PER_REQUEST,
  timeToLiveAttribute: "ttl",
  removalPolicy: cdk.RemovalPolicy.RETAIN,
  pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
});
const sessions = new ddb.Table(stack, "Sessions", {
  tableName: "buildlog-prototype-sessions",
  partitionKey: { name: "pk", type: ddb.AttributeType.STRING },
  billingMode: ddb.BillingMode.PAY_PER_REQUEST,
  timeToLiveAttribute: "ttl",
  removalPolicy: cdk.RemovalPolicy.RETAIN,
});
const pool = new cognito.UserPool(stack, "AdminPool", {
  userPoolName: "buildlog-prototype-admin",
  selfSignUpEnabled: false,
  signInAliases: { email: true },
  mfa: cognito.Mfa.REQUIRED,
  mfaSecondFactor: { otp: true, sms: false },
  accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
  passwordPolicy: {
    minLength: 10,
    requireLowercase: true,
    requireUppercase: false,
    requireDigits: true,
    requireSymbols: true,
    tempPasswordValidity: cdk.Duration.days(7),
  },
  removalPolicy: cdk.RemovalPolicy.RETAIN,
});
new cognito.CfnUserPoolGroup(stack, "AdminGroup", {
  groupName: "admin",
  userPoolId: pool.userPoolId,
});
const read = new cognito.ResourceServerScope({
    scopeName: "read",
    scopeDescription: "Read private projects",
  }),
  write = new cognito.ResourceServerScope({
    scopeName: "write",
    scopeDescription: "Update projects",
  });
const resource = pool.addResourceServer("BoardScopes", {
  identifier: "board",
  scopes: [read, write],
});
const client = pool.addClient("Web", {
  generateSecret: false,
  preventUserExistenceErrors: true,
  accessTokenValidity: cdk.Duration.minutes(5),
  idTokenValidity: cdk.Duration.minutes(5),
  refreshTokenValidity: cdk.Duration.hours(8),
  enableTokenRevocation: true,
  oAuth: {
    flows: { authorizationCodeGrant: true },
    scopes: [
      cognito.OAuthScope.OPENID,
      cognito.OAuthScope.EMAIL,
      cognito.OAuthScope.PROFILE,
      cognito.OAuthScope.resourceServer(resource, read),
      cognito.OAuthScope.resourceServer(resource, write),
    ],
    callbackUrls: webOrigins.map((origin) => `${origin}/auth/callback`),
    logoutUrls: webOrigins.map((origin) => `${origin}/login`),
  },
  supportedIdentityProviders: [cognito.UserPoolClientIdentityProvider.COGNITO],
});
const domain = pool.addDomain("Domain", {
  cognitoDomain: { domainPrefix: "buildlog-004575106238-prototype" },
});
const log = new logs.LogGroup(stack, "ApiLogs", {
  logGroupName: "/aws/lambda/buildlog-prototype-api",
  retention: logs.RetentionDays.ONE_WEEK,
  removalPolicy: cdk.RemovalPolicy.DESTROY,
});
const role = new iam.Role(stack, "RailsRole", {
  roleName: "buildlog-prototype-rails",
  assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
});
table.grantReadWriteData(role);
log.grantWrite(role);
const fn = new lambda.Function(stack, "Rails", {
  functionName: "buildlog-prototype-api",
  runtime: lambda.Runtime.RUBY_3_3,
  handler: "handler.handler",
  architecture: lambda.Architecture.X86_64,
  memorySize: 1024,
  timeout: cdk.Duration.seconds(25),
  role,
  logGroup: log,
  code: lambda.Code.fromBucket(
    s3.Bucket.fromBucketName(
      stack,
      "Artifacts",
      "buildlog-artifacts-004575106238-us-east-1",
    ),
    process.env.ARTIFACT_KEY || "built/rails/rails-fb361602c7156866.zip",
  ),
  environment: {
    BOARD_TABLE: table.tableName,
    RAILS_ENV: "production",
    COGNITO_ISSUER: pool.userPoolProviderUrl,
    COGNITO_CLIENT_ID: client.userPoolClientId,
    GEM_PATH:
      "/var/task/vendor/bundle/ruby/3.3.0:/var/lang/lib/ruby/gems/3.3.0",
  },
});
const http = new api.CfnApi(stack, "HttpApi", {
  name: "buildlog-prototype",
  protocolType: "HTTP",
});
const authorizer = new api.CfnAuthorizer(stack, "Jwt", {
  apiId: http.ref,
  authorizerType: "JWT",
  name: "CognitoAdmin",
  identitySource: ["$request.header.Authorization"],
  jwtConfiguration: {
    issuer: pool.userPoolProviderUrl,
    audience: [client.userPoolClientId],
  },
});
const integration = new api.CfnIntegration(stack, "Integration", {
  apiId: http.ref,
  integrationType: "AWS_PROXY",
  integrationUri: fn.functionArn,
  payloadFormatVersion: "2.0",
  timeoutInMillis: 25000,
});
for (const [name, path, scope] of [
  ["List", "GET /v1/admin/projects", "board/read"],
  ["Create", "POST /v1/admin/projects", "board/write"],
  ["Edit", "PATCH /v1/admin/projects/{id}", "board/write"],
  ["Delete", "DELETE /v1/admin/projects/{id}", "board/write"],
])
  new api.CfnRoute(stack, name, {
    apiId: http.ref,
    routeKey: path,
    authorizationType: "JWT",
    authorizerId: authorizer.ref,
    authorizationScopes: [scope],
    target: `integrations/${integration.ref}`,
  });
new api.CfnStage(stack, "Stage", {
  apiId: http.ref,
  stageName: "$default",
  autoDeploy: true,
  defaultRouteSettings: { throttlingBurstLimit: 10, throttlingRateLimit: 5 },
});
fn.addPermission("Gateway", {
  principal: new iam.ServicePrincipal("apigateway.amazonaws.com"),
  sourceArn: `arn:aws:execute-api:${stack.region}:${stack.account}:${http.ref}/*`,
});
const runtime = new iam.Role(stack, "LocalWebRole", {
  roleName: "buildlog-prototype-web",
  assumedBy: new iam.ArnPrincipal(
    "arn:aws:iam::004575106238:user/calendar-agent-dev",
  ),
  maxSessionDuration: cdk.Duration.hours(8),
  description:
    "Local prototype web server: public record reads and isolated session storage only.",
});
runtime.addToPolicy(
  new iam.PolicyStatement({
    actions: ["dynamodb:GetItem"],
    resources: [table.tableArn],
    conditions: {
      "ForAllValues:StringEquals": { "dynamodb:LeadingKeys": ["PUBLIC"] },
    },
  }),
);
runtime.addToPolicy(
  new iam.PolicyStatement({
    actions: ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:DeleteItem"],
    resources: [sessions.tableArn],
  }),
);
const team = process.env.VERCEL_TEAM_SLUG || deployment.vercelTeamSlug,
  project = process.env.VERCEL_PROJECT_NAME || deployment.vercelProjectName;
if (Boolean(process.env.VERCEL_TEAM_SLUG) !== Boolean(process.env.VERCEL_PROJECT_NAME))
  throw new Error("Set both VERCEL_TEAM_SLUG and VERCEL_PROJECT_NAME");
if (team && project) {
  const issuerHost = `oidc.vercel.com/${team}`;
  const provider = new iam.CfnOIDCProvider(stack, "VercelIdentity", {
    url: `https://${issuerHost}`,
    clientIdList: [`https://vercel.com/${team}`],
  });
  const web = new iam.Role(stack, "VercelWebRole", {
    roleName: "buildlog-vercel-production",
    description: "Production portfolio: public board reads and isolated admin session storage.",
    assumedBy: new iam.FederatedPrincipal(
      provider.attrArn,
      {
        StringEquals: {
          [`${issuerHost}:aud`]: `https://vercel.com/${team}`,
          [`${issuerHost}:sub`]: `owner:${team}:project:${project}:environment:production`,
        },
      },
      "sts:AssumeRoleWithWebIdentity",
    ),
  });
  web.addToPolicy(
    new iam.PolicyStatement({
      actions: ["dynamodb:GetItem"],
      resources: [table.tableArn],
      conditions: {
        "ForAllValues:StringEquals": { "dynamodb:LeadingKeys": ["PUBLIC"] },
      },
    }),
  );
  web.addToPolicy(
    new iam.PolicyStatement({
      actions: ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:DeleteItem"],
      resources: [sessions.tableArn],
    }),
  );
  new cdk.CfnOutput(stack, "VercelWebRoleArn", { value: web.roleArn });
}
new cw.Alarm(stack, "Errors", {
  metric: fn.metricErrors(),
  threshold: 3,
  evaluationPeriods: 1,
  alarmDescription:
    "Inspect Rails errors; connect a notification destination before production.",
});
const outputs = {
  BoardTable: table.tableName,
  SessionTable: sessions.tableName,
  PoolId: pool.userPoolId,
  ClientId: client.userPoolClientId,
  Domain: domain.baseUrl(),
  ApiUrl: http.attrApiEndpoint,
  WebRole: runtime.roleArn,
};
for (const [k, v] of Object.entries(outputs))
  new cdk.CfnOutput(stack, k, { value: v });
app.synth();
