import { z } from "zod";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

import {
  checkRateLimit,
} from "@/lib/rateLimit";

import {
    getHashedVisitorId,
    getHashedIp,
} from "@/lib/visitorIdentity";

import { ddb } from "@/lib/dynamo/dynamo";

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

        const hashedVisitorId = getHashedVisitorId();
        const hashedIp = getHashedIp(request);

        console.log("Visitor:", hashedVisitorId);
        console.log("IP:", hashedIp);

        const visitorAllowed = await checkRateLimit(
            `VISITOR#${hashedVisitorId}`,
            3,
        );

        if (!visitorAllowed){
            return Response.json(
                {error: "Too many request from this user!"},
                { status: 429 }, 
            );
        }

        const IpAllowed = await checkRateLimit(
            `IP#${hashedIp}`,
            20,
        );

        if (!IpAllowed){
            return Response.json(
                {error: "Too many request from this network!"},
                { status: 429 }, 
            );
        }

        const { name, contact, message } = result.data;

        console.log("Received form:");
        console.log(result.data);

        await ddb.send(
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