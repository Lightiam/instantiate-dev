import { useState } from "react";
import { Link } from "wouter";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Overview } from "@/components/dashboard/overview";
import { Deployments } from "@/components/dashboard/deployments";
import { Projects } from "@/components/dashboard/projects";
import { Infrastructure } from "@/components/dashboard/infrastructure";
import { Monitoring } from "@/components/dashboard/monitoring";
import { Settings } from "@/components/dashboard/settings";
import { AzureDocker } from "@/components/dashboard/azure-docker";
import { MultiCloudOverview } from "@/components/dashboard/multi-cloud-overview";
import { CloudInsightsDashboard } from "@/components/dashboard/cloud-insights-dashboard";
import { InfrastructureImporter } from "@/components/infrastructure/infrastructure-importer";
import { ImportWizard } from "@/components/infrastructure/import-wizard";

import { ChatPanel } from "@/components/chat/chat-panel";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/footer";
import { Plus } from "lucide-react";

type Section = "overview" | "projects" | "deployments" | "azure-docker" | "multi-cloud" | "infrastructure" | "import-wizard" | "monitoring" | "settings";

const sectionTitles: Record<Section, { title: string; subtitle: string }> = {
  overview: { title: "Overview", subtitle: "Monitor your deployments and infrastructure" },
  projects: { title: "Projects", subtitle: "Manage your development projects" },
  deployments: { title: "Deployments", subtitle: "Multi-cloud deployment management" },
  "azure-docker": { title: "Azure Docker", subtitle: "Deploy and manage Docker containers on Azure" },
  "multi-cloud": { title: "Multi-Cloud", subtitle: "Unified dashboard for all cloud providers" },
  infrastructure: { title: "Infrastructure", subtitle: "Import existing infrastructure from any cloud provider" },
  "import-wizard": { title: "Import Wizard", subtitle: "Step-by-step infrastructure import and conversion" },

  monitoring: { title: "Monitoring", subtitle: "Real-time metrics and alerts" },
  settings: { title: "Settings", subtitle: "Configure environment variables and cloud credentials" },
};

export default function Dashboard() {
  const [currentSection, setCurrentSection] = useState<Section>("overview");

  const renderSection = () => {
    switch (currentSection) {
      case "overview":
        return <Overview />;
      case "projects":
        return <Projects />;
      case "deployments":
        return <Deployments />;
      case "infrastructure":
        return <InfrastructureImporter />;
      case "import-wizard":
        return <ImportWizard />;

      case "monitoring":
        return <Monitoring />;
      case "azure-docker":
        return <AzureDocker />;
      case "multi-cloud":
        return <CloudInsightsDashboard />;
      case "settings":
        return <Settings />;
      default:
        return <Overview />;
    }
  };

  const handleSectionChange = (section: string) => {
    setCurrentSection(section as Section);
  };

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar currentSection={currentSection} onSectionChange={handleSectionChange} />
      
      <div className="flex-1 flex">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-slate-900 border-b border-slate-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-white">
                  {sectionTitles[currentSection].title}
                </h1>
                <p className="text-sm text-slate-400">
                  {sectionTitles[currentSection].subtitle}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => window.location.href = '/chat'}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Deployment
                </Button>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 p-6 overflow-auto">
            {renderSection()}
          </main>
        </div>

      </div>
      
      <Footer />
    </div>
  );
}
