# Contact delivery

For release configuration and security controls, follow
[Contact security setup](contact-security-setup.md).

The form validates a name, email address, and message in the browser and again
in `POST /api/contact`. Email validation checks format, not mailbox ownership or
whether the mailbox exists. After the existing visitor and IP rate limits pass,
the route publishes a plain-text notification to Amazon SNS.

## AWS and Vercel setup

1. Create a dedicated **Standard** SNS topic in your AWS region. Subscribe only
   your own inbox using the **Email** protocol, then confirm the subscription
   using the email AWS sends. SNS sends to every subscription on the topic, so
   keep this topic private to your inbox to match the privacy policy.
2. Set `CONTACT_TOPIC_ARN` and `AWS_REGION` in Vercel Preview and Production.
   The topic and client must use the same region. Also configure the allowed origins
   and Turnstile keys described in the security setup guide. Redeploy after changing env vars.
3. Give the server's AWS identity `sns:Publish` permission on this topic ARN.
   Keep the existing DynamoDB permission and `CONTACT_TABLE_NAME`,
   `RATE_LIMIT_SECRET`, and server-side AWS credentials used by the rate limiter.
   Never expose these settings using a `NEXT_PUBLIC_` prefix.
4. The contact route no longer uses `MY_PHONE_NUMBER` or `AWS_PHONE_NUMBER`.

The topic is selected on the server. Visitors cannot supply a recipient.
A 200 response means SNS accepted the notification, not that the email arrived.
Dependency failures return 503; exhausted submission limits return 429. An attempt
that passes a counter check can consume quota even if a later check or delivery
fails. Malformed JSON and invalid form fields return 400 before consuming quota.
Untrusted origins or failed challenges return 403, unsupported request formats
return 415, oversized bodies return 413, and slow body reads return 408. Honeypot
submissions receive a success response but are discarded without notifications.

References: [SNS email notifications](https://docs.aws.amazon.com/sns/latest/dg/sns-email-notifications.html)
and [Publish API](https://docs.aws.amazon.com/sns/latest/api/API_Publish.html).
