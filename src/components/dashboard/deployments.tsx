
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Server, Database, Globe } from "lucide-react";

interface Deployment {
  id: string;
  name: string;
  provider: string;
  region: string;
  status: 'pending' | 'generating' | 'deploying' | 'deployed' | 'failed' | 'active';
  configuration?: Record<string, string>;
  cost?: number;
  deploymentId?: string;
  resourceUrl?: string;
  ipAddress?: string;
  createdAt?: string;
  deployedAt?: string;
  isSimulation?: boolean;
  metadata?: {
    deploymentType?: string;
    resourceCount?: number;
    lastUpdated?: string;
    error?: string;
  };
}

export function Deployments() {
  const { data: deployments = [] } = useQuery<Deployment[]>({
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

  const getStatusBadge = (status: string, isSimulation?: boolean) => {
    const simulationPrefix = isSimulation ? "Preview: " : "";
    
    switch (status) {
      case "pending":
        return <Badge className="bg-slate-500/10 text-slate-500">{simulationPrefix}Pending</Badge>;
      case "generating":
        return <Badge className="bg-blue-500/10 text-blue-500">{simulationPrefix}Generating Code</Badge>;
      case "deploying":
        return <Badge className="bg-amber-500/10 text-amber-500">{simulationPrefix}Deploying</Badge>;
      case "deployed":
        return <Badge className="bg-green-500/10 text-green-500">{simulationPrefix}Deployed</Badge>;
      case "active":
        return <Badge className="bg-primary/10 text-primary">{simulationPrefix}Active</Badge>;
      case "failed":
        return <Badge className="bg-red-500/10 text-red-500">{simulationPrefix}Failed</Badge>;
      default:
        return <Badge className="bg-slate-500/10 text-slate-500">{simulationPrefix}Unknown</Badge>;
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
          {deployments.map((deployment) => (
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
                  {getStatusBadge(deployment.status, deployment.isSimulation)}
                </div>
                
                <div className="space-y-3">
                  {deployment.configuration && Object.entries(deployment.configuration).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-white">{value}</span>
                    </div>
                  ))}
                  
                  {deployment.deploymentId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Deployment ID</span>
                      <span className="text-white font-mono text-xs">{deployment.deploymentId.slice(0, 8)}...</span>
                    </div>
                  )}
                  
                  {deployment.resourceUrl && deployment.status === 'deployed' && !deployment.isSimulation && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Resource URL</span>
                      <a href={deployment.resourceUrl} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-400 hover:text-blue-300 underline truncate max-w-32">
                        {deployment.resourceUrl}
                      </a>
                    </div>
                  )}
                  
                  {deployment.ipAddress && deployment.status === 'deployed' && !deployment.isSimulation && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">IP Address</span>
                      <span className="text-white font-mono">{deployment.ipAddress}</span>
                    </div>
                  )}
                  
                  {deployment.metadata?.error && deployment.status === 'failed' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Error</span>
                      <span className="text-red-400 text-xs truncate max-w-32" title={deployment.metadata.error}>
                        {deployment.metadata.error}
                      </span>
                    </div>
                  )}
                  
                  {deployment.deployedAt && deployment.status === 'deployed' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Deployed</span>
                      <span className="text-white text-xs">
                        {new Date(deployment.deployedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Cost/Month</span>
                    <span className={getProviderColor(deployment.provider)}>
                      ${Math.round((deployment.cost || 0) / 100)}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <Button 
                    className={`flex-1 bg-${deployment.provider === 'aws' ? 'orange' : deployment.provider === 'azure' ? 'blue' : 'red'}-500/10 hover:bg-${deployment.provider === 'aws' ? 'orange' : deployment.provider === 'azure' ? 'blue' : 'red'}-500/20 ${getProviderColor(deployment.provider)} border-0`}
                    variant="outline"
                    disabled={deployment.status === 'deploying' || deployment.status === 'generating'}
                  >
                    {deployment.status === 'deploying' ? 'Deploying...' : 
                     deployment.status === 'generating' ? 'Generating...' : 
                     deployment.status === 'failed' ? 'Retry' : 
                     'Manage'}
                  </Button>
                  
                  {deployment.isSimulation && (
                    <Button 
                      className="bg-green-500/10 hover:bg-green-500/20 text-green-500 border-0"
                      variant="outline"
                      size="sm"
                    >
                      Deploy Real
                    </Button>
                  )}
                </div>
                
                {deployment.isSimulation && (
                  <div className="mt-2 text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                    ⚠️ Preview Mode - No real resources deployed
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {deployments.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-400">
              <p>No deployments found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
