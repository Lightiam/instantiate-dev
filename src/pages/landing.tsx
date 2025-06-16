
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cloud, Rocket, Shield, Database, GitBranch, Monitor } from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: Rocket,
      title: "Self-service Infrastructure",
      description: "Launch compliant cloud environments in minutes without coding using our intuitive Compose platform"
    },
    {
      icon: Cloud,
      title: "Multi-cloud Management",
      description: "Easily manage multiple clouds, K8s, and SaaS in one unified inventory across 11+ providers"
    },
    {
      icon: GitBranch,
      title: "IaC Provisioning",
      description: "Manage Infrastructure as Code using your own CI/CD with enhanced predictability and GitOps"
    },
    {
      icon: Shield,
      title: "Cloud Governance",
      description: "Control cloud risk and compliance with automated policy enforcement and AI-native remediation"
    },
    {
      icon: Database,
      title: "Backup & Recovery",
      description: "Cloud resiliency with independent backup and recovery for infrastructure configurations"
    },
    {
      icon: Monitor,
      title: "Real-time Monitoring",
      description: "Complete visibility across your multi-cloud infrastructure with automated insights"
    }
  ];

  const stats = [
    { number: "11+", label: "Cloud Providers" },
    { number: "99.9%", label: "Uptime SLA" },
    { number: "5min", label: "Avg Deploy Time" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-5xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
            <span className="font-mono text-cyan-400">&lt;/&gt;</span>instanti8.dev
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-slate-200 font-medium">
            Self-service infrastructure deployment
          </p>
          <p className="text-base md:text-lg mb-8 text-slate-300 max-w-4xl mx-auto leading-relaxed">
            Launch compliant cloud environments in minutes without coding. Firefly's "Compose", our self-service 
            infrastructure deployment offering, allows your teams to quickly generate and deploy cloud infrastructure 
            directly from the Firefly UI by selecting modules from a public or private catalog.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => window.location.href = '/dashboard'}
            >
              Access Dashboard
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 font-semibold px-8 py-3 text-lg transition-all duration-300 bg-transparent"
              onClick={() => window.location.href = '/chat'}
            >
              Try AI Assistant
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
            Platform Capabilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/20 hover:transform hover:scale-105 group"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-14 h-14 mb-4 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-xl group-hover:from-cyan-400/30 group-hover:to-blue-600/30 transition-all duration-300">
                    <feature.icon className="w-7 h-7 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-white group-hover:text-cyan-100 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed group-hover:text-slate-200 transition-colors">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="p-4 bg-slate-800/30 rounded-lg backdrop-blur-sm border border-slate-700/50">
                <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">{stat.number}</div>
                <div className="text-slate-400 text-xs md:text-sm uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
