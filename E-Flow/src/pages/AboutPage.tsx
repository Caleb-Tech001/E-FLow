import { ArrowLeft, Target, Users, Zap, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  const navigate = useNavigate();

  const values = [
    {
      icon: Target,
      title: "Precision",
      description: "Every segment and action is designed to maximize your GTM effectiveness."
    },
    {
      icon: Zap,
      title: "Speed",
      description: "From contact list to actionable playbook in minutes, not days."
    },
    {
      icon: Users,
      title: "Human-Centric",
      description: "AI that enhances your team's capabilities, not replaces them."
    },
    {
      icon: Heart,
      title: "Passion",
      description: "Built by B2B practitioners who understand the sales and marketing grind."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
              <h1 className="text-2xl font-bold">About Us</h1>
              <p className="text-muted-foreground text-sm">The story behind EngageFlow</p>
            </div>
          </a>
        </div>

        {/* Hero Section */}
        <Card className="mb-8 overflow-hidden">
          <CardContent className="p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Transforming B2B Go-to-Market
            </h2>
            <p className="text-lg text-muted-foreground mb-4">
              EngageFlow was born from a simple observation: B2B teams spend countless hours 
              manually researching contacts, trying to figure out who to target and what to say.
            </p>
            <p className="text-lg text-muted-foreground mb-4">
              We believe that AI can do the heavy lifting—enriching contact data, discovering 
              meaningful segments, and generating personalized actions—so your team can focus 
              on what they do best: building relationships and closing deals.
            </p>
            <p className="text-lg text-muted-foreground">
              Our mission is to give every B2B team, regardless of size, access to 
              enterprise-grade GTM intelligence.
            </p>
          </CardContent>
        </Card>

        {/* Values */}
        <h3 className="text-xl font-semibold mb-4">Our Values</h3>
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          {values.map((value) => (
            <Card key={value.title} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{value.title}</h4>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-8 text-center">
            <h3 className="text-xl font-semibold mb-2">Ready to transform your GTM?</h3>
            <p className="text-muted-foreground mb-4">
              Start analyzing your contacts and discover high-value segments today.
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => navigate("/dashboard")}>
                Get Started
              </Button>
              <Button variant="outline" asChild>
                <a href="mailto:sengageflow@gmail.com">Contact Us</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
