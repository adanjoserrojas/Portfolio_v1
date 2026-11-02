param([Parameter(Mandatory=$true)][string]$Profile,[switch]$Deploy)
$ErrorActionPreference='Stop'
$repo=Resolve-Path (Join-Path $PSScriptRoot '../..')
Set-Location $repo
$env:AWS_PROFILE=$Profile
$env:AWS_DEFAULT_REGION='us-east-1'
function Check-Exit { if($LASTEXITCODE -ne 0){throw 'Command failed; deployment stopped.'} }
& npx.cmd tsx infra/project-dashboard/build.ts
Check-Exit
& aws cloudformation deploy --template-file cdk.build/BuildlogPackaging.template.json --stack-name BuildlogPackaging --capabilities CAPABILITY_NAMED_IAM --region us-east-1
Check-Exit
$source=Join-Path $repo 'services/project-dashboard'
$archive=Join-Path $source 'source.zip'
$files='app.rb','handler.rb','Gemfile','Gemfile.lock','test_app.rb','test_auth.rb' | ForEach-Object { Join-Path $source $_ }
Compress-Archive -LiteralPath $files -DestinationPath $archive -Force
& aws s3 cp $archive s3://buildlog-artifacts-004575106238-us-east-1/source.zip --no-progress
Check-Exit
$build=& aws codebuild start-build --project-name buildlog-rails-package --output json --no-cli-pager | ConvertFrom-Json
Check-Exit
do {
  Start-Sleep -Seconds 5
  $state=& aws codebuild batch-get-builds --ids $build.build.id --output json --no-cli-pager | ConvertFrom-Json
  Check-Exit
  $status=$state.builds[0].buildStatus
} while($status -eq 'IN_PROGRESS')
if($status -ne 'SUCCEEDED'){throw "Backend build failed: $status. Inspect CodeBuild run $($build.build.id)."}
$suffix=$build.build.id.Split(':')[-1]
$env:ARTIFACT_KEY="built/releases/$suffix/rails.zip"
& aws s3 cp s3://buildlog-artifacts-004575106238-us-east-1/built/rails/rails.zip "s3://buildlog-artifacts-004575106238-us-east-1/$env:ARTIFACT_KEY" --no-progress
Check-Exit
& npm.cmd run synth:dashboard
Check-Exit
Write-Host "Backend packaged at $env:ARTIFACT_KEY; infrastructure template synthesized."
if($Deploy){
  & aws cloudformation deploy --template-file cdk.out/BuildlogPrototype.template.json --stack-name BuildlogPrototype --capabilities CAPABILITY_NAMED_IAM --region us-east-1
  Check-Exit
}
