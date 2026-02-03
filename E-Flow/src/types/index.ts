export interface EnrichedContact {
  email: string;
  engagementScore?: string | number;
  person?: {
    name?: string;
    jobTitle?: string;
    seniority?: string;
    linkedinUrl?: string;
    careerHistory?: string[];
    recentPromotions?: string[];
  };
  company?: {
    name?: string;
    size?: string;
    industry?: string;
    vertical?: string;
    fundingStage?: string;
    fundingAmount?: string;
    fundingDate?: string;
    location?: string;
    country?: string;
    revenueEstimate?: string;
  };
  techStack?: string[];
  signals?: {
    recentNews?: string[];
    funding?: string;
    expansion?: string;
    linkedinInsights?: string;
  };
}

export interface Segment {
  id: string;
  name: string;
  description: string;
  size: number;
  conversionRate?: number;
  whyExplanation: string;
  traits: {
    roles?: string[];
    industries?: string[];
    companyStages?: string[];
    locations?: string[];
    techStack?: string[];
    engagementLevel?: string;
  };
  contacts: string[];
}

export interface GTMAction {
  segmentId: string;
  nurtureEmails: {
    subject: string;
    body: string;
    personalizationTip: string;
  }[];
  contentRecs: {
    title: string;
    type: string;
    reason: string;
  }[];
  salesRouting: {
    rule: string;
    assignTo: string;
  }[];
  productTweaks: {
    suggestion: string;
    priority: string;
  }[];
}

export interface AnalysisRun {
  id: string;
  created_at: string;
  updated_at: string;
  status: 'pending' | 'enriching' | 'analyzing' | 'completed' | 'failed';
  emails_count: number;
  enriched_data: EnrichedContact[] | null;
  segments: Segment[] | null;
  actions: GTMAction[] | null;
  settings: {
    fullEnrichApiKey?: string;
    aiPrompt?: string;
    scheduleFrequency?: string;
    alertWebhook?: string;
  } | null;
  error_message: string | null;
}

export interface AppSettings {
  fullEnrichApiKey: string;
  aiPrompt: string;
  scheduleFrequency: 'none' | 'weekly' | 'monthly';
  alertWebhook: string;
  slackWebhook: string;
  zapierWebhook: string;
}
