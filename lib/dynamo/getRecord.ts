// lib/getProduct.ts
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "./dynamo";

export interface RecordItems {
  location_code: string;
  status: string;
  workout: string;
  actual_duration_minutes: number;
}

export async function getRecords(pk: string): Promise<RecordItems[]> {

    const items: RecordItems[] = [];
    let lastKey: Record<string, unknown> | undefined;

    do {
        const result = await ddb.send(
            new QueryCommand({
            TableName: process.env.DYNAMO_TABLE_NAME,
            KeyConditionExpression: "PK = :val",
            ExpressionAttributeValues: { ":val": pk },
            ProjectionExpression: "location_code, #s, workout, actual_duration_minutes",
            ExpressionAttributeNames: { "#s": "status" }, // status is a reserved word
            ExclusiveStartKey: lastKey,
            })
        );
        items.push(...((result.Items ?? []) as RecordItems[]));
        lastKey = result.LastEvaluatedKey;
    } while (lastKey);

    return items;
}