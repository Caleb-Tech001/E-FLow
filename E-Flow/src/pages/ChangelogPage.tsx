import { ArrowLeft, Target, Zap, Bug, Shield, TrendingUp, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ChangelogPage() {
  const navigate = useNavigate();

  const releases = [
    {
      version: "1.2.0",
      date: "January 2025",
      title: "Enhanced AI Segmentation",
      changes: [
        { type: "feature", text: "New AI-powered segment discovery with Gemini Flash" },
        { type: "feature", text: "Customizable analysis prompts" },
        { type: "improvement", text: "Faster contact enrichment pipeline" },
        { type: "fix", text: "Fixed export formatting issues" }
      ]
    },
    {
      version: "1.1.0",
      date: "December 2024",
      title: "Webhook Integrations",
      changes: [
        { type: "feature", text: "Zapier and Slack webhook support" },
        { type: "feature", text: "Scheduled analysis runs" },
        { type: "improvement", text: "Improved segment visualization charts" },
        { type: "security", text: "Enhanced API key encryption" }
      ]
    },
    {
      version: "1.0.0",
      date: "November 2024",
      title: "Initial Release",
      changes: [
        { type: "feature", text: "Contact enrichment with FullEnrich API" },
        { type: "feature", text: "AI-powered segmentation" },
        { type: "feature", text: "GTM action generation" },
        { type: "feature", text: "PDF and CSV export" },
        { type: "feature", text: "AI chatbot for analysis insights" }
      ]
    }
  ];

  const getChangeIcon = (type: string) => {
    switch (type) {
      case "feature":
        return <Sparkles className="w-4 h-4 text-primary" />;
      case "improvement":
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case "fix":
        return <Bug className="w-4 h-4 text-orange-500" />;
      case "security":
        return <Shield className="w-4 h-4 text-green-500" />;
      default:
        return <Zap className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getChangeBadge = (type: string) => {
    switch (type) {
      case "feature":
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20">New</Badge>;
      case "improvement":
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">Improved</Badge>;
      case "fix":
        return <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20">Fixed</Badge>;
      case "security":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Security</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Changelog</h1>
              <p className="text-muted-foreground text-sm">What's new in EngageFlow</p>
            </div>
          </a>
        </div>

        {/* Releases */}
        <div className="space-y-6">
          {releases.map((release) => (
            <Card key={release.version}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{release.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">v{release.version}</Badge>
                      <span>{release.date}</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {release.changes.map((change, index) => (
                    <li key={index} className="flex items-start gap-3">
                      {getChangeIcon(change.type)}
                      <span className="flex-1 text-sm">{change.text}</span>
                      {getChangeBadge(change.type)}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
