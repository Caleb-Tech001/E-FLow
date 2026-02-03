import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft, GitCompare, Users, Target, TrendingUp,
  Calendar, Sparkles, X, Plus, FileText, BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Segment, GTMAction, EnrichedContact } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AnalysisRun {
  id: string;
  created_at: string;
  status: string;
  emails_count: number;
  enriched_data: unknown;
  segments: unknown;
  actions: unknown;
}

export default function ComparePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [allAnalyses, setAllAnalyses] = useState<AnalysisRun[]>([]);
  const [selectedReports, setSelectedReports] = useState<AnalysisRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadAnalyses();
  }, []);

  useEffect(() => {
    // Load reports from URL params
    const ids = searchParams.get("ids")?.split(",").filter(Boolean) || [];
    if (ids.length > 0 && allAnalyses.length > 0) {
      const reports = allAnalyses.filter(a => ids.includes(a.id));
      setSelectedReports(reports);
    }
  }, [searchParams, allAnalyses]);

  const loadAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from("analysis_runs")
        .select("*")
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAllAnalyses(data || []);
    } catch (error) {
      console.error("Failed to load analyses:", error);
      toast.error("Failed to load analyses");
    } finally {
      setLoading(false);
    }
  };

  const addReport = (report: AnalysisRun) => {
    if (selectedReports.find(r => r.id === report.id)) {
      toast.info("Report already added");
      return;
    }
    if (selectedReports.length >= 5) {
      toast.warning("Maximum 5 reports can be compared");
      return;
    }
    
    const newReports = [...selectedReports, report];
    setSelectedReports(newReports);
    setSearchParams({ ids: newReports.map(r => r.id).join(",") });
    setDialogOpen(false);
  };

  const removeReport = (id: string) => {
    const newReports = selectedReports.filter(r => r.id !== id);
    setSelectedReports(newReports);
    if (newReports.length > 0) {
      setSearchParams({ ids: newReports.map(r => r.id).join(",") });
    } else {
      setSearchParams({});
    }
  };

  const getSegments = (report: AnalysisRun): Segment[] => {
    return (report.segments as Segment[] | null) || [];
  };

  const getActions = (report: AnalysisRun): GTMAction[] => {
    return (report.actions as GTMAction[] | null) || [];
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getShortId = (id: string) => id.slice(0, 8).toUpperCase();

  // Calculate comparison stats
  const getComparisonStats = () => {
    if (selectedReports.length === 0) return null;

    const stats = selectedReports.map(report => {
      const segments = getSegments(report);
      const avgConversion = segments.length > 0
        ? segments.reduce((sum, s) => sum + (s.conversionRate || 0), 0) / segments.length
        : 0;
      
      return {
        id: report.id,
        shortId: getShortId(report.id),
        date: formatDate(report.created_at),
        contacts: report.emails_count,
        segments: segments.length,
        actions: getActions(report).length,
        avgConversion: avgConversion.toFixed(1),
        topSegment: segments[0]?.name || "N/A"
      };
    });

    return stats;
  };

  const comparisonStats = getComparisonStats();

  // Get all unique segment names across reports
  const getAllSegmentNames = () => {
    const names = new Set<string>();
    selectedReports.forEach(report => {
      getSegments(report).forEach(seg => names.add(seg.name));
    });
    return Array.from(names);
  };

  const availableToAdd = allAnalyses.filter(
    a => !selectedReports.find(r => r.id === a.id)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/analyses")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <GitCompare className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">Compare Reports</span>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={loading || availableToAdd.length === 0}>
                <Plus className="w-4 h-4 mr-2" />
                Add Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Select Report to Compare</DialogTitle>
                <DialogDescription>
                  Choose from your completed analysis reports
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[400px] pr-4">
                <div className="space-y-2">
                  {availableToAdd.map(analysis => {
                    const segments = getSegments(analysis);
                    return (
                      <div
                        key={analysis.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => addReport(analysis)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">#{getShortId(analysis.id)}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(analysis.created_at)} • {analysis.emails_count} contacts • {segments.length} segments
                            </p>
                          </div>
                        </div>
                        <Plus className="w-4 h-4 text-muted-foreground" />
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : selectedReports.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <GitCompare className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Compare Analysis Reports</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Select 2 or more reports to compare side by side. You can compare up to 5 reports at once.
              </p>
              <Button onClick={() => setDialogOpen(true)} disabled={availableToAdd.length === 0}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Report
              </Button>
              {availableToAdd.length === 0 && (
                <p className="text-sm text-muted-foreground mt-4">
                  No completed analyses available. Run an analysis first.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Selected Reports Tags */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground">Comparing:</span>
              {selectedReports.map(report => (
                <Badge
                  key={report.id}
                  variant="secondary"
                  className="px-3 py-1 flex items-center gap-2"
                >
                  #{getShortId(report.id)}
                  <button
                    onClick={() => removeReport(report.id)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {selectedReports.length < 5 && availableToAdd.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDialogOpen(true)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              )}
            </div>

            {/* Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Overview Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="w-full">
                  <div className="min-w-[600px]">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Metric</th>
                          {comparisonStats?.map(stat => (
                            <th key={stat.id} className="text-center py-3 px-4 font-medium">
                              <div className="flex flex-col items-center gap-1">
                                <span className="font-semibold">#{stat.shortId}</span>
                                <span className="text-xs text-muted-foreground">{stat.date}</span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-3 px-4 flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            Contacts
                          </td>
                          {comparisonStats?.map(stat => (
                            <td key={stat.id} className="text-center py-3 px-4 font-medium">
                              {stat.contacts}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4 flex items-center gap-2">
                            <Target className="w-4 h-4 text-muted-foreground" />
                            Segments
                          </td>
                          {comparisonStats?.map(stat => (
                            <td key={stat.id} className="text-center py-3 px-4 font-medium">
                              {stat.segments}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-muted-foreground" />
                            GTM Actions
                          </td>
                          {comparisonStats?.map(stat => (
                            <td key={stat.id} className="text-center py-3 px-4 font-medium">
                              {stat.actions}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-muted-foreground" />
                            Avg Conversion
                          </td>
                          {comparisonStats?.map(stat => (
                            <td key={stat.id} className="text-center py-3 px-4">
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                {stat.avgConversion}%
                              </Badge>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3 px-4 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            Top Segment
                          </td>
                          {comparisonStats?.map(stat => (
                            <td key={stat.id} className="text-center py-3 px-4 text-sm">
                              {stat.topSegment}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Segment Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Segment Comparison
                </CardTitle>
                <CardDescription>
                  Compare segments across different analysis runs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="w-full">
                  <div className="min-w-[600px]">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Segment Name</th>
                          {selectedReports.map(report => (
                            <th key={report.id} className="text-center py-3 px-4 font-medium">
                              #{getShortId(report.id)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {getAllSegmentNames().map(segmentName => {
                          // Check if this segment is new (only exists in some reports)
                          const reportsWithSegment = selectedReports.filter(r => 
                            getSegments(r).some(s => s.name === segmentName)
                          );
                          const isNewSegment = reportsWithSegment.length < selectedReports.length;
                          const isOnlyInLatest = reportsWithSegment.length === 1 && 
                            reportsWithSegment[0].id === selectedReports[selectedReports.length - 1]?.id;
                          
                          return (
                            <tr key={segmentName} className={cn(
                              "border-b",
                              isNewSegment && "bg-green-500/5"
                            )}>
                              <td className="py-3 px-4 font-medium">
                                <div className="flex items-center gap-2">
                                  {segmentName}
                                  {isOnlyInLatest && (
                                    <Badge variant="outline" className="text-[10px] text-green-600 border-green-600 px-1.5 py-0">
                                      NEW
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              {selectedReports.map((report, idx) => {
                                const segment = getSegments(report).find(s => s.name === segmentName);
                                const prevReport = selectedReports[idx - 1];
                                const prevSegment = prevReport ? getSegments(prevReport).find(s => s.name === segmentName) : null;
                                
                                // Calculate change from previous report
                                const sizeChange = prevSegment && segment 
                                  ? ((segment.size - prevSegment.size) / prevSegment.size * 100).toFixed(0)
                                  : null;
                                const convChange = prevSegment?.conversionRate && segment?.conversionRate
                                  ? (segment.conversionRate - prevSegment.conversionRate).toFixed(1)
                                  : null;
                                
                                return (
                                  <td key={report.id} className="text-center py-3 px-4">
                                    {segment ? (
                                      <div className="flex flex-col items-center gap-1">
                                        <div className="flex items-center gap-1">
                                          <Badge variant="secondary">{segment.size} contacts</Badge>
                                          {sizeChange && Number(sizeChange) !== 0 && (
                                            <span className={cn(
                                              "text-[10px] font-medium",
                                              Number(sizeChange) > 0 ? "text-green-600" : "text-red-500"
                                            )}>
                                              {Number(sizeChange) > 0 ? "+" : ""}{sizeChange}%
                                            </span>
                                          )}
                                        </div>
                                        {segment.conversionRate && (
                                          <div className="flex items-center gap-1">
                                            <span className="text-xs text-green-600">
                                              {segment.conversionRate}% conv.
                                            </span>
                                            {convChange && Number(convChange) !== 0 && (
                                              <span className={cn(
                                                "text-[10px] font-medium",
                                                Number(convChange) > 0 ? "text-green-600" : "text-red-500"
                                              )}>
                                                ({Number(convChange) > 0 ? "+" : ""}{convChange}%)
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground text-sm italic">Not found</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </CardContent>
            </Card>

            {/* View Individual Reports */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedReports.map(report => {
                const segments = getSegments(report);
                const actions = getActions(report);
                
                return (
                  <Card 
                    key={report.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/report/${report.id}`)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          Report #{getShortId(report.id)}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                          View Full
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(report.created_at)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="text-lg font-bold">{report.emails_count}</p>
                          <p className="text-xs text-muted-foreground">Contacts</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="text-lg font-bold">{segments.length}</p>
                          <p className="text-xs text-muted-foreground">Segments</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="text-lg font-bold">{actions.length}</p>
                          <p className="text-xs text-muted-foreground">Actions</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
