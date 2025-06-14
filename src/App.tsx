import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Landing } from '@/pages/landing';
import Dashboard from '@/pages/dashboard';
import { Pricing } from '@/pages/pricing';
import { ChatWorkspace } from '@/pages/chat-workspace';
import { Auth } from '@/pages/auth';
import { AzureMonitor } from '@/pages/azure-monitor';
import { DeploymentTest } from '@/pages/deployment-test';
import { TestSimple } from '@/pages/test-simple';
import { NotFound } from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function App() {
  const currentPath = window.location.pathname;
  
  const renderPage = () => {
    switch (currentPath) {
      case '/dashboard':
        return <Dashboard />;
      case '/pricing':
        return <Pricing />;
      case '/chat':
        return <ChatWorkspace />;
      case '/auth':
        return <Auth />;
      case '/azure-monitor':
        return <AzureMonitor />;
      case '/deployment-test':
        return <DeploymentTest />;
      case '/test-simple':
        return <TestSimple />;
      default:
        if (currentPath !== '/') {
          return <NotFound />;
        }
        return <Landing />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {renderPage()}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
