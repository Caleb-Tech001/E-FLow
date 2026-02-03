import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, Search, FileText, Users, Target, 
  Calendar, ExternalLink, Trash2, GitCompare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AnalysisRun {
  id: string;
  created_at: string;
  status: string;
  emails_count: number;
  segments: unknown;
}

export default function AnalysesPage() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<AnalysisRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from("analysis_runs")
        .select("id, created_at, status, emails_count, segments")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error) {
      console.error("Failed to load analyses:", error);
      toast.error("Failed to load analyses");
    } finally {
      setLoading(false);
    }
  };

  const deleteAnalysis = async (id: string) => {
    setDeleting(id);
    try {
      const { error } = await supabase
        .from("analysis_runs")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setAnalyses(prev => prev.filter(a => a.id !== id));
      setSelectedForCompare(prev => prev.filter(sId => sId !== id));
      toast.success("Analysis deleted");
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Failed to delete analysis");
    } finally {
      setDeleting(null);
    }
  };

  const toggleSelectForCompare = (id: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(id)) {
        return prev.filter(sId => sId !== id);
      }
      if (prev.length >= 5) {
        toast.warning("Maximum 5 reports can be compared");
        return prev;
      }
      return [...prev, id];
    });
  };

  const goToCompare = () => {
    if (selectedForCompare.length < 2) {
      toast.warning("Select at least 2 reports to compare");
      return;
    }
    navigate(`/compare?ids=${selectedForCompare.join(",")}`);
  };

  const getSegmentArray = (segments: unknown): any[] => {
    if (!segments) return [];
    if (Array.isArray(segments)) return segments;
    // Handle nested {segments: [...]} format
    if (typeof segments === 'object' && 'segments' in (segments as any)) {
      return (segments as any).segments || [];
    }
    return [];
  };

  const getSegmentSummary = (segments: unknown): string => {
    const segmentArray = getSegmentArray(segments);
    if (segmentArray.length === 0) return "No segments";
    const names = segmentArray.slice(0, 2).map((s: any) => s.name);
    const more = segmentArray.length > 2 ? ` +${segmentArray.length - 2} more` : "";
    return names.join(", ") + more;
  };

  const getSegmentCount = (segments: unknown): number => {
    return getSegmentArray(segments).length;
  };

  const filteredAnalyses = analyses.filter(analysis => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const shortId = analysis.id.slice(0, 8).toLowerCase();
    const date = new Date(analysis.created_at).toLocaleDateString().toLowerCase();
    const segmentSummary = getSegmentSummary(analysis.segments).toLowerCase();
    
    return shortId.includes(query) || 
           date.includes(query) || 
           segmentSummary.includes(query) ||
           analysis.status.includes(query);
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold">Past Analyses</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            {selectedForCompare.length > 0 && (
              <Badge variant="secondary" className="px-3 py-1">
                {selectedForCompare.length} selected
              </Badge>
            )}
            <Button 
              variant="outline" 
              onClick={goToCompare}
              disabled={selectedForCompare.length < 2}
            >
              <GitCompare className="w-4 h-4 mr-2" />
              Compare ({selectedForCompare.length})
            </Button>
            <Button onClick={() => navigate("/dashboard")}>
              New Analysis
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, date, segment names, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <FileText className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{analyses.length}</p>
                <p className="text-sm text-muted-foreground">Total Analyses</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">
                  {analyses.reduce((sum, a) => sum + a.emails_count, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Contacts Analyzed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">
                  {analyses.filter(a => a.status === "completed").length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analyses List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : filteredAnalyses.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold mb-2">
                {searchQuery ? "No matching analyses" : "No analyses yet"}
              </h2>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? "Try a different search term" 
                  : "Run your first analysis to see it here"}
              </p>
              {!searchQuery && (
                <Button onClick={() => navigate("/dashboard")}>
                  Start Analysis
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredAnalyses.map((analysis) => {
              const shortId = analysis.id.slice(0, 8).toUpperCase();
              const segmentCount = getSegmentCount(analysis.segments);
              
              return (
                <Card 
                  key={analysis.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/report/${analysis.id}`)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Compare checkbox */}
                        {analysis.status === "completed" && (
                          <Checkbox
                            checked={selectedForCompare.includes(analysis.id)}
                            onCheckedChange={() => toggleSelectForCompare(analysis.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-5 w-5"
                          />
                        )}
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">Analysis #{shortId}</h3>
                            <Badge 
                              variant={analysis.status === "completed" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {analysis.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {getSegmentSummary(analysis.segments)}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(analysis.created_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {analysis.emails_count} contacts
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {segmentCount} segments
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/report/${analysis.id}`);
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={(e) => e.stopPropagation()}
                              disabled={deleting === analysis.id}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Analysis?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete Analysis #{shortId} and all its data. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteAnalysis(analysis.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}