
import React from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Navigation */}
      <nav className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-cyan-400 text-xl font-mono">&lt;/&gt;</span>
            <span className="text-xl font-semibold">Instanti8.dev</span>
          </div>
          <div className="flex items-center space-x-8">
            <a href="#" className="text-gray-300 hover:text-white">Home</a>
            <a href="#" className="text-gray-300 hover:text-white">Pricing</a>
            <div className="flex items-center space-x-2 text-gray-300">
              <Star className="w-4 h-4" />
              <span className="text-sm">63.7k</span>
            </div>
            <Button variant="ghost" className="text-gray-300 hover:text-white">
              Sign up
            </Button>
            <Button className="bg-cyan-400 hover:bg-cyan-500 text-black font-medium">
              Start
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-8">
            Infrastructure as<br />
            <span className="text-cyan-400">Code Simplified</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Instanti8.dev transforms complex infrastructure provisioning into simple, declarative code. Define 
            once, deploy everywhere - seamlessly orchestrate resources across AWS, Azure, and GCP with 
            intelligent automation, version control, and collaborative workflows.
          </p>

          <div className="flex justify-center space-x-4 mb-20">
            <Button className="bg-cyan-400 hover:bg-cyan-500 text-black font-medium px-8 py-3 text-lg">
              Start
            </Button>
            <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800 px-8 py-3 text-lg">
              Sign up
            </Button>
          </div>

          {/* Code Terminal Illustration */}
          <div className="relative max-w-2xl mx-auto">
            <div className="bg-slate-800 rounded-lg shadow-2xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-left space-y-2 font-mono text-sm">
                <div className="text-cyan-400">resource &quot;aws_instance&quot; &quot;web&quot; &#123;</div>
                <div className="text-white ml-4">ami = &quot;ami-0c55b159cbfafe1d0&quot;</div>
                <div className="text-white ml-4">instance_type = &quot;t2.micro&quot;</div>
                <div className="text-cyan-400">&#125;</div>
              </div>
            </div>
            
            {/* Cloud Provider Badges */}
            <div className="absolute -bottom-8 -right-8 flex space-x-4">
              <div className="bg-orange-500 text-white px-3 py-1 rounded text-sm font-medium">
                AWS
              </div>
              <div className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium">
                Azure
              </div>
              <div className="bg-red-500 text-white px-3 py-1 rounded text-sm font-medium">
                GCP
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
