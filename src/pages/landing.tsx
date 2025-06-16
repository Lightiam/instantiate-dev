
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cloud, Rocket, Shield, Database, GitBranch, Monitor } from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: Rocket,
      title: "IaC Provisioning",
      description: "Manage Infrastructure as Code using your own CI/CD with enhanced predictability"
    },
    {
      icon: Shield,
      title: "Cloud Governance",
      description: "Control cloud risk and compliance with automated policy enforcement"
    },
    {
      icon: Database,
      title: "Backup & Recovery",
      description: "Cloud resiliency with independent backup and recovery for infrastructure configurations"
    },
    {
      icon: GitBranch,
      title: "GitOps Integration",
      description: "Seamlessly integrate with your CI/CD pipeline to automate deployment processes"
    },
    {
      icon: Monitor,
      title: "Real-time Monitoring",
      description: "Gain complete visibility across your multi-cloud infrastructure with live insights"
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
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h1 className="text-6xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
            <span className="font-mono text-cyan-400">&lt;/&gt;</span>instanti8.dev
          </h1>
          <p className="text-2xl mb-6 text-slate-200 font-medium">
            Self-service infrastructure deployment
          </p>
          <p className="text-lg mb-12 text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Launch compliant cloud environments in minutes without coding. Our "Compose" platform 
            allows your teams to quickly generate and deploy cloud infrastructure directly from 
            an intuitive interface with enterprise-grade security and compliance.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => window.location.href = '/dashboard'}
            >
              Access Dashboard
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 font-semibold px-8 py-4 text-lg transition-all duration-300"
              onClick={() => window.location.href = '/chat'}
            >
              Try AI Assistant
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Platform Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="bg-slate-800/50 backdrop-blur-sm border-slate-600/50 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/10 hover:transform hover:scale-105"
              >
                <CardContent className="p-8">
                  <div className="flex items-center justify-center w-16 h-16 mb-6 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-lg">
                    <feature.icon className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-white">{feature.title}</h3>
                  <p className="text-slate-300 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="p-6">
                <div className="text-4xl font-bold text-cyan-400 mb-2">{stat.number}</div>
                <div className="text-slate-400 text-sm uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
