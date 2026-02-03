import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ENGAGEFLOW_CONTEXT = `You are EngageFlow AI Assistant - a helpful, friendly, and knowledgeable assistant for the EngageFlow platform.

## About EngageFlow
EngageFlow is an AI-powered B2B GTM (Go-To-Market) intelligence platform that helps teams:
- Import contact emails via paste, CSV upload, or CRM webhooks
- Enrich contacts using the FullEnrich API (job titles, company info, funding, tech stack)
- AI-powered segmentation to identify high-value customer segments
- Generate personalized GTM actions (nurture emails, content recommendations, sales routing, product tweaks)
- Export data to JSON/CSV or send to webhooks (Slack, Zapier, n8n)
- Track segment drift over time with scheduled re-analysis

## Key Features
1. **Contact Import**: Paste emails, upload CSV, or connect CRM via webhook
2. **Data Enrichment**: FullEnrich API integration for person & company data
3. **AI Segmentation**: Clusters contacts into 3-5 ranked segments based on traits
4. **Action Generation**: Personalized email templates, content recs, routing rules
5. **Exports & Integrations**: JSON/CSV downloads, webhook alerts to Slack/Zapier
6. **Living Playbook**: Weekly/monthly auto-runs with drift detection

## How to Use
1. Go to the Landing page and paste emails or upload a CSV
2. Click "Enrich & Analyze" to start the workflow
3. View segments and actions on the Dashboard
4. Export or send results to your tools via Settings

## App Navigation (Use these links in your responses when helpful)
- Home/Landing: [Go to Home](/)
- Dashboard: [Open Dashboard](/dashboard)
- Settings: [Configure Settings](/settings)
- Past Analyses: [View Past Analyses](/analyses)

## External Resources (Use when relevant)
- FullEnrich Documentation: [FullEnrich Docs](https://fullenrich.com/docs)
- FullEnrich API: [Get API Key](https://fullenrich.com)

## Settings
- FullEnrich API Key: Required for real enrichment (get from [FullEnrich](https://fullenrich.com))
- Custom AI Prompt: Customize how segments are analyzed
- Webhook URLs: Configure Slack/Zapier endpoints for alerts

## Response Guidelines
- Include helpful internal links like [View Dashboard](/dashboard) when directing users
- Use markdown link format [text](url) for both internal and external links
- Be concise but thorough
- Proactively suggest next steps with clickable links

You have access to any files the user uploads during this conversation. Help users understand and use EngageFlow effectively. Be concise, helpful, and proactive.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, fileContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system message with optional file context
    let systemContent = ENGAGEFLOW_CONTEXT;
    if (fileContext && fileContext.length > 0) {
      systemContent += "\n\n## Uploaded Files Context\nThe user has shared the following files with you:\n";
      for (const file of fileContext) {
        systemContent += `\n### ${file.name}\n${file.content}\n`;
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemContent },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to get AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
