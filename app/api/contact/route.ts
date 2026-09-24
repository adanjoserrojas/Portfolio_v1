import { z } from "zod";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
});
const db = DynamoDBDocumentClient.from(client);
const ContactSchema = z.object({
    name: z.string().trim().min(1).max(100),
    contact: z.string().min(10).max(50),
    message: z.string().trim().min(1).max(2000),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = ContactSchema.safeParse(body);

        if (!result.success) {
            return Response.json(
                {
                    success: false,
                    error: "Invalid data",
                },
                { status: 400 }
            );
        }

        const { name, contact, message } = result.data;

        console.log("Received form:");
        console.log(result.data);

        await db.send(
            new PutCommand({
                TableName: process.env.CONTACT_TABLE_NAME,
                Item: {
                    PK: `CONTACT#${crypto.randomUUID()}`,
                    SK: `MESSAGE#${new Date().toISOString()}`,
                    name,
                    contact,
                    message,
                }
            })
        )

        return Response.json(
            {
                sucess: true,
                received: result.data,
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("FULL DYNAMODB ERROR:", error);
        return Response.json(
            {
                success: false,
                error: "Invalid request",
            },
            { status: 500 }
        );
    }
}