import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, FileText, Users, Lightbulb, Download, Send, 
  Copy, Check, TrendingUp, Info
} from "lucide-react";
import { Segment, GTMAction } from "@/types";
import { useState } from "react";
import { toast } from "sonner";

interface ActionsPanelProps {
  segment: Segment;
  actions: GTMAction;
  onExport: () => void;
}

export function ActionsPanel({ segment, actions, onExport }: ActionsPanelProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {segment.name}
              {segment.conversionRate && (
                <Badge variant="outline" className="text-success border-success">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {segment.conversionRate}%
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-2">
              {segment.description}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
        
        {/* Why Explanation */}
        <div className="bg-muted/50 rounded-lg p-3 mt-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium">Why this segment?</p>
              <p className="text-sm text-muted-foreground">{segment.whyExplanation}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="emails">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="emails" className="text-xs">
              <Mail className="w-3 h-3 mr-1" />
              Emails
            </TabsTrigger>
            <TabsTrigger value="content" className="text-xs">
              <FileText className="w-3 h-3 mr-1" />
              Content
            </TabsTrigger>
            <TabsTrigger value="routing" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              Routing
            </TabsTrigger>
            <TabsTrigger value="product" className="text-xs">
              <Lightbulb className="w-3 h-3 mr-1" />
              Product
            </TabsTrigger>
          </TabsList>
          
          {/* Nurture Emails */}
          <TabsContent value="emails">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4 pt-4">
                {actions.nurtureEmails.map((email, index) => (
                  <Card key={index} className="bg-muted/30">
                    <CardHeader className="py-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant="secondary" className="mb-2">Email {index + 1}</Badge>
                          <CardTitle className="text-sm">{email.subject}</CardTitle>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => copyToClipboard(`Subject: ${email.subject}\n\n${email.body}`, `email-${index}`)}
                        >
                          {copiedId === `email-${index}` ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="py-0 pb-3">
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {email.body}
                      </p>
                      <Separator className="my-3" />
                      <p className="text-xs text-primary">
                        💡 {email.personalizationTip}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          {/* Content Recommendations */}
          <TabsContent value="content">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3 pt-4">
                {actions.contentRecs.map((content, index) => (
                  <Card key={index} className="bg-muted/30">
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">{content.title}</p>
                            <Badge variant="outline" className="text-xs">{content.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{content.reason}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          {/* Sales Routing */}
          <TabsContent value="routing">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3 pt-4">
                {actions.salesRouting.map((rule, index) => (
                  <Card key={index} className="bg-muted/30">
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-accent" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm mb-1">{rule.rule}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">→ {rule.assignTo}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          {/* Product Tweaks */}
          <TabsContent value="product">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3 pt-4">
                {actions.productTweaks.map((tweak, index) => (
                  <Card key={index} className="bg-muted/30">
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                          <Lightbulb className="w-5 h-5 text-warning" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">{tweak.suggestion}</p>
                            <Badge 
                              variant={tweak.priority === 'high' ? 'destructive' : tweak.priority === 'medium' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {tweak.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
