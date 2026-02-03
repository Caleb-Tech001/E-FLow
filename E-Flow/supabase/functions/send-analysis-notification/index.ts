import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  email: string;
  reportId: string;
  reportUrl: string;
  segmentsCount: number;
  contactsCount: number;
  shortId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured, skipping email notification");
      return new Response(
        JSON.stringify({ success: false, message: "Email notifications not configured" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { email, reportId, reportUrl, segmentsCount, contactsCount, shortId }: NotificationRequest = await req.json();

    if (!email || !reportId || !reportUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, reportId, reportUrl" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send email using Resend API directly via fetch
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "EngageFlow <notifications@engageflow.io>",
        to: [email],
        subject: `Your Analysis Report #${shortId} is Ready!`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">✨ Analysis Complete!</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="font-size: 16px; margin-bottom: 20px;">
                Great news! Your EngageFlow analysis has finished processing.
              </p>
              
              <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
                <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #6366f1;">Report Summary</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Report ID:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600;">#${shortId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Contacts Analyzed:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600;">${contactsCount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Segments Found:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600;">${segmentsCount}</td>
                  </tr>
                </table>
              </div>
              
              <a href="${reportUrl}" style="display: block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 24px; border-radius: 8px; text-align: center; font-weight: 600; font-size: 16px;">
                View Full Report →
              </a>
              
              <p style="margin-top: 25px; font-size: 14px; color: #6b7280; text-align: center;">
                You can also download your report as a PDF from the report page.
              </p>
            </div>
            
            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af; text-align: center;">
              This email was sent by EngageFlow. You received this because you ran an analysis.
            </p>
          </body>
          </html>
        `,
      }),
    });

    const emailResult = await emailResponse.json();
    
    if (!emailResponse.ok) {
      console.error("Resend API error:", emailResult);
      return new Response(
        JSON.stringify({ success: false, error: emailResult.message || "Failed to send email" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Email notification sent successfully:", emailResult);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResult.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
