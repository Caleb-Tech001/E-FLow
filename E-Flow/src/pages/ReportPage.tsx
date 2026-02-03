import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  ArrowLeft, Download, FileText, Users, Target, 
  Briefcase, MapPin, TrendingUp, Copy, Check, Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Segment, GTMAction, EnrichedContact } from "@/types";
import { SegmentCharts } from "@/components/segments/SegmentCharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface AnalysisRunData {
  id: string;
  created_at: string;
  status: string;
  emails_count: number;
  enriched_data: unknown;
  segments: unknown;
  actions: unknown;
}

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  
  const [report, setReport] = useState<AnalysisRunData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadReport() {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from("analysis_runs")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setReport(data as AnalysisRunData);
      } catch (error) {
        console.error("Failed to load report:", error);
        toast.error("Report not found", {
          description: "The report you're looking for doesn't exist."
        });
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [id]);

  const copyReportLink = () => {
    const url = `${window.location.origin}/report/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    
    setDownloading(true);
    toast.info("Generating PDF...");

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF("p", "mm", "a4");
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const shortId = id?.slice(0, 8) || "report";
      pdf.save(`engageflow-report-${shortId}.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setDownloading(false);
    }
  };

  const shortId = id?.slice(0, 8).toUpperCase() || "";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded" />
              <Skeleton className="h-6 w-48" />
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Report Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The report you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle both array format and nested {segments: [...]} format
  const rawSegments = report.segments as Segment[] | { segments: Segment[] } | null;
  const segments = Array.isArray(rawSegments) 
    ? rawSegments 
    : (rawSegments?.segments || []);
  
  const rawActions = report.actions as GTMAction[] | { actions: GTMAction[] } | null;
  const actions = Array.isArray(rawActions) 
    ? rawActions 
    : (rawActions?.actions || []);
  
  const enrichedContacts = (report.enriched_data as EnrichedContact[] | null) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50 print:hidden">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold">Report #{shortId}</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={copyReportLink}>
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
            <Button onClick={downloadPDF} disabled={downloading}>
              <Download className="w-4 h-4 mr-2" />
              {downloading ? "Generating..." : "Download PDF"}
            </Button>
          </div>
        </div>
      </header>

      {/* Report Content */}
      <main className="container mx-auto px-4 py-6">
        <div ref={reportRef} className="space-y-6 bg-background p-4">
          {/* Report Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Analysis Report
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Generated on {new Date(report.created_at).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="font-mono">
                  ID: {shortId}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{report.emails_count}</p>
                  <p className="text-sm text-muted-foreground">Contacts Analyzed</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{segments.length}</p>
                  <p className="text-sm text-muted-foreground">Segments Found</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{actions.length}</p>
                  <p className="text-sm text-muted-foreground">GTM Actions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          {segments.length > 0 && enrichedContacts.length > 0 && (
            <SegmentCharts segments={segments} enrichedContacts={enrichedContacts} />
          )}

          {/* Segments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Customer Segments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {segments.map((segment, index) => (
                  <div key={segment.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? "bg-primary text-primary-foreground" :
                        index === 1 ? "bg-accent text-accent-foreground" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{segment.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{segment.description}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="secondary">
                            <Users className="w-3 h-3 mr-1" />
                            {segment.size} contacts
                          </Badge>
                          {segment.conversionRate && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              {segment.conversionRate}% conversion
                            </Badge>
                          )}
                          {segment.traits.industries?.slice(0, 2).map(industry => (
                            <Badge key={industry} variant="outline">
                              <Briefcase className="w-3 h-3 mr-1" />
                              {industry}
                            </Badge>
                          ))}
                          {segment.traits.locations?.slice(0, 1).map(location => (
                            <Badge key={location} variant="outline">
                              <MapPin className="w-3 h-3 mr-1" />
                              {location}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions Summary */}
          {actions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  GTM Actions Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {actions.map((action, index) => {
                    const segment = segments.find(s => s.id === action.segmentId);
                    return (
                      <div key={action.segmentId} className="border-b pb-4 last:border-b-0 last:pb-0">
                        <h4 className="font-medium mb-3">
                          Actions for: {segment?.name || `Segment ${index + 1}`}
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          {action.nurtureEmails?.[0] && (
                            <div className="bg-muted/50 rounded-lg p-3">
                              <p className="text-sm font-medium mb-1">Email Template</p>
                              <p className="text-xs text-muted-foreground">{action.nurtureEmails[0].subject}</p>
                            </div>
                          )}
                          {action.salesRouting?.[0] && (
                            <div className="bg-muted/50 rounded-lg p-3">
                              <p className="text-sm font-medium mb-1">Routing</p>
                              <p className="text-xs text-muted-foreground">
                                Assign to: {action.salesRouting[0].assignTo}
                              </p>
                            </div>
                          )}
                          {action.contentRecs && action.contentRecs.length > 0 && (
                            <div className="bg-muted/50 rounded-lg p-3 md:col-span-2">
                              <p className="text-sm font-medium mb-1">Recommended Content</p>
                              <div className="flex flex-wrap gap-1">
                                {action.contentRecs.slice(0, 3).map((content, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {content.title}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground py-4 border-t">
            <p>Generated by EngageFlow • Report ID: {id}</p>
          </div>
        </div>
      </main>
    </div>
  );
}