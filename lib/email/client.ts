// lib/email/client.ts
// Email service using Resend

import { Resend } from "resend";
import { getEmailEnv } from "@/lib/env";

const env = getEmailEnv();

export const resend = new Resend(env.RESEND_API_KEY);

// From address
export const FROM_EMAIL = env.EMAIL_FROM;
