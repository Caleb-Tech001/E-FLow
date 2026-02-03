import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AlertPayload {
  webhookUrl: string;
  analysisId: string;
  segments: Array<{
    name: string;
    size: number;
    conversionRate?: number;
  }>;
  previousSegments?: Array<{
    name: string;
    size: number;
  }>;
  emailsCount: number;
  timestamp: string;
}

interface DriftChange {
  type: "new" | "removed" | "changed";
  segmentName: string;
  details: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json() as AlertPayload;
    console.log("Alert payload received:", JSON.stringify(payload).slice(0, 500));

    const { webhookUrl, analysisId, segments, previousSegments, emailsCount, timestamp } = payload;

    if (!webhookUrl) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "No webhook URL provided" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate drift/changes if previous segments exist
    const changes: DriftChange[] = [];
    
    if (previousSegments && previousSegments.length > 0) {
      const prevNames = new Set(previousSegments.map(s => s.name));
      const currNames = new Set(segments.map(s => s.name));
      
      // New segments
      for (const seg of segments) {
        if (!prevNames.has(seg.name)) {
          changes.push({
            type: "new",
            segmentName: seg.name,
            details: `New segment detected with ${seg.size} contacts`
          });
        }
      }
      
      // Removed segments
      for (const seg of previousSegments) {
        if (!currNames.has(seg.name)) {
          changes.push({
            type: "removed",
            segmentName: seg.name,
            details: `Segment no longer detected (had ${seg.size} contacts)`
          });
        }
      }
      
      // Size changes
      for (const seg of segments) {
        const prevSeg = previousSegments.find(p => p.name === seg.name);
        if (prevSeg) {
          const changePercent = ((seg.size - prevSeg.size) / prevSeg.size * 100).toFixed(1);
          if (Math.abs(Number(changePercent)) >= 10) {
            changes.push({
              type: "changed",
              segmentName: seg.name,
              details: `Size changed by ${Number(changePercent) > 0 ? '+' : ''}${changePercent}% (${prevSeg.size} → ${seg.size})`
            });
          }
        }
      }
    }

    // Build the alert message
    const topSegments = segments.slice(0, 3).map(s => 
      `• ${s.name}: ${s.size} contacts${s.conversionRate ? ` (${s.conversionRate}% conv.)` : ''}`
    ).join('\n');

    const driftSummary = changes.length > 0 
      ? `\n\n🔄 **Changes Detected:**\n${changes.map(c => 
          `${c.type === 'new' ? '🆕' : c.type === 'removed' ? '❌' : '📊'} ${c.details}`
        ).join('\n')}`
      : '';

    const alertMessage = {
      // Generic webhook format
      event: "analysis_complete",
      analysis_id: analysisId,
      timestamp: timestamp,
      summary: {
        total_contacts: emailsCount,
        segments_count: segments.length,
        top_segment: segments[0]?.name || "N/A",
        has_drift: changes.length > 0,
        changes_count: changes.length
      },
      segments: segments,
      changes: changes,
      
      // Slack-compatible format (if it's a Slack webhook)
      text: `📊 *EngageFlow Analysis Complete*\n\nAnalyzed ${emailsCount} contacts → ${segments.length} segments\n\n*Top Segments:*\n${topSegments}${driftSummary}\n\n🔗 View full report: Analysis #${analysisId.slice(0, 8).toUpperCase()}`
    };

    console.log("Sending alert to:", webhookUrl);

    // Send to the webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(alertMessage),
    });

    // For Slack/Zapier webhooks, they often return 200 with no body
    const responseText = await response.text();
    console.log("Webhook response:", response.status, responseText.slice(0, 200));

    if (!response.ok && response.status !== 200) {
      console.error("Webhook failed:", response.status);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Webhook returned ${response.status}`,
        details: responseText.slice(0, 200)
      }), {
        status: 200, // Return 200 to client anyway - don't fail the analysis
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: "Alert sent successfully",
      changes_detected: changes.length
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Alert error:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 200, // Return 200 to not fail the main flow
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
