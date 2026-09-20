import sgMail from "@sendgrid/mail";

const apiKey = process.env.SENDGRID_API_KEY;

if (apiKey) {
  sgMail.setApiKey(apiKey);
}

export async function sendDailyBrief(
  toEmail: string,
  htmlContent: string,
  stats: { overdue: number; dueToday: number; comingUp: number }
) {
  if (!apiKey) {
    console.error("SendGrid API key not configured");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const subject = `Daily Brief: ${stats.overdue} overdue, ${stats.dueToday} due today`;

    const msg = {
      to: toEmail,
      from: process.env.SENDGRID_FROM_EMAIL || "noreply@recall-ai.com",
      subject,
      html: htmlContent,
      trackingSettings: {
        clickTracking: {
          enable: true,
          enableText: false,
        },
        openTracking: {
          enable: true,
        },
      },
    };

    await sgMail.send(msg);

    return {
      success: true,
      email: toEmail,
      subject,
    };
  } catch (error) {
    console.error("SendGrid error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function sendTestEmail(toEmail: string) {
  if (!apiKey) {
    console.error("SendGrid API key not configured");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const msg = {
      to: toEmail,
      from: process.env.SENDGRID_FROM_EMAIL || "noreply@recall-ai.com",
      subject: "Test Email - Recall AI",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>✨ Test Email from Recall AI</h2>
          <p>This is a test email to verify SendGrid integration is working.</p>
          <p style="color: #16a34a; font-weight: bold;">Email sending is configured and ready!</p>
        </div>
      `,
    };

    await sgMail.send(msg);

    return {
      success: true,
      email: toEmail,
      message: "Test email sent successfully",
    };
  } catch (error) {
    console.error("SendGrid test email error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
