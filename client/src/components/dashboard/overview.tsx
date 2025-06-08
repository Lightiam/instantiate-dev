import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Cloud, DollarSign, CheckCircle, Activity } from "lucide-react";
import { Server, Database, Globe } from "lucide-react";

export function Overview() {
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: deployments } = useQuery({
    queryKey: ["/api/deployments"],
  });

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "aws":
        return <Server className="text-orange-500" />;
      case "azure":
        return <Database className="text-blue-500" />;
      case "gcp":
        return <Globe className="text-red-500" />;
      default:
        return <Cloud className="text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return <Badge className="bg-primary/10 text-primary">Running</Badge>;
      case "deploying":
        return <Badge className="bg-amber-500/10 text-amber-500">Deploying</Badge>;
      case "failed":
        return <Badge className="bg-red-500/10 text-red-500">Failed</Badge>;
      default:
        return <Badge className="bg-slate-500/10 text-slate-500">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Deployments</p>
                <p className="text-2xl font-bold text-primary">{stats?.deployments || 0}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Rocket className="text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Cloud Providers</p>
                <p className="text-2xl font-bold text-white">{stats?.providers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Cloud className="text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Monthly Cost</p>
                <p className="text-2xl font-bold text-white">${stats?.cost || 0}</p>
              </div>
              <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <DollarSign className="text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Uptime</p>
                <p className="text-2xl font-bold text-primary">{stats?.uptime || 0}%</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Deployments */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Deployments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deployments?.map((deployment: any) => (
              <div key={deployment.id} className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-slate-700">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                    {getProviderIcon(deployment.provider)}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{deployment.name}</h3>
                    <p className="text-sm text-slate-400">
                      {deployment.provider.toUpperCase()} • {deployment.region}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {getStatusBadge(deployment.status)}
                  <span className="text-sm text-slate-400">
                    {new Date(deployment.lastDeployedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-slate-400">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No deployments found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
