import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Cloud, 
  Server, 
  Database, 
  Activity,
  Settings,
  BarChart3
} from "lucide-react";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">Across 11 providers</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Uptime</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">99.7%</div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Connected Providers</CardTitle>
                  <Cloud className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">11</div>
                  <p className="text-xs text-muted-foreground">All providers active</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$2.40</div>
                  <p className="text-xs text-muted-foreground">Netlify resources</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                <Card key={provider.name}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{provider.name}</CardTitle>
                      <div className={`w-3 h-3 rounded-full ${provider.color}`}></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge variant={provider.status === 'Active' ? 'default' : 'secondary'}>
                          {provider.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Resources</span>
                        <span className="text-sm font-medium">{provider.resources}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      case "analytics":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>Real-time metrics and performance data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                  <p className="text-muted-foreground">Comprehensive analytics dashboard with real-time metrics</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return <div>Content not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Multi-Cloud Platform</h1>
          <p className="text-muted-foreground">Manage and monitor your cloud infrastructure across 11 providers</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="deployments">Deployments</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {renderContent()}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {renderContent()}
          </TabsContent>

          <TabsContent value="deployments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Deployments</CardTitle>
                <CardDescription>Manage your application deployments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Deployments</h3>
                  <p className="text-muted-foreground">Start by deploying your first application</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monitoring</CardTitle>
                <CardDescription>Real-time system monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Monitoring Dashboard</h3>
                  <p className="text-muted-foreground">Track performance metrics across all providers</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="infrastructure" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Infrastructure</CardTitle>
                <CardDescription>Manage your cloud infrastructure</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Infrastructure Management</h3>
                  <p className="text-muted-foreground">Provision and manage resources across cloud providers</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Configure your platform settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Platform Settings</h3>
                  <p className="text-muted-foreground">Customize your multi-cloud platform experience</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}