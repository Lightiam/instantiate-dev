import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { Dashboard } from "@/pages/dashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-slate-50">
        <Switch>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/">
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
              <div className="container mx-auto px-4 py-16">
                <div className="text-center">
                  <h1 className="text-5xl font-bold mb-6">Instantiate.dev</h1>
                  <p className="text-xl mb-8">Multi-Cloud Deployment Platform</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                    <div className="bg-slate-800 p-6 rounded-lg">
                      <h3 className="text-2xl font-semibold mb-4">11 Cloud Providers</h3>
                      <p>AWS, Azure, GCP, Alibaba, IBM, Oracle, DigitalOcean, Linode, Huawei, Tencent, Netlify</p>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-lg">
                      <h3 className="text-2xl font-semibold mb-4">Real-time Analytics</h3>
                      <p>Live monitoring, performance metrics, cost analysis, and security assessments</p>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-lg">
                      <h3 className="text-2xl font-semibold mb-4">AI-Powered</h3>
                      <p>Intelligent deployment assistance and infrastructure optimization</p>
                    </div>
                  </div>
                  <div className="mt-12">
                    <a href="/dashboard" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 inline-block">
                      Access Dashboard
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Route>
        </Switch>
      </div>
    </QueryClientProvider>
  );
}

export default App;