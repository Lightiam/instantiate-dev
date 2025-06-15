import { Github, Globe, Mail, Shield, Zap, Cloud, Database } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-blue-950 border-t border-blue-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                <Cloud className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-cyan-400">Instantiate.dev</h3>
            </div>
            <p className="text-cyan-300 mb-4 max-w-md">
              Advanced multi-cloud deployment platform delivering intelligent infrastructure management 
              through interactive and visually engaging interfaces.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/Imole-cloud/-Instantiate.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="mailto:imole.aurora@gmail.com"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>

            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-lg font-semibold text-cyan-400 mb-4">Platform Features</h4>
            <ul className="space-y-2">
              <li className="flex items-center text-cyan-300 hover:text-white transition-colors">
                <Zap className="w-4 h-4 mr-2" />
                <span className="text-sm">Real-time Analytics</span>
              </li>
              <li className="flex items-center text-cyan-300 hover:text-white transition-colors">
                <Cloud className="w-4 h-4 mr-2" />
                <span className="text-sm">Multi-Cloud Integration</span>
              </li>
              <li className="flex items-center text-cyan-300 hover:text-white transition-colors">
                <Database className="w-4 h-4 mr-2" />
                <span className="text-sm">3D Visualization</span>
              </li>
              <li className="flex items-center text-cyan-300 hover:text-white transition-colors">
                <Shield className="w-4 h-4 mr-2" />
                <span className="text-sm">AI-Powered Assistance</span>
              </li>
            </ul>
          </div>

          {/* Cloud Providers */}
          <div>
            <h4 className="text-lg font-semibold text-cyan-400 mb-4">Supported Providers</h4>
            <ul className="space-y-2 text-sm text-cyan-300">
              <li>Amazon Web Services</li>
              <li>Microsoft Azure</li>
              <li>Google Cloud Platform</li>
              <li>Alibaba Cloud</li>
              <li>IBM Cloud</li>
              <li>Oracle Cloud</li>
              <li>DigitalOcean</li>
              <li>Linode</li>
              <li>Huawei Cloud</li>
              <li>Tencent Cloud</li>

            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-blue-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-cyan-300 text-sm mb-4 md:mb-0">
              © {currentYear} Instantiate.dev. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <span className="text-cyan-300">
                Built with React, TypeScript & AI
              </span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-cyan-400">Live Platform</span>
              </div>
            </div>
          </div>
          
          {/* Tech Stack */}
          <div className="mt-4 pt-4 border-t border-blue-800">
            <div className="text-center">
              <p className="text-xs text-cyan-400 mb-2">Powered by</p>
              <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-cyan-300">
                <span>React + TypeScript</span>
                <span>•</span>
                <span>Node.js + Express</span>
                <span>•</span>
                <span>PostgreSQL + Drizzle ORM</span>
                <span>•</span>
                <span>Tailwind CSS</span>
                <span>•</span>
                <span>Groq AI</span>
                <span>•</span>
                <span>WebSocket Real-time</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
