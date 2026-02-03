import { ArrowLeft, Code, Webhook, Key, Send, Database, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ApiReferencePage() {
  const navigate = useNavigate();

  const endpoints = [
    {
      method: "POST",
      path: "/api/analyze",
      description: "Submit contacts for AI analysis and segmentation",
      badge: "Core"
    },
    {
      method: "GET",
      path: "/api/analyses/:id",
      description: "Retrieve a specific analysis run by ID",
      badge: "Core"
    },
    {
      method: "GET",
      path: "/api/analyses",
      description: "List all analysis runs with pagination",
      badge: "Core"
    },
    {
      method: "POST",
      path: "/api/enrich",
      description: "Enrich contact data with company and role information",
      badge: "Enrichment"
    },
    {
      method: "POST",
      path: "/api/webhooks/input",
      description: "Receive contact data via webhook",
      badge: "Integration"
    },
    {
      method: "POST",
      path: "/api/webhooks/alert",
      description: "Send analysis alerts to external services",
      badge: "Integration"
    }
  ];

  const features = [
    {
      icon: Key,
      title: "Authentication",
      description: "API requests are authenticated using your API key in the Authorization header."
    },
    {
      icon: Send,
      title: "Rate Limiting",
      description: "API calls are limited to 100 requests per minute per API key."
    },
    {
      icon: Database,
      title: "Data Format",
      description: "All requests and responses use JSON format with UTF-8 encoding."
    },
    {
      icon: Lock,
      title: "Security",
      description: "All API traffic is encrypted using TLS 1.3."
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
              <Code className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">API Reference</h1>
              <p className="text-muted-foreground text-sm">Integrate EngageFlow into your workflow</p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="pt-6">
                <feature.icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Endpoints */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Webhook className="w-5 h-5 text-primary" />
              <CardTitle>Endpoints</CardTitle>
            </div>
            <CardDescription>Available API endpoints for integration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {endpoints.map((endpoint, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row md:items-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={endpoint.method === "POST" ? "default" : "secondary"}
                      className="font-mono text-xs w-16 justify-center"
                    >
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm font-mono text-primary">{endpoint.path}</code>
                  </div>
                  <div className="flex-1 md:text-right">
                    <span className="text-sm text-muted-foreground">{endpoint.description}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {endpoint.badge}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">Ready to integrate?</h3>
                <p className="text-muted-foreground">Get your API key from the settings page.</p>
              </div>
              <Button onClick={() => navigate("/settings")}>
                Go to Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
