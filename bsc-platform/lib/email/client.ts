// lib/email/client.ts
// Email service using Resend

import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

// From address
export const FROM_EMAIL = process.env.EMAIL_FROM || "BSC Events <noreply@bsc.id>";
