import "server-only";

import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "@/lib/dynamo/dynamo";

export async function checkRateLimit(
  identifier: string,
  limit: number
) {
  const today = new Date().toISOString().slice(0, 10);

  try {
    await ddb.send(
      new UpdateCommand({
        TableName: process.env.CONTACT_TABLE_NAME,

        Key: {
          PK: `RATE#${identifier}#${today}`,
        },

        UpdateExpression:
          "SET #count = if_not_exists(#count, :zero) + :one",

        ConditionExpression:
          "attribute_not_exists(#count) OR #count < :limit",

        ExpressionAttributeNames: {
          "#count": "count",
        },

        ExpressionAttributeValues: {
          ":zero": 0,
          ":one": 1,
          ":limit": limit,
        },
      })
    );

    return true;
  } catch (error: any) {
    if (error.name === "ConditionalCheckFailedException") {
      return false;
    }

    throw error;
  }
}