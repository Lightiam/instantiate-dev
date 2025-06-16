
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Cloud, 
  Shield, 
  Zap, 
  Database, 
  GitBranch, 
  Settings, 
  CheckCircle, 
  ArrowRight,
  Server,
  Lock,
  RefreshCw
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900/50 backdrop-blur-sm border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-mono text-lg font-bold">&lt;/&gt;</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            instanti8.dev
          </span>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-slate-300 hover:text-cyan-400 transition-colors">Features</a>
          <a href="#pricing" className="text-slate-300 hover:text-cyan-400 transition-colors">Pricing</a>
          <a href="#" className="text-slate-300 hover:text-cyan-400 transition-colors">Sign In</a>
          <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6">
            Get Started
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="px-6 py-20">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/20 px-6 py-3 rounded-full mb-8">
            <Zap className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-400 font-medium">Self-Service Infrastructure Deployment</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Launch Compliant{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Cloud Environments
            </span>
            <br />
            <span className="text-4xl md:text-5xl text-slate-300">in Minutes</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Firefly's "Compose" allows your teams to quickly generate and deploy cloud 
            infrastructure directly from the Firefly UI by selecting modules from a public 
            or private catalog. Simply fill out the form, generate the code, understand the 
            impact, and deploy – all without writing a single line of Terraform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-10 py-4 text-lg font-semibold rounded-xl shadow-2xl shadow-cyan-500/25"
            >
              Start Deploying
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-cyan-400 px-10 py-4 text-lg rounded-xl"
            >
              View Demo
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="max-w-7xl mx-auto mt-20" id="features">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Complete Infrastructure Platform</h2>
            <p className="text-xl text-slate-400">Everything you need to manage multi-cloud infrastructure</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Self-Service Deployment */}
            <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white text-center">Self-Service Infrastructure</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-400 leading-relaxed">
                  Launch compliant cloud environments in minutes without coding. 
                  Select modules from catalog, fill forms, and deploy automatically.
                </p>
              </CardContent>
            </Card>

            {/* Multi-Cloud Management */}
            <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Cloud className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white text-center">Multi-Cloud Management</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-400 leading-relaxed">
                  Easily manage multiple clouds, K8s, and SaaS in one inventory. 
                  Complete visibility across all providers with unified control.
                </p>
              </CardContent>
            </Card>

            {/* IaC Provisioning */}
            <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <GitBranch className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white text-center">IaC Provisioning</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-400 leading-relaxed">
                  Manage Infrastructure as Code using your own CI/CD. 
                  Accelerate deployments with GitOps automations.
                </p>
              </CardContent>
            </Card>

            {/* Cloud Governance */}
            <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white text-center">Cloud Governance</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-400 leading-relaxed">
                  Control cloud risk and compliance with policy enforcement 
                  and AI-native remediation. Automated issue detection.
                </p>
              </CardContent>
            </Card>

            {/* Backup & Recovery */}
            <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Database className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white text-center">Backup & Recovery</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-400 leading-relaxed">
                  Cloud resiliency with independent backup and recovery 
                  for infrastructure configurations and business continuity.
                </p>
              </CardContent>
            </Card>

            {/* Monitoring */}
            <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white text-center">Real-Time Monitoring</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-400 leading-relaxed">
                  Complete visibility with real-time analytics and monitoring 
                  across your entire multi-cloud infrastructure.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-6xl mx-auto mt-20 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700">
              <div className="text-4xl font-bold text-cyan-400 mb-2">11+</div>
              <div className="text-slate-400">Cloud Providers</div>
            </div>
            <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700">
              <div className="text-4xl font-bold text-cyan-400 mb-2">99.9%</div>
              <div className="text-slate-400">Uptime SLA</div>
            </div>
            <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700">
              <div className="text-4xl font-bold text-cyan-400 mb-2">5min</div>
              <div className="text-slate-400">Deploy Time</div>
            </div>
            <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700">
              <div className="text-4xl font-bold text-cyan-400 mb-2">24/7</div>
              <div className="text-slate-400">Support</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-20 text-center bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-3xl p-12 border border-slate-600">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Cloud Operations?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of teams already using Instantiate.dev to deploy infrastructure faster and more securely.
          </p>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-12 py-4 text-xl font-semibold rounded-xl shadow-2xl shadow-cyan-500/25"
          >
            Start Free Trial
            <ArrowRight className="ml-3 w-6 h-6" />
          </Button>
        </div>
      </main>
    </div>
  );
}
