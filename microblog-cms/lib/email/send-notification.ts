import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface CommentNotificationParams {
  to: string;
  postTitle: string;
  postId: string;
  commentAuthor: string;
  commentContent: string;
}

export async function sendCommentApprovedNotification({
  to,
  postTitle,
  postId,
  commentAuthor,
  commentContent,
}: CommentNotificationParams) {
  if (!resend) {
    console.warn("Resend API key not configured. Skipping email notification.");
    return { success: false, error: "Email service not configured" };
  }

  const postUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/posts/${postId}`;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@microblog.com",
      to,
      subject: `New comment on your post: ${postTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
              .comment { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #3b82f6; }
              .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
              .footer { color: #6b7280; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin: 0;">💬 New Comment on Your Post</h2>
              </div>
              <div class="content">
                <p>Hello!</p>
                <p>A new comment has been approved on your post <strong>"${postTitle}"</strong>.</p>

                <div class="comment">
                  <p><strong>${commentAuthor}</strong> commented:</p>
                  <p>${commentContent}</p>
                </div>

                <a href="${postUrl}" class="button">View Comment</a>

                <div class="footer">
                  <p>This is an automated notification from your Microblog CMS.</p>
                  <p>If you don't want to receive these emails, you can update your notification preferences in your account settings.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
