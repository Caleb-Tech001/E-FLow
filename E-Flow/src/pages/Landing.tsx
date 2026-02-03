import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Upload, Mail, Zap, ArrowRight, Sparkles, BarChart3, Target, Users, Copy, Check, FileUp, History } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { sampleEmails } from "@/lib/sample-data";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { FlowAnimation } from "@/components/landing/FlowAnimation";
import { Footer } from "@/components/landing/Footer";


export default function Landing() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const engagementFileRef = useRef<HTMLInputElement>(null);
  const [emailInput, setEmailInput] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [copied, setCopied] = useState(false);
  
  const { setEmails, setEngagementData, settings } = useAppStore();
  
  const generatedWebhookUrl = `https://zygocibzaijxmhlnwoeo.supabase.co/functions/v1/webhook-input`;

  const parseEmails = (text: string): string[] => {
    return text
      .split(/[\n,;]+/)
      .map(email => email.trim().toLowerCase())
      .filter(email => email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  };

  const handleEmailSubmit = () => {
    const emails = parseEmails(emailInput);
    if (emails.length === 0) {
      toast.error("No valid emails found", {
        description: "Please enter at least one valid email address"
      });
      return;
    }
    if (emails.length < 5) {
      toast.warning("Need at least 5 emails for meaningful segments", {
        description: `You have ${emails.length} email${emails.length > 1 ? 's' : ''}. Add more for better AI clustering.`
      });
    }
    setEmails(emails);
    toast.success(`${emails.length} emails ready for analysis`);
    navigate("/dashboard");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const emails = parseEmails(text);
      if (emails.length === 0) {
        toast.error("No valid emails found in file");
        return;
      }
      setEmailInput(emails.join("\n"));
      toast.success(`${emails.length} emails loaded from file`);
    };
    reader.readAsText(file);
  };

  const handleEngagementUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter(line => line.trim());
      const data: Record<string, string | number> = {};
      
      lines.forEach(line => {
        const [email, score] = line.split(",").map(s => s.trim());
        if (email && score) {
          data[email.toLowerCase()] = isNaN(Number(score)) ? score : Number(score);
        }
      });
      
      setEngagementData(data);
      toast.success(`Engagement data loaded for ${Object.keys(data).length} contacts`);
    };
    reader.readAsText(file);
  };

  const loadSampleData = () => {
    setEmailInput(sampleEmails.join("\n"));
    toast.success("Sample data loaded");
  };

  const copyWebhook = () => {
    navigator.clipboard.writeText(generatedWebhookUrl);
    setCopied(true);
    toast.success("Webhook URL copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">EngageFlow</span>
          </a>
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSelector />
            <Button variant="ghost" size="icon" onClick={() => navigate("/analyses")} title="Past Analyses">
              <History className="h-5 w-5" />
            </Button>
            <Button variant="ghost" onClick={() => navigate("/settings")}>Settings</Button>
            <Button onClick={() => navigate("/dashboard")}>Dashboard</Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered GTM Intelligence
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 pb-2 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight">
            Turn user emails into a living GTM playbook
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Enrich your contacts, discover high-value segments with AI, and generate personalized actions, all in one workflow.
          </p>
        </div>

        {/* Animated Flow Visualization */}
        <FlowAnimation />

        {/* Features Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
          {[
            { icon: Mail, title: "Import", desc: "Emails or CSV" },
            { icon: Users, title: "Enrich", desc: "FullEnrich API" },
            { icon: Target, title: "Segment", desc: "AI Clustering" },
            { icon: BarChart3, title: "Act", desc: "GTM Playbooks" }
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-card border">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{feature.title}</p>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Input Card */}
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Add Your Contacts
            </CardTitle>
            <CardDescription>
              Paste emails, upload a CSV, or connect your CRM
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="paste">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="paste">Paste Emails</TabsTrigger>
                <TabsTrigger value="upload">Upload CSV</TabsTrigger>
                <TabsTrigger value="crm">Connect CRM</TabsTrigger>
              </TabsList>
              
              <TabsContent value="paste" className="space-y-4">
                <div>
                  <Label htmlFor="emails">Email Addresses</Label>
                  <Textarea
                    id="emails"
                    placeholder="Enter emails separated by comma, semicolon, or new line..."
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="min-h-[150px] mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    {parseEmails(emailInput).length} valid emails detected
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="upload" className="space-y-4">
                <div 
                  className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium">Click to upload CSV</p>
                  <p className="text-sm text-muted-foreground">Single column of emails</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="crm" className="space-y-4">
                <div className="bg-muted/50 rounded-xl p-6">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Webhook URL for Zapier/n8n
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Send contact data automatically from HubSpot, Pipedrive, Typeform, or any CRM
                  </p>
                  <div className="flex gap-2 mb-4">
                    <Input
                      value={generatedWebhookUrl}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button variant="outline" size="icon" onClick={copyWebhook}>
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  
                  <div className="bg-background rounded-lg p-4 border space-y-3">
                    <p className="text-sm font-medium">How to connect:</p>
                    <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>Copy the webhook URL above</li>
                      <li>In Zapier/n8n, create a new workflow triggered by your CRM</li>
                      <li>Add an HTTP POST action to the webhook URL</li>
                      <li>Send JSON: <code className="bg-muted px-1.5 py-0.5 rounded">{"{ \"emails\": [\"email@example.com\"] }"}</code></li>
                    </ol>
                    <p className="text-xs text-muted-foreground pt-2 border-t">
                      Also accepts: <code className="bg-muted px-1">{"{ \"contacts\": [{\"email\": \"...\"}] }"}</code>
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Engagement Data */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <Label>Engagement Signals (Optional)</Label>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => engagementFileRef.current?.click()}
                >
                  <FileUp className="w-4 h-4 mr-1" />
                  Upload CSV
                </Button>
                <input
                  ref={engagementFileRef}
                  type="file"
                  accept=".csv"
                  onChange={handleEngagementUpload}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                CSV format: email,score (e.g., john@example.com,high or john@example.com,85)
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                className="flex-1"
                size="lg"
                onClick={handleEmailSubmit}
                disabled={parseEmails(emailInput).length === 0}
              >
                <Zap className="w-4 h-4 mr-2" />
                Enrich & Analyze
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={loadSampleData}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Try Sample Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
