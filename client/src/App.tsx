import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Pricing from "@/pages/pricing";
import ChatWorkspace from "@/pages/chat-workspace";
import Auth from "@/pages/auth";
import AzureMonitor from "@/pages/azure-monitor";
import DeploymentTest from "@/pages/deployment-test";
import TestSimple from "@/pages/test-simple";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/auth" component={Auth} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/chat" component={ChatWorkspace} />
      <Route path="/azure-monitor" component={AzureMonitor} />
      <Route path="/test" component={DeploymentTest} />
      <Route path="/demo" component={TestSimple} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
