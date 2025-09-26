import { render, toPlainText } from "@react-email/render";
import type { ReactElement } from "react";
import { usesend } from "./usesend";

interface EmailOptions {
  to: string;
  subject: string;
  reactComponent: ReactElement;
  from?: string;
  retries?: number;
  retryDelay?: number;
}

export class EmailService {
  private static readonly DEFAULT_FROM = "MC-ID <no-reply@mc-id.com>";
  private static readonly DEFAULT_RETRIES = 3;
  private static readonly DEFAULT_RETRY_DELAY = 1000; // 1 second

  static async sendEmail({ to, subject, reactComponent, from = EmailService.DEFAULT_FROM, retries = EmailService.DEFAULT_RETRIES, retryDelay = EmailService.DEFAULT_RETRY_DELAY }: EmailOptions): Promise<{ success: boolean; error?: string }> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const html = await render(reactComponent);
        const text = toPlainText(html);

        const result = await usesend.emails.send({
          to,
          from,
          subject,
          react: reactComponent,
          html,
          text
        });

        console.log(`Email sent successfully to ${to} (attempt ${attempt}):`, result);
        return { success: true };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.error(`Email send attempt ${attempt}/${retries} failed for ${to}:`, lastError);

        if (attempt < retries) {
          // Exponential backoff with jitter
          const delay = retryDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || "Unknown error occurred while sending email"
    };
  }

  static async sendVerificationEmail(email: string, verifyUrl: string, baseUrl: string) {
    const { VerifyEmail } = await import("$lib/emails/EmailVerify");

    return EmailService.sendEmail({
      to: email,
      subject: "Verify your MC-ID email address",
      reactComponent: VerifyEmail({ verifyUrl, baseUrl })
    });
  }

  static async sendPasswordResetEmail(email: string, resetUrl: string, baseUrl: string) {
    const { ResetPassword } = await import("$lib/emails/ResetPassword");

    return EmailService.sendEmail({
      to: email,
      subject: "Reset your MC-ID password",
      reactComponent: ResetPassword({ resetUrl, baseUrl })
    });
  }
}
