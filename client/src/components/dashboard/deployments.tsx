import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Server, Database, Globe } from "lucide-react";

export function Deployments() {
  const { data: deployments } = useQuery({
    queryKey: ["/api/deployments"],
  });

  const getProviderIcon = (provider: string, size = "text-lg") => {
    switch (provider) {
      case "aws":
        return <Server className={`text-orange-500 ${size}`} />;
      case "azure":
        return <Database className={`text-blue-500 ${size}`} />;
      case "gcp":
        return <Globe className={`text-red-500 ${size}`} />;
      default:
        return null;
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

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case "aws":
        return "text-orange-500";
      case "azure":
        return "text-blue-500";
      case "gcp":
        return "text-red-500";
      default:
        return "text-slate-500";
    }
  };

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Multi-Cloud Deployments</CardTitle>
          <div className="flex items-center space-x-4">
            <Select defaultValue="all">
              <SelectTrigger className="w-48 bg-slate-950 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-slate-600">
                <SelectItem value="all">All Providers</SelectItem>
                <SelectItem value="aws">AWS</SelectItem>
                <SelectItem value="azure">Azure</SelectItem>
                <SelectItem value="gcp">Google Cloud</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {deployments?.map((deployment: any) => (
            <Card key={deployment.id} className="bg-slate-950 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                      {getProviderIcon(deployment.provider)}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{deployment.name}</h3>
                      <p className="text-sm text-slate-400">{deployment.region}</p>
                    </div>
                  </div>
                  {getStatusBadge(deployment.status)}
                </div>
                
                <div className="space-y-3">
                  {deployment.configuration && Object.entries(deployment.configuration).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-white">{value as string}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Cost/Month</span>
                    <span className={getProviderColor(deployment.provider)}>
                      ${Math.round((deployment.cost || 0) / 100)}
                    </span>
                  </div>
                </div>
                
                <Button 
                  className={`w-full mt-4 bg-${deployment.provider === 'aws' ? 'orange' : deployment.provider === 'azure' ? 'blue' : 'red'}-500/10 hover:bg-${deployment.provider === 'aws' ? 'orange' : deployment.provider === 'azure' ? 'blue' : 'red'}-500/20 ${getProviderColor(deployment.provider)} border-0`}
                  variant="outline"
                >
                  Manage Deployment
                </Button>
              </CardContent>
            </Card>
          )) || (
            <div className="col-span-full text-center py-12 text-slate-400">
              <p>No deployments found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
