import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EnrichmentRequest {
  emails: string[];
}

interface FullEnrichPerson {
  full_name?: string;
  job_title?: string;
  seniority?: string;
  linkedin_url?: string;
}

interface FullEnrichCompany {
  name?: string;
  size?: string;
  industry?: string;
  funding_stage?: string;
  funding_amount?: string;
  location?: string;
  country?: string;
}

interface FullEnrichResult {
  email: string;
  person?: FullEnrichPerson;
  company?: FullEnrichCompany;
  technologies?: string[];
  signals?: {
    recent_news?: string[];
    funding?: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emails } = await req.json() as EnrichmentRequest;
    
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      throw new Error("No emails provided");
    }

    const FULLENRICH_API_KEY = Deno.env.get("FULLENRICH_API_KEY");
    if (!FULLENRICH_API_KEY) {
      throw new Error("FULLENRICH_API_KEY not configured. Please add your API key in Settings.");
    }

    console.log(`Starting enrichment for ${emails.length} emails`);

    let response: Response;
    try {
      // FullEnrich API - Batch enrichment endpoint
      // Documentation: https://docs.fullenrich.com/api
      response = await fetch("https://api.fullenrich.com/v1/enrich/batch", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${FULLENRICH_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emails: emails,
          fields: [
            "person.full_name",
            "person.job_title", 
            "person.seniority",
            "person.linkedin_url",
            "company.name",
            "company.size",
            "company.industry",
            "company.funding_stage",
            "company.funding_amount",
            "company.location",
            "company.country",
            "technologies",
            "signals"
          ]
        }),
      });
    } catch (networkError) {
      // Network error (DNS failure, timeout, etc.) - return graceful fallback
      console.warn("FullEnrich API unreachable:", networkError);
      return new Response(JSON.stringify({ 
        error: "FullEnrich API is currently unreachable. Using sample data for demo.",
        useSampleData: true
      }), {
        status: 200, // Return 200 so frontend handles gracefully
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("FullEnrich API error:", response.status, errorText);
      
      // Handle specific error cases - return 200 with error message for graceful handling
      let errorMessage = `FullEnrich API error: ${response.status}`;
      if (response.status === 401) {
        errorMessage = "Invalid FullEnrich API key. Please check your key in Settings.";
      } else if (response.status === 429) {
        errorMessage = "FullEnrich rate limit exceeded. Please try again later.";
      } else if (response.status === 402) {
        errorMessage = "FullEnrich credits exhausted. Please top up your account.";
      }
      
      return new Response(JSON.stringify({ 
        error: errorMessage,
        useSampleData: true
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    console.log(`FullEnrich returned data for ${data.results?.length || 0} contacts`);

    // Transform FullEnrich response to our format
    const enrichedContacts = (data.results || []).map((result: FullEnrichResult) => ({
      email: result.email,
      person: result.person ? {
        name: result.person.full_name,
        jobTitle: result.person.job_title,
        seniority: result.person.seniority,
        linkedinUrl: result.person.linkedin_url,
      } : undefined,
      company: result.company ? {
        name: result.company.name,
        size: result.company.size,
        industry: result.company.industry,
        fundingStage: result.company.funding_stage,
        fundingAmount: result.company.funding_amount,
        location: result.company.location,
        country: result.company.country,
      } : undefined,
      techStack: result.technologies || [],
      signals: result.signals ? {
        recentNews: result.signals.recent_news || [],
        funding: result.signals.funding,
      } : undefined,
    }));

    // For emails not found, include them with minimal data
    const foundEmails = new Set(enrichedContacts.map((c: { email: string }) => c.email));
    const notFoundEmails = emails.filter(email => !foundEmails.has(email));
    
    if (notFoundEmails.length > 0) {
      console.log(`${notFoundEmails.length} emails not found in FullEnrich`);
      notFoundEmails.forEach(email => {
        enrichedContacts.push({ email, notFound: true });
      });
    }

    return new Response(JSON.stringify({ 
      contacts: enrichedContacts,
      stats: {
        total: emails.length,
        enriched: emails.length - notFoundEmails.length,
        notFound: notFoundEmails.length
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Enrichment error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
