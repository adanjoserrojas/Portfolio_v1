import { z } from "zod";

export const ContactSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(100),
  contact: z.string().trim().max(254).email("Enter a valid email address, like name@example.com."),
  message: z.string().trim().min(1, "Enter a message.").max(1600),
});
