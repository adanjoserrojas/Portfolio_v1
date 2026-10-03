import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { handleContact } from "@/lib/contact/handler";
import { verifyTurnstile } from "@/lib/contact/security";
import { checkRateLimit } from "@/lib/rateLimit";
import { getHashedVisitorId, getHashedIp } from "@/lib/visitorIdentity";

export const runtime = "nodejs";
const client = new SNSClient({ region: process.env.AWS_REGION });

export async function POST(request: Request) {
  return handleContact(request, {
    hashedIp: getHashedIp,
    visitorId: getHashedVisitorId,
    limit: checkRateLimit,
    verify: verifyTurnstile,
    publish: async ({ name, contact, message }, topicArn) => {
      await client.send(new PublishCommand({
        TopicArn: topicArn,
        Subject: `${name} has sent you a message from portfolio!`,
        Message: `From: ${name}\nEmail: ${contact}\n\n${message}`,
      }));
    },
  });
}
