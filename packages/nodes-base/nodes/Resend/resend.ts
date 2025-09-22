import { Resend } from "resend";

interface EmailParams {
  from?: string;
  to?: string | string[];
  subject?: string;
  html?: string;
}

export class ResendEmailService {
  private resend: Resend;
  constructor(private apiKey: string) {
    if (!apiKey) {
      throw new Error("API key is required");
    }
    this.resend = new Resend(apiKey);
  }

  sendEmail = async ({ from, to, subject, html }: EmailParams) => {
    console.log("Sending email...");
    const { data, error } = await this.resend.emails.send({
      from: from || "Acme <onboarding@resend.dev>",
      to: to || ["krishjain1712@gmail.com"],
      subject: subject || "hello world",
      html: html || "<strong>I have gut feelign!</strong>",
    });

    console.log("Email send attempt finished.");
    console.log("response data:", { data, error });

    if (error) {
      return {
        success: false,
        error,
      };
    }
    return {
      success: true,
      data,
    };
  };
}
