import { useState, useEffect } from "react";
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
  Clock,
  Zap,
  Globe,
  Shield,
  BarChart3
} from "lucide-react";

interface CloudMetrics {
  provider: string;
  status: string;
  resources: {
    total: number;
    running: number;
    stopped: number;
    error: number;
  };
  performance: {
    uptime: number;
    responseTime: number;
    throughput: number;
  };
  costs: {
    current: number;
    projected: number;
    trend: string;
  };
  security: {
    vulnerabilities: number;
    compliant: boolean;
    lastScan: string;
  };
  regions: string[];
  lastUpdated: string;
}

interface DeploymentInsight {
  provider: string;
  deploymentId: string;
  name: string;
  status: string;
  health: number;
  metrics: {
    cpu: number;
    memory: number;
    network: number;
    requests: number;
  };
  alerts: Array<{
    type: string;
    message: string;
    severity: string;
  }>;
}

export function CloudInsightsDashboard() {
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('24h');

  const { data: providerMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/multi-cloud/metrics', timeRange],
    refetchInterval: 30000
  });

  const { data: deploymentInsights, isLoading: insightsLoading } = useQuery({
    queryKey: ['/api/multi-cloud/insights', selectedProvider, timeRange],
    refetchInterval: 15000
  });

  const { data: costAnalysis } = useQuery({
    queryKey: ['/api/multi-cloud/cost-analysis', timeRange],
    refetchInterval: 300000 // 5 minutes
  });

  const { data: securityReport } = useQuery({
    queryKey: ['/api/multi-cloud/security', timeRange],
    refetchInterval: 600000 // 10 minutes
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'running':
      case 'active':
        return 'text-cyan-400';
      case 'warning':
      case 'degraded':
        return 'text-yellow-500';
      case 'error':
      case 'failed':
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-slate-500';
    }
  };

  const getHealthScore = (metrics: CloudMetrics) => {
    if (!metrics) return 0;
    const uptime = metrics.performance?.uptime || 0;
    const resourceHealth = (metrics.resources?.running || 0) / (metrics.resources?.total || 1) * 100;
    const securityScore = metrics.security?.compliant ? 100 : 70;
    return Math.round((uptime + resourceHealth + securityScore) / 3);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cloud Insights Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time analytics and monitoring across all cloud providers
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <select 
            value={selectedProvider} 
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="all">All Providers</option>
            <option value="aws">AWS</option>
            <option value="azure">Azure</option>
            <option value="gcp">Google Cloud</option>
            <option value="netlify">Netlify</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {providerMetrics?.totalResources || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{providerMetrics?.resourcesGrowth || 0}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${costAnalysis?.totalCost?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              {costAnalysis?.trend === 'up' ? '+' : '-'}{costAnalysis?.change || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {providerMetrics?.averageUptime?.toFixed(1) || '99.9'}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all providers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {securityReport?.overallScore || 95}/100
            </div>
            <p className="text-xs text-muted-foreground">
              {securityReport?.vulnerabilities || 0} vulnerabilities found
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="providers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {providerMetrics?.providers?.map((provider: CloudMetrics) => (
              <Card key={provider.provider} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg capitalize">{provider.provider}</CardTitle>
                    <Badge 
                      variant={provider.status === 'healthy' ? 'default' : 'destructive'}
                      className={getStatusColor(provider.status)}
                    >
                      {provider.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Health Score: {getHealthScore(provider)}/100
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Resources</span>
                      <span>{provider.resources?.total || 0}</span>
                    </div>
                    <Progress 
                      value={(provider.resources?.running || 0) / (provider.resources?.total || 1) * 100} 
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{provider.resources?.running || 0} running</span>
                      <span>{provider.resources?.error || 0} errors</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Uptime</span>
                      </div>
                      <div className="font-semibold">{provider.performance?.uptime?.toFixed(1) || '99.9'}%</div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3" />
                        <span>Cost</span>
                      </div>
                      <div className="font-semibold">${provider.costs?.current?.toFixed(2) || '0.00'}</div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1">
                        <Globe className="h-3 w-3" />
                        <span>Regions</span>
                      </div>
                      <div className="font-semibold">{provider.regions?.length || 0}</div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1">
                        <Zap className="h-3 w-3" />
                        <span>Response</span>
                      </div>
                      <div className="font-semibold">{provider.performance?.responseTime || 0}ms</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="deployments" className="space-y-4">
          <div className="space-y-4">
            {deploymentInsights?.map((deployment: DeploymentInsight) => (
              <Card key={deployment.deploymentId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{deployment.name}</CardTitle>
                      <CardDescription>
                        {deployment.provider} • {deployment.deploymentId}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={deployment.status === 'running' ? 'default' : 'destructive'}>
                        {deployment.status}
                      </Badge>
                      <div className="text-right">
                        <div className="text-sm font-semibold">Health: {deployment.health}%</div>
                        <Progress value={deployment.health} className="w-20 h-2" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{deployment.metrics?.cpu || 0}%</div>
                      <div className="text-xs text-muted-foreground">CPU</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{deployment.metrics?.memory || 0}%</div>
                      <div className="text-xs text-muted-foreground">Memory</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{deployment.metrics?.network || 0}</div>
                      <div className="text-xs text-muted-foreground">Network MB/s</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{deployment.metrics?.requests || 0}</div>
                      <div className="text-xs text-muted-foreground">Requests/min</div>
                    </div>
                  </div>

                  {deployment.alerts?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Active Alerts</h4>
                      {deployment.alerts.map((alert, index) => (
                        <div key={index} className={`flex items-center space-x-2 p-2 rounded-md ${
                          alert.severity === 'critical' ? 'bg-red-50 border border-red-200' :
                          alert.severity === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                          'bg-blue-50 border border-blue-200'
                        }`}>
                          <AlertTriangle className={`h-4 w-4 ${
                            alert.severity === 'critical' ? 'text-red-500' :
                            alert.severity === 'warning' ? 'text-yellow-500' :
                            'text-blue-500'
                          }`} />
                          <span className="text-sm">{alert.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Response Times</CardTitle>
                <CardDescription>Average response times by provider</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {providerMetrics?.providers?.map((provider: CloudMetrics) => (
                    <div key={provider.provider} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{provider.provider}</span>
                        <span>{provider.performance?.responseTime || 0}ms</span>
                      </div>
                      <Progress value={Math.max(0, 100 - (provider.performance?.responseTime || 0) / 10)} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Throughput</CardTitle>
                <CardDescription>Requests per second by provider</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {providerMetrics?.providers?.map((provider: CloudMetrics) => (
                    <div key={provider.provider} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{provider.provider}</span>
                        <span>{provider.performance?.throughput || 0} req/s</span>
                      </div>
                      <Progress value={(provider.performance?.throughput || 0) / 10} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {providerMetrics?.providers?.map((provider: CloudMetrics) => (
              <Card key={provider.provider}>
                <CardHeader>
                  <CardTitle className="capitalize">{provider.provider}</CardTitle>
                  <CardDescription>Cost breakdown and trends</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold">${provider.costs?.current?.toFixed(2) || '0.00'}</div>
                    <div className="text-sm text-muted-foreground">Current month</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">${provider.costs?.projected?.toFixed(2) || '0.00'}</div>
                    <div className="text-sm text-muted-foreground">Projected</div>
                  </div>
                  <div className={`flex items-center space-x-1 ${
                    provider.costs?.trend === 'up' ? 'text-red-500' : 'text-green-500'
                  }`}>
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">{provider.costs?.trend === 'up' ? 'Increasing' : 'Decreasing'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Security Overview</CardTitle>
                <CardDescription>Overall security posture</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">{securityReport?.overallScore || 95}/100</div>
                  <div className="text-sm text-muted-foreground">Security Score</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Compliant Resources</span>
                    <span>{securityReport?.compliantResources || 0}%</span>
                  </div>
                  <Progress value={securityReport?.compliantResources || 95} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vulnerabilities</CardTitle>
                <CardDescription>Security issues by severity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-red-500">{securityReport?.critical || 0}</div>
                    <div className="text-xs text-muted-foreground">Critical</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-500">{securityReport?.high || 0}</div>
                    <div className="text-xs text-muted-foreground">High</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-500">{securityReport?.medium || 0}</div>
                    <div className="text-xs text-muted-foreground">Medium</div>
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