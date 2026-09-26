import { z } from "zod";
import { PinpointSMSVoiceV2Client, SendTextMessageCommand } from "@aws-sdk/client-pinpoint-sms-voice-v2";

import {
  checkRateLimit,
} from "@/lib/rateLimit";

import {
    getHashedVisitorId,
    getHashedIp,
} from "@/lib/visitorIdentity";

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

        const hashedVisitorId = await getHashedVisitorId();
        const hashedIp = getHashedIp(request);

        // console.log("Visitor:", hashedVisitorId);
        // console.log("IP:", hashedIp);

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

        // console.log("Received form:");
        /// console.log(result.data);

        const config = {
            region: process.env.AWS_REGION,
        };
        const client = new PinpointSMSVoiceV2Client(config);
        const input = {
            DestinationPhoneNumber: process.env.MY_PHONE_NUMBER,
            OriginationIdentity: "portfolio",
            MessageBody: 
                `From your portfolio. ${name} has sent you a message.\n
                \t${message}\n
                their contact is: ${contact}`,
            TimeToLive: Number("24"),
        };
        const command = new SendTextMessageCommand(input);
        const response = await client.send(command);

        return Response.json(
            {
                sucess: true,
                received: response.MessageId,
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("FULL SMS error:", error);
        return Response.json(
            {
                success: false,
                error: "Could not send your message. Please try again later!",
            },
            { status: 500 }
        );
    }
}