import { ArrowLeft, BookOpen, Zap, Database, MessageSquare, FileText, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DocumentationPage() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Zap,
      title: "Getting Started",
      description: "Learn the basics of EngageFlow and run your first analysis.",
      items: [
        "Upload your contact list (CSV or paste emails)",
        "Configure your AI analysis prompt",
        "Run enrichment and segmentation",
        "Export your GTM playbook"
      ]
    },
    {
      icon: Database,
      title: "Data Enrichment",
      description: "Understand how contact enrichment works.",
      items: [
        "Automatic company and role detection",
        "Industry and size classification",
        "Technology stack identification",
        "Social profile linking"
      ]
    },
    {
      icon: MessageSquare,
      title: "AI Segmentation",
      description: "How our AI creates meaningful segments.",
      items: [
        "Behavioral pattern analysis",
        "Intent signal detection",
        "Custom segmentation prompts",
        "Segment scoring and prioritization"
      ]
    },
    {
      icon: FileText,
      title: "Actions & Playbooks",
      description: "Generate personalized GTM actions.",
      items: [
        "Email sequence recommendations",
        "Personalized messaging templates",
        "Channel-specific strategies",
        "Timing and cadence suggestions"
      ]
    },
    {
      icon: Settings,
      title: "Settings & Configuration",
      description: "Customize EngageFlow to your needs.",
      items: [
        "API key management",
        "Webhook integrations",
        "Scheduled analyses",
        "Export preferences"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Documentation</h1>
              <p className="text-muted-foreground text-sm">Learn how to use EngageFlow effectively</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <Card key={section.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <section.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.items.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Help Section */}
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">Need more help?</h3>
                <p className="text-muted-foreground">Contact our support team for personalized assistance.</p>
              </div>
              <Button asChild>
                <a href="mailto:sengageflow@gmail.com">Contact Support</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
