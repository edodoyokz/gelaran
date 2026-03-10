// lib/email/client.ts
// Email service using Resend

import { Resend } from "resend";
import { getServerEnv } from "@/lib/env";

const env = getServerEnv();

export const resend = new Resend(env.RESEND_API_KEY);

// From address
export const FROM_EMAIL = env.EMAIL_FROM;
