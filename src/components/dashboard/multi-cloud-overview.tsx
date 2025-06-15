
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cloud, DollarSign, Server, TrendingUp, RefreshCw, AlertTriangle } from "lucide-react";

interface CloudResource {
  id: string;
  name: string;
  type: string;
  provider: string;
  region: string;
  status: string;
  cost?: number;
  createdAt: string;
}

interface DeploymentStats {
  totalResources: number;
  totalCost: number;
  providerDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
  regionDistribution: Record<string, number>;
}

interface ProviderStatus {
  provider: string;
  status: 'connected' | 'error' | 'not-configured';
  resourceCount: number;
  totalCost?: number;
  lastSync: string;
  error?: string;
}

export function MultiCloudOverview() {
  const { data: resources = [], isLoading: resourcesLoading, refetch: refetchResources } = useQuery<CloudResource[]>({
    queryKey: ["/api/multi-cloud/resources"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<DeploymentStats>({
    queryKey: ["/api/multi-cloud/stats"],
  });

  const { data: providerStatuses = [], isLoading: statusesLoading } = useQuery<ProviderStatus[]>({
    queryKey: ["/api/multi-cloud/status"],
  });

  const handleSync = async () => {
    try {
      await fetch('/api/multi-cloud/sync', { method: 'POST' });
      refetchResources();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  if (resourcesLoading || statsLoading || statusesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Multi-Cloud Overview</h2>
          <Button disabled>
            <RefreshCw className="w-4 h-4 mr-2" />
            Loading...
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-slate-900 border-slate-700">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-slate-700 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const activeResources = resources.filter(r => r.status === 'running' || r.status === 'active');
  const totalCost = stats?.totalCost || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Multi-Cloud Overview</h2>
          <p className="text-slate-400">Monitor and manage your multi-cloud infrastructure</p>
        </div>
        <Button onClick={handleSync} className="bg-primary hover:bg-primary/90">
          <RefreshCw className="w-4 h-4 mr-2" />
          Sync All
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Server className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-slate-400">Total Resources</span>
            </div>
            <div className="text-2xl font-bold text-white mt-2">
              {stats?.totalResources || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {activeResources.length} active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-slate-400">Monthly Cost</span>
            </div>
            <div className="text-2xl font-bold text-white mt-2">
              ${totalCost.toFixed(2)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Estimated
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Cloud className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-slate-400">Cloud Providers</span>
            </div>
            <div className="text-2xl font-bold text-white mt-2">
              {providerStatuses.filter(p => p.status === 'connected').length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {providerStatuses.length} total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-slate-400">Regions</span>
            </div>
            <div className="text-2xl font-bold text-white mt-2">
              {Object.keys(stats?.regionDistribution || {}).length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active regions
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Provider Status</CardTitle>
            <CardDescription className="text-slate-400">
              Connection status for each cloud provider
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {providerStatuses.map((provider) => (
              <div key={provider.provider} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="capitalize font-medium text-white">
                    {provider.provider}
                  </div>
                  <Badge 
                    variant={provider.status === 'connected' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {provider.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-sm text-white">{provider.resourceCount} resources</div>
                  {provider.totalCost && (
                    <div className="text-xs text-slate-400">${provider.totalCost.toFixed(2)}/mo</div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Resource Distribution</CardTitle>
            <CardDescription className="text-slate-400">
              Resources by provider and status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats?.providerDistribution || {}).map(([provider, count]) => (
              count > 0 && (
                <div key={provider} className="flex items-center justify-between">
                  <span className="capitalize text-white">{provider}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ 
                          width: `${((count as number) / (stats?.totalResources || 1)) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-slate-400">{count}</span>
                  </div>
                </div>
              )
            ))}

            <div className="pt-4 border-t border-slate-700">
              <h4 className="text-sm font-medium text-white mb-3">Status Distribution</h4>
              {Object.entries(stats?.statusDistribution || {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between mb-2">
                  <span className="capitalize text-slate-300">{status}</span>
                  <span className="text-sm text-slate-400">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
