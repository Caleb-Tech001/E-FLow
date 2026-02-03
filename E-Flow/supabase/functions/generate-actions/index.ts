import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { segments, contacts } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a B2B GTM strategist. For each customer segment, generate personalized go-to-market actions.

For each segment, create:
1. 2-3 nurture email templates (subject, body, personalization tip)
2. 2-3 content recommendations (title, type, reason)
3. 2-3 sales routing rules (rule, assignTo)
4. 2-3 product tweaks (suggestion, priority: high/medium/low)

Reference specific details from the segment (funding, news, tech stack) in your recommendations.

Return JSON:
{
  "actions": [
    {
      "segmentId": "segment-1",
      "nurtureEmails": [
        {"subject": "...", "body": "...", "personalizationTip": "..."}
      ],
      "contentRecs": [
        {"title": "...", "type": "Guide", "reason": "..."}
      ],
      "salesRouting": [
        {"rule": "If VP-level", "assignTo": "Senior SDR"}
      ],
      "productTweaks": [
        {"suggestion": "...", "priority": "high"}
      ]
    }
  ]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate GTM actions for these segments:\n\n${JSON.stringify(segments, null, 2)}\n\nContact context:\n${JSON.stringify(contacts.slice(0, 5), null, 2)}` }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) throw new Error(`AI error: ${response.status}`);

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const actions = JSON.parse(content);

    return new Response(JSON.stringify(actions), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
