import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  ArrowLeft, Play, Download, Send, RefreshCw, Settings, 
  Users, Target, Mail, FileText, Zap, AlertCircle, 
  TrendingUp, BarChart3, PieChart
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { generateSampleEnrichedData } from "@/lib/sample-data";
import { SegmentCard } from "@/components/segments/SegmentCard";
import { SegmentCharts } from "@/components/segments/SegmentCharts";
import { ActionsPanel } from "@/components/actions/ActionsPanel";
import { ExportDialog } from "@/components/export/ExportDialog";
import { supabase } from "@/integrations/supabase/client";
import { Segment, GTMAction } from "@/types";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
  
  const {
    emails,
    isProcessing,
    processingStep,
    progress,
    enrichedContacts,
    segments,
    actions,
    settings,
    previousRunSegments,
    setProcessing,
    setProcessingStep,
    setProgress,
    setEnrichedContacts,
    setSegments,
    setActions,
    setPreviousRunSegments,
    setCurrentRunId
  } = useAppStore();

  useEffect(() => {
    if (segments.length > 0 && !activeSegmentId) {
      setActiveSegmentId(segments[0].id);
    }
  }, [segments, activeSegmentId]);

  const runAnalysis = async () => {
    if (emails.length === 0) {
      toast.error("No emails to analyze", {
        description: "Go back and add some emails first"
      });
      return;
    }

    // Generate fresh sample data for this run
    const freshSampleData = generateSampleEnrichedData(10);

    // Save current segments for drift detection
    if (segments.length > 0) {
      setPreviousRunSegments(segments);
    }

    setProcessing(true);
    setProcessingStep('enriching');
    setProgress(0);

    try {
      // Create analysis run in database
      const { data: runData, error: runError } = await supabase
        .from("analysis_runs")
        .insert([{
          status: "enriching",
          emails_count: emails.length,
          settings: JSON.parse(JSON.stringify(settings))
        }])
        .select()
        .single();

      if (runError) throw runError;
      
      const runId = runData.id;
      setCurrentReportId(runId);
      setCurrentRunId(runId);

      // Step 1: Enrichment
      toast.info("Starting enrichment...");
      setProgress(10);

      let enriched;
      
      // Try real enrichment via FullEnrich API
      const { data: enrichData, error: enrichError } = await supabase.functions.invoke('enrich-contacts', {
        body: { emails }
      });

      if (enrichError) {
        console.warn("Enrichment API error, using sample data:", enrichError);
        enriched = freshSampleData.filter(c => emails.includes(c.email));
        if (enriched.length === 0) enriched = freshSampleData;
        toast.warning("Using sample data", {
          description: enrichError.message || "FullEnrich API not configured"
        });
      } else if (enrichData?.error) {
        console.warn("Enrichment error:", enrichData.error);
        enriched = freshSampleData.filter(c => emails.includes(c.email));
        if (enriched.length === 0) enriched = freshSampleData;
        toast.warning("Using sample data", {
          description: enrichData.error
        });
      } else {
        enriched = enrichData?.contacts || [];
        if (enriched.length === 0) {
          enriched = freshSampleData;
        } else {
          toast.success(`Enriched ${enrichData.stats?.enriched || 0} contacts`, {
            description: enrichData.stats?.notFound ? `${enrichData.stats.notFound} not found` : undefined
          });
        }
      }
      
      setEnrichedContacts(enriched);
      setProgress(50);

      // Update run with enriched data
      await supabase
        .from("analysis_runs")
        .update({ 
          status: "analyzing",
          enriched_data: enriched 
        })
        .eq("id", runId);
      
      // Step 2: AI Analysis
      setProcessingStep('analyzing');
      toast.info("Analyzing segments with AI...");
      
      const { data: segmentData, error: segmentError } = await supabase.functions.invoke('analyze-segments', {
        body: { 
          contacts: enriched.length > 0 ? enriched : freshSampleData,
          prompt: settings.aiPrompt
        }
      });

      if (segmentError) throw segmentError;
      setProgress(75);
      
      setSegments(segmentData.segments);

      // Update run with segments
      await supabase
        .from("analysis_runs")
        .update({ 
          status: "generating",
          segments: segmentData.segments 
        })
        .eq("id", runId);
      
      // Step 3: Generate Actions
      setProcessingStep('generating');
      toast.info("Generating GTM actions...");
      
      const { data: actionsData, error: actionsError } = await supabase.functions.invoke('generate-actions', {
        body: { 
          segments: segmentData.segments,
          contacts: enriched.length > 0 ? enriched : freshSampleData
        }
      });

      if (actionsError) throw actionsError;
      setProgress(100);
      
      setActions(actionsData.actions);

      // Update run with actions, segments, and mark as completed
      await supabase
        .from("analysis_runs")
        .update({ 
          status: "completed",
          segments: segmentData.segments,
          actions: actionsData.actions 
        })
        .eq("id", runId);
      
      // Check for drift and build changes
      let hasDrift = false;
      if (previousRunSegments && previousRunSegments.length > 0) {
        const newSegmentNames = segmentData.segments.map((s: Segment) => s.name.toLowerCase());
        const oldSegmentNames = previousRunSegments.map(s => s.name.toLowerCase());
        const newClusters = newSegmentNames.filter((n: string) => !oldSegmentNames.includes(n));
        
        if (newClusters.length > 0) {
          hasDrift = true;
          toast.warning("New segment detected!", {
            description: `Found new cluster: ${newClusters.join(", ")}`
          });
        }
      }

      // Send alert webhook if configured
      if (settings.alertWebhook || settings.zapierWebhook || settings.slackWebhook) {
        const alertWebhookUrl = settings.alertWebhook || settings.zapierWebhook || settings.slackWebhook;
        
        try {
          console.log("Sending analysis alert to:", alertWebhookUrl);
          await supabase.functions.invoke('send-alert', {
            body: {
              webhookUrl: alertWebhookUrl,
              analysisId: runId,
              segments: segmentData.segments.map((s: Segment) => ({
                name: s.name,
                size: s.size,
                conversionRate: s.conversionRate
              })),
              previousSegments: previousRunSegments?.map(s => ({
                name: s.name,
                size: s.size
              })),
              emailsCount: emails.length,
              timestamp: new Date().toISOString()
            }
          });
          toast.info("Alert sent to your webhook");
        } catch (alertError) {
          console.warn("Failed to send alert:", alertError);
          // Don't fail the main flow for alert errors
        }
      }
      
      const shortId = runId.slice(0, 8).toUpperCase();
      toast.success(`Analysis complete! Report ID: ${shortId}`, {
        description: `Found ${segmentData.segments.length} segments. Click to view report.`,
        action: {
          label: "View Report",
          onClick: () => navigate(`/report/${runId}`)
        }
      });
      
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Analysis failed", {
        description: error instanceof Error ? error.message : "Please try again"
      });
    } finally {
      setProcessing(false);
      setProcessingStep('idle');
    }
  };


  const activeSegment = segments.find(s => s.id === activeSegmentId);
  const activeActions = actions.find(a => a.segmentId === activeSegmentId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold">EngageFlow</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden sm:flex">
              <Users className="w-3 h-3 mr-1" />
              {emails.length} Contacts
            </Badge>
            <Button variant="outline" size="sm" onClick={() => navigate("/analyses")} className="hidden sm:flex">
              <FileText className="w-4 h-4 mr-1" />
              Past Analyses
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigate("/settings")}>
              <Settings className="w-4 h-4" />
            </Button>
            <Button 
              onClick={runAnalysis} 
              disabled={isProcessing || emails.length === 0}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Analysis
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Processing State */}
        {isProcessing && (
          <Card className="mb-6 border-primary/50">
            <CardContent className="py-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-primary animate-spin" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {processingStep === 'enriching' && 'Enriching contact data...'}
                    {processingStep === 'analyzing' && 'AI is analyzing segments...'}
                    {processingStep === 'generating' && 'Generating GTM actions...'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Processing {emails.length} contacts
                  </p>
                </div>
                <span className="text-lg font-bold text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isProcessing && segments.length === 0 && (
          <Card className="text-center py-16">
            <CardContent>
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Target className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Ready to Analyze</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {emails.length > 0 
                  ? `You have ${emails.length} contacts ready. Click "Run Analysis" to discover segments and generate personalized GTM actions.`
                  : "Go back to the landing page to add contacts first."}
              </p>
              {emails.length > 0 ? (
                <Button onClick={runAnalysis} size="lg">
                  <Zap className="w-4 h-4 mr-2" />
                  Start Analysis
                </Button>
              ) : (
                <Button onClick={() => navigate("/")} variant="outline" size="lg">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Add Contacts
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {segments.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Segments Column */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Segments ({segments.length})
                </h2>
                <Button variant="outline" size="sm" onClick={() => setShowExport(true)}>
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </div>
              
              <div className="space-y-3">
                {segments.map((segment, index) => (
                  <SegmentCard
                    key={segment.id}
                    segment={segment}
                    rank={index + 1}
                    isActive={segment.id === activeSegmentId}
                    onClick={() => setActiveSegmentId(segment.id)}
                  />
                ))}
              </div>
              
              {/* Charts */}
              <SegmentCharts 
                segments={segments} 
                enrichedContacts={enrichedContacts} 
              />
            </div>

            {/* Actions Column */}
            <div className="lg:col-span-2">
              {activeSegment && activeActions && (
                <ActionsPanel 
                  segment={activeSegment} 
                  actions={activeActions}
                  onExport={() => setShowExport(true)}
                />
              )}
            </div>
          </div>
        )}
      </main>

      <ExportDialog 
        open={showExport} 
        onOpenChange={setShowExport}
        segments={segments}
        actions={actions}
        enrichedContacts={enrichedContacts}
      />
    </div>
  );
}
