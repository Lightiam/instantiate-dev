import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Cloud, 
  Server, 
  DollarSign, 
  Activity, 
  Globe, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  TrendingUp
} from "lucide-react";
import { CloudArchitectureDiagram } from "./cloud-architecture-diagram";
import { IsometricCloudDiagram } from "./isometric-cloud-diagram";
// Using only Lucide icons for reliability

interface CloudResource {
  id: string;
  name: string;
  type: string;
  provider: string;
  region: string;
  status: string;
  cost?: number;
  url?: string;
  createdAt: string;
  lastChecked: string;
}

interface ProviderStatus {
  provider: string;
  status: 'connected' | 'error' | 'not-configured';
  resourceCount: number;
  totalCost?: number;
  lastSync: string;
  error?: string;
}

interface DeploymentStats {
  totalResources: number;
  totalCost: number;
  providerDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
  regionDistribution: Record<string, number>;
}

const providerIcons: Record<string, any> = {
  aws: Cloud,
  azure: Cloud,
  gcp: Cloud,
  alibaba: Cloud,
  ibm: Server,
  oracle: Server,
  digitalocean: Cloud,
  linode: Server,
  huawei: Cloud,
  tencent: Cloud,

};

const providerNames: Record<string, string> = {
  aws: 'Amazon Web Services',
  azure: 'Microsoft Azure',
  gcp: 'Google Cloud Platform',
  alibaba: 'Alibaba Cloud',
  ibm: 'IBM Cloud',
  oracle: 'Oracle Cloud',
  digitalocean: 'DigitalOcean',
  linode: 'Linode',
  huawei: 'Huawei Cloud',
  tencent: 'Tencent Cloud',

};

const statusColors: Record<string, string> = {
  connected: 'bg-green-500',
  'not-configured': 'bg-gray-400',
  running: 'bg-green-500',
  deployed: 'bg-blue-500',
  deploying: 'bg-yellow-500',
  stopped: 'bg-gray-500',
  error: 'bg-red-500'
};

export function MultiCloudOverview() {
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const { data: resources, refetch: refetchResources } = useQuery({
    queryKey: ['/api/multi-cloud/resources'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: providerStatuses, refetch: refetchStatuses } = useQuery({
    queryKey: ['/api/multi-cloud/status'],
    refetchInterval: 60000 // Refresh every minute
  });

  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['/api/multi-cloud/stats'],
    refetchInterval: 30000
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchResources(),
        refetchStatuses(),
        refetchStats()
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredResources = resources?.filter((resource: CloudResource) => 
    selectedProvider === 'all' || resource.provider === selectedProvider
  ) || [];

  const getProviderIcon = (provider: string) => {
    const IconComponent = providerIcons[provider];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : <Cloud className="h-4 w-4" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'running':
      case 'deployed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'deploying':
        return <Activity className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Multi-Cloud Dashboard</h2>
          <p className="text-muted-foreground">
            Unified view across all cloud providers
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalResources || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across {Object.keys(providerNames).length} providers
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
              ${(stats?.totalCost || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Estimated monthly spend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Providers</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {providerStatuses?.filter((p: ProviderStatus) => p.status === 'connected').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Of {providerStatuses?.length || 0} configured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regions</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(stats?.regionDistribution || {}).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Global deployment regions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Provider Status Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Status</CardTitle>
          <CardDescription>
            Connection status and resource counts for each cloud provider
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {providerStatuses?.map((provider: ProviderStatus) => (
              <div
                key={provider.provider}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                onClick={() => setSelectedProvider(
                  selectedProvider === provider.provider ? 'all' : provider.provider
                )}
              >
                <div className="flex items-center space-x-3">
                  {getProviderIcon(provider.provider)}
                  <div>
                    <p className="font-medium text-sm">
                      {providerNames[provider.provider]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {provider.resourceCount} resources
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {provider.totalCost && (
                    <span className="text-xs font-mono">
                      ${provider.totalCost.toFixed(0)}
                    </span>
                  )}
                  {getStatusIcon(provider.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resource Management Tabs */}
      <Tabs defaultValue="architecture" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger 
            value="overview" 
            onClick={() => setSelectedProvider('all')}
          >
            Overview
          </TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Provider Distribution */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Resource Distribution</CardTitle>
                <CardDescription>Resources by cloud provider</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats?.providerDistribution || {}).map(([provider, count]) => (
                    count > 0 && (
                      <div key={provider} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getProviderIcon(provider)}
                          <span className="text-sm font-medium">
                            {providerNames[provider]}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress 
                            value={(count / (stats?.totalResources || 1)) * 100} 
                            className="w-20 h-2"
                          />
                          <span className="text-sm text-muted-foreground">{count}</span>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Overview</CardTitle>
                <CardDescription>Resource health across all providers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats?.statusDistribution || {}).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
                        <span className="text-sm font-medium capitalize">{status}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="architecture" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>3D Infrastructure View</CardTitle>
                <CardDescription>
                  Isometric visualization of your multi-cloud infrastructure with live data flows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IsometricCloudDiagram />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Network Topology</CardTitle>
                <CardDescription>
                  Circular network diagram showing AI orchestration and provider connections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CloudArchitectureDiagram />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          {/* Resource List */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedProvider === 'all' 
                  ? 'All Resources' 
                  : `${providerNames[selectedProvider]} Resources`
                }
              </CardTitle>
              <CardDescription>
                {filteredResources.length} resources
                {selectedProvider !== 'all' && (
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => setSelectedProvider('all')}
                    className="ml-2"
                  >
                    View all
                  </Button>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredResources.map((resource: CloudResource) => (
                  <div
                    key={`${resource.provider}-${resource.id}`}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {getProviderIcon(resource.provider)}
                      <div>
                        <p className="font-medium text-sm">{resource.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {resource.type} • {resource.region}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {resource.cost && (
                        <span className="text-xs font-mono text-muted-foreground">
                          ${resource.cost.toFixed(2)}/mo
                        </span>
                      )}
                      
                      <Badge variant="outline" className="text-xs">
                        {resource.status}
                      </Badge>
                      
                      {resource.url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(resource.url, '_blank')}
                        >
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Analytics Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
                <CardDescription>Spending breakdown by provider</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {providerStatuses
                    ?.filter((p: ProviderStatus) => p.totalCost && p.totalCost > 0)
                    .sort((a: ProviderStatus, b: ProviderStatus) => (b.totalCost || 0) - (a.totalCost || 0))
                    .map((provider: ProviderStatus) => (
                      <div key={provider.provider} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getProviderIcon(provider.provider)}
                          <span className="text-sm font-medium">
                            {providerNames[provider.provider]}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress 
                            value={((provider.totalCost || 0) / (stats?.totalCost || 1)) * 100} 
                            className="w-20 h-2"
                          />
                          <span className="text-sm font-mono">
                            ${(provider.totalCost || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Distribution</CardTitle>
                <CardDescription>Resources by geographic region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats?.regionDistribution || {})
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 8)
                    .map(([region, count]) => (
                      <div key={region} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{region}</span>
                        <div className="flex items-center space-x-2">
                          <Progress 
                            value={(count / (stats?.totalResources || 1)) * 100} 
                            className="w-20 h-2"
                          />
                          <span className="text-sm text-muted-foreground">{count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
