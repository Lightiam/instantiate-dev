
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Settings, Send } from 'lucide-react';

interface ConversationTemplate {
  id: string;
  title: string;
  description: string;
  color: string;
  prompt: string;
}

interface ConversationStarterProps {
  onTemplateSelect: (prompt: string) => void;
  onSendMessage: (message: string) => void;
  input: string;
  setInput: (value: string) => void;
  onBackClick: () => void;
  onEnvironmentClick: () => void;
}

const templates: ConversationTemplate[] = [
  {
    id: "web-app",
    title: "Deploy Web App",
    description: "Create and deploy a web application",
    color: "bg-blue-500 hover:bg-blue-600",
    prompt: "I want to deploy a web application to Azure"
  },
  {
    id: "database",
    title: "Database Setup",
    description: "Set up cloud database infrastructure",
    color: "bg-green-500 hover:bg-green-600",
    prompt: "Set up a PostgreSQL database on Azure with backup and monitoring"
  },
  {
    id: "container",
    title: "Container Deployment",
    description: "Deploy containerized applications",
    color: "bg-purple-500 hover:bg-purple-600",
    prompt: "Deploy a Docker container to Azure Container Instances"
  },
  {
    id: "kubernetes",
    title: "Kubernetes Cluster",
    description: "Set up Kubernetes infrastructure",
    color: "bg-orange-500 hover:bg-orange-600",
    prompt: "Create an AKS cluster with auto-scaling and monitoring"
  },
  {
    id: "storage",
    title: "Cloud Storage",
    description: "Configure cloud storage solutions",
    color: "bg-red-500 hover:bg-red-600",
    prompt: "Set up Azure Blob Storage with CDN and backup policies"
  },
  {
    id: "network",
    title: "Network Config",
    description: "Design network infrastructure",
    color: "bg-cyan-500 hover:bg-cyan-600",
    prompt: "Create a VNet with subnets, NSGs, and load balancer"
  },
  {
    id: "monitoring",
    title: "Monitoring Setup",
    description: "Add monitoring and alerts",
    color: "bg-yellow-500 hover:bg-yellow-600",
    prompt: "Set up Application Insights and Log Analytics for monitoring"
  },
  {
    id: "security",
    title: "Security Config",
    description: "Implement security best practices",
    color: "bg-pink-500 hover:bg-pink-600",
    prompt: "Configure Key Vault, managed identities, and security policies"
  }
];

export function ConversationStarter({
  onTemplateSelect,
  onSendMessage,
  input,
  setInput,
  onBackClick,
  onEnvironmentClick
}: ConversationStarterProps) {
  const handleTemplateClick = (template: ConversationTemplate) => {
    setInput(template.prompt);
    onTemplateSelect(template.prompt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBackClick}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold">New Chat</h1>
              <p className="text-sm text-slate-400">Infrastructure as Code Generation</p>
            </div>
          </div>
          <Button 
            onClick={onEnvironmentClick}
            variant="outline"
            className="border-slate-600 hover:bg-slate-800"
          >
            <Settings className="w-4 h-4 mr-2" />
            Environment
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Start Conversation</h2>
          <p className="text-xl text-slate-400">
            Generate and deploy cloud infrastructure through conversation
          </p>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateClick(template)}
              className={`${template.color} p-6 rounded-xl text-white text-left hover:scale-105 transition-all duration-200 shadow-lg`}
            >
              <h3 className="font-semibold mb-2">{template.title}</h3>
              <p className="text-sm opacity-90">{template.description}</p>
            </button>
          ))}
        </div>

        {/* Input Section */}
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What infrastructure would you like to deploy?"
            className="w-full h-14 px-6 pr-14 bg-slate-800 border-slate-700 text-white placeholder-slate-400 rounded-xl text-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            disabled={!input.trim()}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
