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
        return <Badge className="bg-cyan-500/10 text-cyan-400">Running</Badge>;
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
        <Card className="bg-blue-950 border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-400">Active Deployments</p>
                <p className="text-2xl font-bold text-primary">{(stats as any)?.deployments || 0}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Rocket className="text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-950 border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-400">Cloud Providers</p>
                <p className="text-2xl font-bold text-white">{(stats as any)?.providers || 11}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                <Cloud className="text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-950 border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-400">Monthly Cost</p>
                <p className="text-2xl font-bold text-white">${(stats as any)?.cost || 2847}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                <DollarSign className="text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-950 border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-400">Uptime</p>
                <p className="text-2xl font-bold text-primary">{(stats as any)?.uptime || 99.9}%</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Deployments */}
      <Card className="bg-blue-950 border-blue-800">
        <CardHeader>
          <CardTitle className="text-cyan-400">Recent Deployments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {((deployments as any) || []).map((deployment: any) => (
              <div key={deployment.id} className="flex items-center justify-between p-4 bg-blue-900 rounded-lg border border-blue-700">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-800 rounded-lg flex items-center justify-center">
                    {getProviderIcon(deployment.provider)}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{deployment.name}</h3>
                    <p className="text-sm text-cyan-300">
                      {deployment.provider.toUpperCase()} • {deployment.region}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {getStatusBadge(deployment.status)}
                  <span className="text-sm text-slate-400">
                    {new Date(deployment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {(!deployments || (deployments as any).length === 0) && (
              <div className="text-center py-8 text-cyan-300">
                <Activity className="w-12 h-12 mx-auto mb-4 text-cyan-400" />
                <p>No deployments yet. Start your first deployment!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}