import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { contacts, prompt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a B2B customer segmentation expert. Analyze the provided contact data and create 3-5 distinct customer segments.

For each segment, provide:
1. A clear, descriptive name
2. A one-sentence description
3. The number of contacts in the segment
4. An estimated conversion rate (based on engagement signals if provided)
5. A "why" explanation for why this segment is valuable
6. Key traits (roles, industries, company stages, locations, tech stack)
7. List of email addresses in this segment

Return JSON in this exact format:
{
  "segments": [
    {
      "id": "segment-1",
      "name": "Fintech Operations Leaders",
      "description": "VP/Director-level ops leaders at Series B+ fintech companies in West Africa",
      "size": 4,
      "conversionRate": 65,
      "whyExplanation": "3x higher engagement due to recent funding and expansion plans",
      "traits": {
        "roles": ["VP Operations", "Director"],
        "industries": ["Fintech", "Payments"],
        "companyStages": ["Series B", "Series C"],
        "locations": ["Lagos", "Accra"],
        "techStack": ["Salesforce", "HubSpot"],
        "engagementLevel": "high"
      },
      "contacts": ["email1@example.com", "email2@example.com"]
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
          { role: "user", content: `${prompt || "Analyze these contacts:"}\n\nContact Data:\n${JSON.stringify(contacts, null, 2)}` }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const segments = JSON.parse(content);

    return new Response(JSON.stringify(segments), {
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
