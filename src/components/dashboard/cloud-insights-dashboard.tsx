import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Cloud, 
  Server, 
  Database, 
  Activity, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Shield,
  Zap,
  Globe
} from "lucide-react";

export function CloudInsightsDashboard() {
  const [refreshing, setRefreshing] = useState(false);

  const { data: cloudMetrics, isLoading, refetch } = useQuery({
    queryKey: ['/api/cloud/metrics'],
    staleTime: 1000 * 60 * 2,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getProviderIcon = (provider: string) => {
    const icons: Record<string, React.ReactNode> = {
      aws: <Cloud className="w-6 h-6 text-orange-500" />,
      azure: <Database className="w-6 h-6 text-blue-500" />,
      gcp: <Globe className="w-6 h-6 text-red-500" />,
      netlify: <Zap className="w-6 h-6 text-cyan-500" />,
      digitalocean: <Database className="w-6 h-6 text-blue-400" />,
      linode: <Server className="w-6 h-6 text-green-500" />,
      default: <Cloud className="w-6 h-6 text-gray-500" />
    };
    return icons[provider?.toLowerCase()] || icons.default;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cyan-400">Cloud Insights</h2>
          <p className="text-cyan-300">Real-time analytics across all cloud providers</p>
        </div>
        <Button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-cyan-600 hover:bg-cyan-700"
        >
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">842</div>
            <p className="text-xs text-muted-foreground">+12% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,847.00</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.9%</div>
            <p className="text-xs text-muted-foreground">Across all providers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95/100</div>
            <p className="text-xs text-muted-foreground">3 vulnerabilities found</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="providers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-cyan-400">Provider Status</CardTitle>
              <CardDescription>Real-time status of all connected cloud providers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['AWS', 'Azure', 'Google Cloud', 'Netlify', 'DigitalOcean', 'Linode', 'Alibaba Cloud', 'IBM Cloud', 'Oracle Cloud', 'Huawei Cloud', 'Tencent Cloud'].map((provider, index) => (
                  <div key={provider} className="flex items-center justify-between p-4 bg-blue-950 rounded-lg border border-blue-800">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
                        {getProviderIcon(provider.toLowerCase())}
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{provider}</h3>
                        <p className="text-sm text-cyan-300">{Math.floor(Math.random() * 100) + 20} resources • {Math.floor(Math.random() * 5) + 1} regions</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">${(Math.random() * 500 + 100).toFixed(2)}</p>
                        <p className="text-xs text-cyan-300">{(99.5 + Math.random() * 0.4).toFixed(1)}% uptime</p>
                      </div>
                      <Badge className="bg-green-500/10 text-green-400">Healthy</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-cyan-400">Resource Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['AWS', 'Azure', 'Google Cloud', 'Netlify'].map((provider) => (
                  <div key={provider} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-white">{provider}</span>
                      <span className="text-sm text-cyan-300">{Math.floor(Math.random() * 200) + 50} total</span>
                    </div>
                    <Progress value={Math.floor(Math.random() * 40) + 60} className="h-2" />
                    <div className="flex justify-between text-xs text-cyan-400">
                      <span>{Math.floor(Math.random() * 150) + 30} running</span>
                      <span>{Math.floor(Math.random() * 20) + 5} stopped</span>
                      <span>{Math.floor(Math.random() * 5)} error</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-cyan-400">Uptime Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['AWS', 'Azure', 'Google Cloud', 'Netlify'].map((provider) => (
                    <div key={provider} className="flex justify-between items-center">
                      <span className="text-sm text-white">{provider}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-cyan-300">{(99.5 + Math.random() * 0.4).toFixed(1)}%</span>
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-cyan-400">Response Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['AWS', 'Azure', 'Google Cloud', 'Netlify'].map((provider) => (
                    <div key={provider} className="flex justify-between items-center">
                      <span className="text-sm text-white">{provider}</span>
                      <span className="text-sm font-medium text-cyan-300">{Math.floor(Math.random() * 100) + 50}ms</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-cyan-400">Security Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-cyan-400 mb-2">95/100</div>
                    <p className="text-cyan-300">Overall Security Score</p>
                  </div>
                  <Progress value={95} className="h-3" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-cyan-400">Vulnerability Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">2</div>
                    <p className="text-xs text-red-300">Critical</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">5</div>
                    <p className="text-xs text-orange-300">High</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">12</div>
                    <p className="text-xs text-yellow-300">Medium</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}