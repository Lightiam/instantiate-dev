import React from 'react';

function App() {
  const currentPath = window.location.pathname;
  
  if (currentPath === '/dashboard') {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Multi-Cloud Platform</h1>
            <p className="text-slate-600">Manage and monitor your cloud infrastructure across 11 providers</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Total Resources</p>
                  <p className="text-3xl font-bold text-slate-900">24</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xl">📊</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Average Uptime</p>
                  <p className="text-3xl font-bold text-slate-900">99.7%</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xl">⚡</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Connected Providers</p>
                  <p className="text-3xl font-bold text-slate-900">11</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-xl">☁️</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Monthly Cost</p>
                  <p className="text-3xl font-bold text-slate-900">$2.40</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-xl">💰</span>
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
              <div key={provider.name} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">{provider.name}</h3>
                  <div className={`w-4 h-4 rounded-full ${provider.color}`}></div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Status</span>
                    <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                      provider.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {provider.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Resources</span>
                    <span className="text-sm font-semibold text-slate-900">{provider.resources}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Platform Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">99.7%</div>
                <div className="text-sm text-slate-500">System Uptime</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">24</div>
                <div className="text-sm text-slate-500">Active Resources</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">11</div>
                <div className="text-sm text-slate-500">Cloud Providers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">Operational</div>
                <div className="text-sm text-slate-500">System Status</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Instantiate.dev
          </h1>
          <p className="text-xl mb-8 text-slate-300">Multi-Cloud Deployment Platform</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-6xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700">
              <div className="text-4xl mb-4">☁️</div>
              <h3 className="text-2xl font-semibold mb-4">11 Cloud Providers</h3>
              <p className="text-slate-300">AWS, Azure, GCP, Alibaba, IBM, Oracle, DigitalOcean, Linode, Huawei, Tencent, Netlify</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-2xl font-semibold mb-4">Real-time Analytics</h3>
              <p className="text-slate-300">Live monitoring, performance metrics, cost analysis, and security assessments</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-2xl font-semibold mb-4">AI-Powered</h3>
              <p className="text-slate-300">Intelligent deployment assistance and infrastructure optimization</p>
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
          
          <div className="mt-16 bg-slate-800/30 backdrop-blur-sm p-8 rounded-xl border border-slate-700 max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6">Live Platform Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">99.7%</div>
                <div className="text-sm text-slate-400">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">24</div>
                <div className="text-sm text-slate-400">Resources</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">11</div>
                <div className="text-sm text-slate-400">Providers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">$2.40</div>
                <div className="text-sm text-slate-400">Monthly Cost</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;