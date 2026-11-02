import * as cdk from "aws-cdk-lib";
import {
  aws_s3 as s3,
  aws_codebuild as build,
  aws_logs as logs,
} from "aws-cdk-lib";
const app = new cdk.App({ outdir: "cdk.build" });
const stack = new cdk.Stack(app, "BuildlogPackaging", {
  env: { account: "004575106238", region: "us-east-1" },
});
const bucket = new s3.Bucket(stack, "Artifacts", {
  bucketName: "buildlog-artifacts-004575106238-us-east-1",
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  enforceSSL: true,
  removalPolicy: cdk.RemovalPolicy.RETAIN,
  lifecycleRules: [{ expiration: cdk.Duration.days(30) }],
});
const project = new build.Project(stack, "Package", {
  projectName: "buildlog-rails-package",
  source: build.Source.s3({ bucket, path: "source.zip" }),
  artifacts: build.Artifacts.s3({
    bucket,
    path: "built",
    name: "rails",
    includeBuildId: false,
    packageZip: false,
  }),
  environment: {
    buildImage: build.LinuxBuildImage.fromDockerRegistry(
      "public.ecr.aws/sam/build-ruby3.3:latest",
    ),
    computeType: build.ComputeType.SMALL,
  },
  timeout: cdk.Duration.minutes(15),
  logging: {
    cloudWatch: {
      logGroup: new logs.LogGroup(stack, "Logs", {
        retention: logs.RetentionDays.ONE_WEEK,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }),
    },
  },
  buildSpec: build.BuildSpec.fromObject({
    version: "0.2",
    phases: {
      build: {
        commands: [
          "ruby -v",
          "bundle config set --local path vendor/bundle",
          "bundle install --jobs 4",
          "ruby -c app.rb",
          "ruby -c handler.rb",
          "bundle exec ruby test_app.rb",
          "bundle exec ruby test_auth.rb",
          "mkdir -p out",
          "zip -qr out/rails.zip app.rb handler.rb Gemfile Gemfile.lock vendor .bundle",
        ],
      },
    },
    artifacts: { "base-directory": "out", files: ["rails.zip"] },
  }),
});
new cdk.CfnOutput(stack, "BuildProject", { value: project.projectName });
app.synth();
