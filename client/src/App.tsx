import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function Dashboard() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Multi-Cloud Platform</h1>
          <p className="text-muted-foreground">Manage and monitor your cloud infrastructure across 11 providers</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Resources</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-lg">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Uptime</p>
                <p className="text-2xl font-bold">99.7%</p>
              </div>
              <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-lg">⚡</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Connected Providers</p>
                <p className="text-2xl font-bold">11</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-lg">☁️</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Cost</p>
                <p className="text-2xl font-bold">$2.40</p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-lg">💰</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'AWS', status: 'Connected', resources: 0, color: 'bg-orange-500' },
            { name: 'Azure', status: 'Connected', resources: 0, color: 'bg-blue-500' },
            { name: 'Google Cloud', status: 'Connected', resources: 0, color: 'bg-green-500' },
            { name: 'Netlify', status: 'Active', resources: 24, color: 'bg-teal-500' },
            { name: 'DigitalOcean', status: 'Connected', resources: 0, color: 'bg-blue-600' },
            { name: 'Alibaba Cloud', status: 'Connected', resources: 0, color: 'bg-yellow-500' },
            { name: 'IBM Cloud', status: 'Connected', resources: 0, color: 'bg-blue-700' },
            { name: 'Oracle Cloud', status: 'Connected', resources: 0, color: 'bg-red-500' },
            { name: 'Linode', status: 'Connected', resources: 0, color: 'bg-green-600' },
            { name: 'Huawei Cloud', status: 'Connected', resources: 0, color: 'bg-red-600' },
            { name: 'Tencent Cloud', status: 'Connected', resources: 0, color: 'bg-blue-800' }
          ].map((provider) => (
            <div key={provider.name} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{provider.name}</h3>
                <div className={`w-3 h-3 rounded-full ${provider.color}`}></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    provider.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {provider.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Resources</span>
                  <span className="text-sm font-medium">{provider.resources}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LandingPage() {
  return (
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
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/" component={LandingPage} />
      </Switch>
    </QueryClientProvider>
  );
}

export default App;