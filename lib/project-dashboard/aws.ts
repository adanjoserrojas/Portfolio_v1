import "server-only";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { awsCredentialsProvider } from "@vercel/oidc-aws-credentials-provider";

function credentials() {
  if (process.env.VERCEL)
    return awsCredentialsProvider({ roleArn: process.env.BOARD_AWS_ROLE_ARN! });
  const accessKeyId = process.env.BOARD_AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.BOARD_AWS_SECRET_ACCESS_KEY;
  const sessionToken = process.env.BOARD_AWS_SESSION_TOKEN;
  if (accessKeyId && secretAccessKey && sessionToken)
    return { accessKeyId, secretAccessKey, sessionToken };
  // Never fall back to unrelated portfolio credentials for this subsystem.
  return async () => {
    throw new Error("Start the dashboard with its scoped preview script.");
  };
}
export const db = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.BOARD_AWS_REGION || "us-east-1",
    credentials: credentials(),
  }),
  { marshallOptions: { removeUndefinedValues: true } },
);
