
import React from "react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            <span className="font-mono text-primary">&lt;/&gt;</span>Instanti8.dev
          </h1>
          <p className="text-xl mb-8 text-slate-300">Self-service infrastructure deployment</p>
          <p className="text-lg mb-12 text-slate-400 max-w-3xl mx-auto">
            Launch compliant cloud environments in minutes without coding. Firefly's "Compose" 
            allows your teams to quickly generate and deploy cloud infrastructure directly from 
            our intuitive interface.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-6xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700">
              <div className="text-4xl mb-4">☁️</div>
              <h3 className="text-2xl font-semibold mb-4">Multi-Cloud Management</h3>
              <p className="text-slate-300">Easily manage multiple clouds, K8s, and SaaS in one inventory</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-2xl font-semibold mb-4">IaC Provisioning</h3>
              <p className="text-slate-300">Manage IaC using your own CI/CD with enhanced predictability</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-2xl font-semibold mb-4">Cloud Governance</h3>
              <p className="text-slate-300">Control cloud risk and compliance with policy enforcement</p>
            </div>
          </div>
          
          <div className="mt-16">
            <a 
              href="/dashboard" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors duration-200 text-lg"
            >
              Access Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
