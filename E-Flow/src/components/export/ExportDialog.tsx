import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Download, Send, FileJson, FileSpreadsheet, Webhook } from "lucide-react";
import { Segment, GTMAction, EnrichedContact } from "@/types";
import { useAppStore } from "@/store/app-store";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  segments: Segment[];
  actions: GTMAction[];
  enrichedContacts: EnrichedContact[];
}

export function ExportDialog({ 
  open, 
  onOpenChange, 
  segments, 
  actions, 
  enrichedContacts 
}: ExportDialogProps) {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { settings } = useAppStore();

  const exportData = {
    exportedAt: new Date().toISOString(),
    segments,
    actions,
    contacts: enrichedContacts,
    summary: {
      totalContacts: enrichedContacts.length,
      totalSegments: segments.length,
      topSegment: segments[0]?.name || 'N/A'
    }
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `engageflow-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("JSON file downloaded");
  };

  const downloadCSV = () => {
    // Flatten data for CSV
    const rows: string[][] = [];
    
    // Header
    rows.push([
      'Email', 'Name', 'Job Title', 'Company', 'Industry', 
      'Company Size', 'Funding Stage', 'Location', 'Engagement', 'Segment'
    ]);
    
    // Data rows
    enrichedContacts.forEach(contact => {
      const segment = segments.find(s => s.contacts.includes(contact.email));
      rows.push([
        contact.email,
        contact.person?.name || '',
        contact.person?.jobTitle || '',
        contact.company?.name || '',
        contact.company?.industry || '',
        contact.company?.size || '',
        contact.company?.fundingStage || '',
        contact.company?.location || '',
        String(contact.engagementScore || ''),
        segment?.name || 'Unassigned'
      ]);
    });
    
    const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `engageflow-contacts-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("CSV file downloaded");
  };

  const sendToWebhook = async (url: string) => {
    if (!url) {
      toast.error("Please enter a webhook URL");
      return;
    }

    setIsSending(true);
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify(exportData)
      });
      toast.success("Data sent to webhook", {
        description: "Check your automation tool for the results"
      });
    } catch (error) {
      toast.error("Failed to send data", {
        description: "Please check the webhook URL and try again"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>
            Download your segments and actions or send them to an automation tool
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="download" className="mt-4">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="download">
              <Download className="w-4 h-4 mr-2" />
              Download
            </TabsTrigger>
            <TabsTrigger value="webhook">
              <Webhook className="w-4 h-4 mr-2" />
              Send to Webhook
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="download" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-auto py-6 flex-col"
                onClick={downloadJSON}
              >
                <FileJson className="w-8 h-8 mb-2 text-primary" />
                <span className="font-medium">JSON Format</span>
                <span className="text-xs text-muted-foreground">Full data export</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-6 flex-col"
                onClick={downloadCSV}
              >
                <FileSpreadsheet className="w-8 h-8 mb-2 text-success" />
                <span className="font-medium">CSV Format</span>
                <span className="text-xs text-muted-foreground">For spreadsheets</span>
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              {segments.length} segments • {enrichedContacts.length} contacts • {actions.length} action sets
            </p>
          </TabsContent>
          
          <TabsContent value="webhook" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="customWebhook">Custom Webhook URL</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="customWebhook"
                  placeholder="https://hooks.zapier.com/..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
                <Button 
                  onClick={() => sendToWebhook(webhookUrl)} 
                  disabled={isSending}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {settings.zapierWebhook && (
              <div>
                <Label>Saved Zapier Webhook</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={settings.zapierWebhook} readOnly className="text-sm" />
                  <Button 
                    onClick={() => sendToWebhook(settings.zapierWebhook)} 
                    disabled={isSending}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {settings.slackWebhook && (
              <div>
                <Label>Saved Slack Webhook</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={settings.slackWebhook} readOnly className="text-sm" />
                  <Button 
                    onClick={() => sendToWebhook(settings.slackWebhook)} 
                    disabled={isSending}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
