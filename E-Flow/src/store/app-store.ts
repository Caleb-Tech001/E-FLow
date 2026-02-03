import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { EnrichedContact, Segment, GTMAction, AppSettings } from '@/types';

interface AppState {
  // Input data
  emails: string[];
  engagementData: Record<string, string | number>;
  
  // Processing state
  isProcessing: boolean;
  processingStep: 'idle' | 'enriching' | 'analyzing' | 'generating';
  progress: number;
  
  // Results
  enrichedContacts: EnrichedContact[];
  segments: Segment[];
  actions: GTMAction[];
  
  // Settings
  settings: AppSettings;
  
  // History
  currentRunId: string | null;
  previousRunSegments: Segment[] | null;
  
  // Actions
  setEmails: (emails: string[]) => void;
  setEngagementData: (data: Record<string, string | number>) => void;
  setProcessing: (isProcessing: boolean) => void;
  setProcessingStep: (step: 'idle' | 'enriching' | 'analyzing' | 'generating') => void;
  setProgress: (progress: number) => void;
  setEnrichedContacts: (contacts: EnrichedContact[]) => void;
  setSegments: (segments: Segment[]) => void;
  setActions: (actions: GTMAction[]) => void;
  setSettings: (settings: Partial<AppSettings>) => void;
  setCurrentRunId: (id: string | null) => void;
  setPreviousRunSegments: (segments: Segment[] | null) => void;
  reset: () => void;
}

const defaultSettings: AppSettings = {
  fullEnrichApiKey: '',
  aiPrompt: 'Cluster enriched user data into 3-5 segments focused on B2B traits like role, company size, funding, location (e.g., Lagos/Nigeria/Africa), tech stack. Prioritize high-engagement if provided. Output ranked segments with descriptions, stats, and reasons.',
  scheduleFrequency: 'none',
  alertWebhook: '',
  slackWebhook: '',
  zapierWebhook: ''
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      emails: [],
      engagementData: {},
      isProcessing: false,
      processingStep: 'idle',
      progress: 0,
      enrichedContacts: [],
      segments: [],
      actions: [],
      settings: defaultSettings,
      currentRunId: null,
      previousRunSegments: null,
      
      setEmails: (emails) => set({ emails }),
      setEngagementData: (data) => set({ engagementData: data }),
      setProcessing: (isProcessing) => set({ isProcessing }),
      setProcessingStep: (step) => set({ processingStep: step }),
      setProgress: (progress) => set({ progress }),
      setEnrichedContacts: (contacts) => set({ enrichedContacts: contacts }),
      setSegments: (segments) => set({ segments }),
      setActions: (actions) => set({ actions }),
      setSettings: (settings) => set((state) => ({ 
        settings: { ...state.settings, ...settings } 
      })),
      setCurrentRunId: (id) => set({ currentRunId: id }),
      setPreviousRunSegments: (segments) => set({ previousRunSegments: segments }),
      reset: () => set({
        emails: [],
        engagementData: {},
        isProcessing: false,
        processingStep: 'idle',
        progress: 0,
        enrichedContacts: [],
        segments: [],
        actions: [],
        currentRunId: null
      })
    }),
    {
      name: 'engageflow-storage',
      partialize: (state) => ({
        settings: state.settings,
        previousRunSegments: state.previousRunSegments
      })
    }
  )
);
