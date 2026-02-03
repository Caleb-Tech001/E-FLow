import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, Save, Key, Brain, Calendar, Bell, Webhook, Target, Copy, Check } from "lucide-react";
import { useAppStore } from "@/store/app-store";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { settings, setSettings } = useAppStore();
  const [copied, setCopied] = useState<string | null>(null);
  
  const webhookUrls = {
    input: `${window.location.origin}/api/webhook/input`,
    alert: `${window.location.origin}/api/webhook/alert`
  };

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold">Settings</span>
            </a>
          </div>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        {/* API Keys */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              API Keys
            </CardTitle>
            <CardDescription>
              Configure your external service API keys
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullEnrichKey">FullEnrich API Key</Label>
              <Input
                id="fullEnrichKey"
                type="password"
                placeholder="Enter your FullEnrich API key..."
                value={settings.fullEnrichApiKey}
                onChange={(e) => setSettings({ fullEnrichApiKey: e.target.value })}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Get your API key from{" "}
                <a href="https://fullenrich.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  fullenrich.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* AI Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Analysis Configuration
            </CardTitle>
            <CardDescription>
              Customize how AI analyzes and clusters your contacts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="aiPrompt">Segmentation Prompt</Label>
              <Textarea
                id="aiPrompt"
                placeholder="Enter your custom AI prompt..."
                value={settings.aiPrompt}
                onChange={(e) => setSettings({ aiPrompt: e.target.value })}
                className="mt-2 min-h-[120px]"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Customize how the AI identifies and describes customer segments
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setSettings({ 
                aiPrompt: 'Cluster enriched user data into 3-5 segments focused on B2B traits like role, company size, funding, location (e.g., Lagos/Nigeria/Africa), tech stack. Prioritize high-engagement if provided. Output ranked segments with descriptions, stats, and reasons.' 
              })}
            >
              Reset to Default
            </Button>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Scheduled Analysis
            </CardTitle>
            <CardDescription>
              Set up automatic re-analysis of your contacts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="schedule">Analysis Frequency</Label>
              <Select
                value={settings.scheduleFrequency}
                onValueChange={(value: 'none' | 'weekly' | 'monthly') => 
                  setSettings({ scheduleFrequency: value })
                }
              >
                <SelectTrigger id="schedule" className="mt-2">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Manual only</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Use Zapier/n8n to trigger scheduled runs via webhook
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Webhooks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="w-5 h-5" />
              Webhook Integrations
            </CardTitle>
            <CardDescription>
              Connect EngageFlow to your automation tools
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Input Webhook (Receive emails from CRM)</Label>
              <div className="flex gap-2 mt-2">
                <Input value={webhookUrls.input} readOnly className="font-mono text-sm" />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => copyToClipboard(webhookUrls.input, 'input')}
                >
                  {copied === 'input' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                POST {"{ \"emails\": [\"email@example.com\"] }"} to add contacts
              </p>
            </div>

            <Separator />

            <div>
              <Label>Alert Webhook (Send to your automation)</Label>
              <div className="flex gap-2 mt-2">
                <Input value={webhookUrls.alert} readOnly className="font-mono text-sm" />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => copyToClipboard(webhookUrls.alert, 'alert')}
                >
                  {copied === 'alert' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <Label htmlFor="zapierWebhook">Zapier Webhook URL</Label>
              <Input
                id="zapierWebhook"
                placeholder="https://hooks.zapier.com/..."
                value={settings.zapierWebhook}
                onChange={(e) => setSettings({ zapierWebhook: e.target.value })}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                EngageFlow will POST analysis results to this URL
              </p>
            </div>

            <div>
              <Label htmlFor="slackWebhook">Slack Webhook URL</Label>
              <Input
                id="slackWebhook"
                placeholder="https://hooks.slack.com/..."
                value={settings.slackWebhook}
                onChange={(e) => setSettings({ slackWebhook: e.target.value })}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Alert Configuration
            </CardTitle>
            <CardDescription>
              Get notified when analysis completes or segment drift is detected
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="alertWebhook">Alert Webhook URL</Label>
              <Input
                id="alertWebhook"
                placeholder="https://hooks.zapier.com/... or https://hooks.slack.com/..."
                value={settings.alertWebhook}
                onChange={(e) => setSettings({ alertWebhook: e.target.value })}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Receives POST with analysis results when completed
              </p>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">Alert payload includes:</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Analysis ID and timestamp</li>
                <li>All segments with size and conversion rates</li>
                <li>Detected changes from previous run (drift)</li>
                <li>Slack-compatible formatted message</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
