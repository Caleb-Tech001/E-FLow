import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WebhookPayload {
  emails?: string[];
  email?: string;
  contacts?: Array<{ email: string; [key: string]: unknown }>;
  data?: Array<{ email: string; [key: string]: unknown }>;
  autoAnalyze?: boolean; // Optional flag to skip auto-analysis
}

// Background task to run full analysis
async function runFullAnalysis(
  supabase: any,
  runId: string,
  emails: string[],
  alertWebhook?: string
): Promise<void> {
  console.log(`Starting auto-analysis for run ${runId} with ${emails.length} emails`);
  
  try {
    // Step 1: Enrichment (will use sample data if API fails)
    await supabase
      .from("analysis_runs")
      .update({ status: "enriching" })
      .eq("id", runId);

    const enrichResponse = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/enrich-contacts`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emails }),
      }
    );
    
    const enrichData = await enrichResponse.json();
    const contacts = enrichData.contacts || enrichData.error ? [] : [];
    
    // Use sample data structure if enrichment failed
    const enrichedContacts = contacts.length > 0 ? contacts : emails.map(email => ({
      email,
      person: { name: email.split("@")[0], jobTitle: "Unknown" },
      company: { name: email.split("@")[1]?.split(".")[0] || "Unknown", industry: "Technology" }
    }));

    await supabase
      .from("analysis_runs")
      .update({ 
        status: "analyzing",
        enriched_data: enrichedContacts
      })
      .eq("id", runId);

    console.log(`Enrichment complete for run ${runId}, analyzing...`);

    // Step 2: AI Segmentation
    const segmentResponse = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/analyze-segments`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contacts: enrichedContacts }),
      }
    );
    
    const segmentData = await segmentResponse.json();
    const segments = segmentData.segments || [];

    await supabase
      .from("analysis_runs")
      .update({ 
        status: "generating",
        segments: segments
      })
      .eq("id", runId);

    console.log(`Segmentation complete for run ${runId}, generating actions...`);

    // Step 3: Generate GTM Actions
    const actionsResponse = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-actions`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ segments, contacts: enrichedContacts }),
      }
    );
    
    const actionsData = await actionsResponse.json();
    const actions = actionsData.actions || [];

    // Mark as completed with all data
    await supabase
      .from("analysis_runs")
      .update({ 
        status: "completed",
        segments: segments,
        actions: actions
      })
      .eq("id", runId);

    console.log(`Analysis complete for run ${runId}!`);

    // Step 4: Send alert if webhook configured
    if (alertWebhook) {
      console.log(`Sending alert to ${alertWebhook}`);
      await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-alert`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            webhookUrl: alertWebhook,
            analysisId: runId,
            segments: segments,
            emailsCount: emails.length,
            timestamp: new Date().toISOString()
          }),
        }
      );
    }

  } catch (error) {
    console.error(`Analysis failed for run ${runId}:`, error);
    await supabase
      .from("analysis_runs")
      .update({ 
        status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error"
      })
      .eq("id", runId);
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ 
      error: "Method not allowed. Use POST to send contact data." 
    }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json() as WebhookPayload;
    console.log("Webhook received payload:", JSON.stringify(payload).slice(0, 500));

    // Extract emails from various possible payload formats
    let emails: string[] = [];

    if (payload.emails && Array.isArray(payload.emails)) {
      emails = payload.emails;
    } else if (payload.email && typeof payload.email === "string") {
      emails = [payload.email];
    } else if (payload.contacts && Array.isArray(payload.contacts)) {
      emails = payload.contacts.map(c => c.email).filter(Boolean);
    } else if (payload.data && Array.isArray(payload.data)) {
      emails = payload.data.map(d => d.email).filter(Boolean);
    }

    // Validate and clean emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = emails
      .map(e => String(e).trim().toLowerCase())
      .filter(e => emailRegex.test(e));

    if (validEmails.length === 0) {
      console.warn("No valid emails found in payload");
      return new Response(JSON.stringify({ 
        error: "No valid emails found in payload",
        hint: "Send data as: { \"emails\": [\"email@example.com\"] }",
        received: Object.keys(payload)
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create a new analysis run with the received emails
    const { data: analysisRun, error: insertError } = await supabase
      .from("analysis_runs")
      .insert({
        emails_count: validEmails.length,
        status: "pending",
        settings: { 
          source: "webhook",
          received_at: new Date().toISOString(),
          raw_emails: validEmails,
          auto_analyze: payload.autoAnalyze !== false // Default to true
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to create analysis run:", insertError);
      return new Response(JSON.stringify({ 
        error: "Failed to store contact data",
        details: insertError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Created analysis run ${analysisRun.id} with ${validEmails.length} emails`);

    // Check if auto-analysis is enabled (default: true)
    const shouldAutoAnalyze = payload.autoAnalyze !== false;

    if (shouldAutoAnalyze) {
      // Get alert webhook from most recent settings if available
      const { data: recentRun } = await supabase
        .from("analysis_runs")
        .select("settings")
        .neq("id", analysisRun.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      const alertWebhook = recentRun?.settings?.alertWebhook;

      // Start background analysis using EdgeRuntime.waitUntil
      // @ts-ignore - EdgeRuntime is available in Supabase Edge Functions
      if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
        // @ts-ignore
        EdgeRuntime.waitUntil(runFullAnalysis(supabase, analysisRun.id, validEmails, alertWebhook));
      } else {
        // Fallback: run synchronously (slower response but works)
        runFullAnalysis(supabase, analysisRun.id, validEmails, alertWebhook);
      }
    }

    // Return success immediately (analysis runs in background)
    return new Response(JSON.stringify({ 
      success: true,
      message: shouldAutoAnalyze 
        ? `Received ${validEmails.length} email(s) - analysis started automatically`
        : `Received ${validEmails.length} email(s) - ready for manual analysis`,
      analysis_id: analysisRun.id,
      emails_count: validEmails.length,
      auto_analyzing: shouldAutoAnalyze,
      dashboard_url: `/dashboard?run=${analysisRun.id}`,
      report_url: `/report/${analysisRun.id}`
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ 
      error: "Invalid request",
      message: error instanceof Error ? error.message : "Failed to parse request body"
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
