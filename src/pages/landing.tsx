
import React from "react";
import { Button } from "@/components/ui/button";
import { Wrench, Code, Cloud } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-mono text-sm">&lt;/&gt;</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">instanti8.dev</span>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-gray-600 hover:text-gray-900">Pricing</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">Sign In</a>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
            Get Started
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full mb-8">
            <span className="text-blue-600 text-sm">🚀 Self-Service Infrastructure Deployment</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Launch Compliant Cloud{" "}
            <span className="text-blue-600">Environments in Minutes</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Instantiate's "Compose" allows your teams to quickly generate and deploy cloud 
            infrastructure directly from the UI by selecting modules from a public or private 
            catalog - no coding required.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              onClick={() => window.location.href = '/dashboard'}
            >
              Start Deploying →
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-3 text-lg"
              onClick={() => window.location.href = '/chat'}
            >
              Try AI Assistant
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Simply Fill Out the Form
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Generate and deploy cloud infrastructure directly from our 
                intuitive interface by selecting from pre-built modules.
              </p>
            </div>

            {/* Card 2 */}
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Code className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Generate the Code
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Automatically create Infrastructure as Code configurations 
                that follow best practices and compliance standards.
              </p>
            </div>

            {/* Card 3 */}
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Cloud className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Deploy & Understand Impact
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Deploy with confidence while understanding costs and 
                infrastructure impact before making changes.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
