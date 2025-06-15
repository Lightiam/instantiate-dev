
import React from "react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-xl font-semibold mb-2">Active Deployments</h3>
            <p className="text-3xl font-bold text-primary">12</p>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-xl font-semibold mb-2">Total Resources</h3>
            <p className="text-3xl font-bold text-primary">48</p>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-xl font-semibold mb-2">Cloud Providers</h3>
            <p className="text-3xl font-bold text-primary">9</p>
          </div>
        </div>
      </div>
    </div>
  );
}
