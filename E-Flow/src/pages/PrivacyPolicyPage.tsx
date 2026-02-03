import { ArrowLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Information We Collect",
      content: `We collect information you provide directly to us, such as when you create an account, 
      upload contact lists, or contact us for support. This may include:
      
      • Email addresses and contact information
      • Company and professional information
      • Usage data and analytics
      • Communication preferences`
    },
    {
      title: "How We Use Your Information",
      content: `We use the information we collect to:
      
      • Provide, maintain, and improve our services
      • Process and enrich contact data for segmentation
      • Generate AI-powered GTM recommendations
      • Send you technical notices and support messages
      • Respond to your comments and questions`
    },
    {
      title: "Data Security",
      content: `We take reasonable measures to help protect your personal information from loss, theft, 
      misuse, unauthorized access, disclosure, alteration, and destruction. All data is encrypted 
      in transit and at rest using industry-standard encryption protocols.`
    },
    {
      title: "Data Retention",
      content: `We retain your information for as long as your account is active or as needed to provide 
      you services. You can request deletion of your data at any time by contacting us at 
      sengageflow@gmail.com.`
    },
    {
      title: "Third-Party Services",
      content: `We may use third-party services to help us operate our business and provide services to you. 
      These third parties have access to your information only to perform specific tasks on our behalf 
      and are obligated to protect your information.`
    },
    {
      title: "Your Rights",
      content: `You have the right to:
      
      • Access your personal data
      • Correct inaccurate data
      • Request deletion of your data
      • Object to processing of your data
      • Data portability`
    },
    {
      title: "Changes to This Policy",
      content: `We may update this privacy policy from time to time. We will notify you of any changes 
      by posting the new privacy policy on this page and updating the "Last updated" date.`
    },
    {
      title: "Contact Us",
      content: `If you have any questions about this Privacy Policy, please contact us at:
      
      Email: sengageflow@gmail.com`
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Privacy Policy</h1>
              <p className="text-muted-foreground text-sm">Last updated: January 2025</p>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              At EngageFlow, we take your privacy seriously. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our service. Please read this 
              privacy policy carefully.
            </p>
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-3">{section.title}</h2>
                <p className="text-muted-foreground whitespace-pre-line">{section.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
