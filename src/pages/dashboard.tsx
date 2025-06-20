
import React, { useState } from "react";
import { Overview } from "@/components/dashboard/overview";
import { Projects } from "@/components/dashboard/projects";
import { Monitoring } from "@/components/dashboard/monitoring";
import { Deployments } from "@/components/dashboard/deployments";
import { Settings } from "@/components/dashboard/settings";
import { IaCGenerator } from "@/components/IaCGenerator";

export default function DashboardPage() {
  const [currentSection, setCurrentSection] = useState("overview");

  const renderContent = () => {
    switch (currentSection) {
      case "overview":
        return <Overview />;
      case "projects":
        return <Projects />;
      case "multi-cloud":
        return <IaCGenerator />;
      case "monitoring":
        return <Monitoring />;
      case "deployments":
        return <Deployments />;
      case "settings":
        return <Settings />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <div className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="text-xl font-bold text-primary font-mono">&lt;/&gt;</div>
            <span className="text-xl font-bold text-white">Instanti8.dev</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Navigation
          </div>
          <button 
            onClick={() => setCurrentSection("overview")}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${currentSection === "overview" ? "bg-primary text-black" : "text-white hover:bg-slate-800"}`}
          >
            <span>Overview</span>
          </button>
          <button 
            onClick={() => setCurrentSection("projects")}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${currentSection === "projects" ? "bg-primary text-black" : "text-white hover:bg-slate-800"}`}
          >
            <span>Projects</span>
          </button>
          <button 
            onClick={() => setCurrentSection("multi-cloud")}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${currentSection === "multi-cloud" ? "bg-primary text-black" : "text-white hover:bg-slate-800"}`}
          >
            <span>Multi-Cloud</span>
          </button>
          <button 
            onClick={() => setCurrentSection("monitoring")}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${currentSection === "monitoring" ? "bg-primary text-black" : "text-white hover:bg-slate-800"}`}
          >
            <span>Monitoring</span>
          </button>
          <button 
            onClick={() => setCurrentSection("deployments")}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${currentSection === "deployments" ? "bg-primary text-black" : "text-white hover:bg-slate-800"}`}
          >
            <span>Deployments</span>
          </button>
          <button 
            onClick={() => setCurrentSection("settings")}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${currentSection === "settings" ? "bg-primary text-black" : "text-white hover:bg-slate-800"}`}
          >
            <span>Settings</span>
          </button>
        </nav>
      </div>
      <main className="flex-1 p-8">
        {renderContent()}
      </main>
    </div>
  );
}
