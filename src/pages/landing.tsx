
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Cloud, Code, Zap, Shield, Users, MessageSquare } from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: <Cloud className="h-8 w-8 text-blue-500" />,
      title: "Multi-Cloud Management",
      description: "Easily manage multiple clouds, K8s, and SaaS in one inventory"
    },
    {
      icon: <Code className="h-8 w-8 text-green-500" />,
      title: "Self-Service Infrastructure",
      description: "Launch compliant cloud environments in minutes without coding"
    },
    {
      icon: <Zap className="h-8 w-8 text-purple-500" />,
      title: "IaC Provisioning",
      description: "Manage IaC using your own CI/CD with GitOps automations"
    },
    {
      icon: <Shield className="h-8 w-8 text-red-500" />,
      title: "Cloud Governance",
      description: "Control cloud risk and compliance with policy enforcement"
    },
    {
      icon: <Users className="h-8 w-8 text-orange-500" />,
      title: "Backup & Recovery",
      description: "Cloud resiliency with independent backup and recovery"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            Multi-Cloud Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            &lt;/&gt;instanti<span className="text-primary">8</span>.dev
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Self-service infrastructure deployment. Launch compliant cloud environments in minutes without coding.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setLocation("/chat-ui")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Start Infrastructure Chat
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setLocation("/dashboard")}
            >
              View Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    {feature.icon}
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience the power of AI-driven infrastructure deployment
          </p>
          <Button 
            size="lg" 
            onClick={() => setLocation("/chat-ui")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Try Infrastructure Chat
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
