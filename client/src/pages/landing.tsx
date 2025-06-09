import * as React from "react"

export function Landing() {
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
        </div>
      </div>
    </div>
  )
}
