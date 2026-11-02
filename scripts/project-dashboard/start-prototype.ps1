param([string]$Profile='calendar-agent-dev',[switch]$Build,[switch]$BuildOnly)
$ErrorActionPreference='Stop'
Set-Location (Join-Path $PSScriptRoot '../..')
$config=Get-Content (Join-Path $PSScriptRoot 'prototype-config.json') -Raw | ConvertFrom-Json -AsHashtable
$session=(& aws sts assume-role --role-arn $config.WebRole --role-session-name BuildlogLocalPreview --duration-seconds 28800 --profile $Profile --region us-east-1 --output json --no-cli-pager | ConvertFrom-Json)
if($LASTEXITCODE -ne 0){throw 'Unable to obtain scoped runtime credentials.'}
$env:BOARD_AWS_ACCESS_KEY_ID=$session.Credentials.AccessKeyId
$env:BOARD_AWS_SECRET_ACCESS_KEY=$session.Credentials.SecretAccessKey
$env:BOARD_AWS_SESSION_TOKEN=$session.Credentials.SessionToken

$env:BOARD_AWS_REGION='us-east-1';$env:BOARD_TABLE=$config.BoardTable;$env:SESSION_TABLE=$config.SessionTable
$env:COGNITO_POOL_ID=$config.PoolId;$env:COGNITO_CLIENT_ID=$config.ClientId;$env:COGNITO_DOMAIN=$config.Domain;$env:BOARD_API=$config.ApiUrl
$env:APP_ORIGIN='http://localhost:3100'
$env:SESSION_SECRET=[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
if($Build -or $BuildOnly){& npm.cmd run build;if($LASTEXITCODE -ne 0){throw 'Build failed.'}}
if($BuildOnly){exit 0}
Write-Host 'Opening Buildlog at http://localhost:3100/board (scoped AWS session lasts 8 hours).'
& npm.cmd run start -- -H 127.0.0.1 -p 3100
exit $LASTEXITCODE
