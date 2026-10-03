import "server-only";

import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "@/lib/dynamo/dynamo";
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";

export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds = 86400,
) {
  if (!process.env.CONTACT_TABLE_NAME) throw new Error("CONTACT_TABLE_NAME is not configured");
  const now = Math.floor(Date.now() / 1000);
  const start = Math.floor(now / windowSeconds) * windowSeconds;
  // Preserve existing daily keys so deployment doesn't reset daily limits.
  const bucket = windowSeconds === 86400
    ? new Date(start * 1000).toISOString().slice(0, 10)
    : `${windowSeconds}S#${start}`;

  try {
    await ddb.send(
      new UpdateCommand({
        TableName: process.env.CONTACT_TABLE_NAME,

        Key: {
          PK: `RATE#${identifier}#${bucket}`,
          SK: `DATE#${bucket}`,
        },

        UpdateExpression:
          "SET #count = if_not_exists(#count, :zero) + :one, expiresAt = :expiresAt",

        ConditionExpression:
          "attribute_not_exists(#count) OR #count < :limit",

        ExpressionAttributeNames: {
          "#count": "count",
        },

        ExpressionAttributeValues: {
          ":zero": 0,
          ":one": 1,
          ":limit": limit,
          // Cleanup grace period; expiration never controls limit enforcement.
          ":expiresAt": start + windowSeconds + 7 * 86400,
        },
      })
    );

    return true;
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException){
      return false;
    }

    throw error;
  }
}
