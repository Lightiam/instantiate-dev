import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Server, Database, Globe, Activity, Cpu, HardDrive } from "lucide-react";

export function Infrastructure() {
  const infrastructureData = [
    {
      provider: "AWS",
      icon: Server,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      resources: [
        { name: "EC2 Instances", count: 8, status: "healthy" },
        { name: "RDS Databases", count: 3, status: "healthy" },
        { name: "Load Balancers", count: 2, status: "healthy" }
      ],
      metrics: { cpu: 45, memory: 67, storage: 34 }
    },
    {
      provider: "Azure", 
      icon: Database,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      resources: [
        { name: "App Services", count: 5, status: "deploying" },
        { name: "SQL Databases", count: 2, status: "healthy" },
        { name: "Storage Accounts", count: 4, status: "healthy" }
      ],
      metrics: { cpu: 62, memory: 78, storage: 45 }
    },
    {
      provider: "GCP",
      icon: Globe, 
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      resources: [
        { name: "Compute Engine", count: 6, status: "healthy" },
        { name: "Cloud SQL", count: 2, status: "healthy" },
        { name: "Cloud Storage", count: 8, status: "healthy" }
      ],
      metrics: { cpu: 38, memory: 55, storage: 67 }
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-primary/10 text-primary">Healthy</Badge>;
      case "deploying":
        return <Badge className="bg-amber-500/10 text-amber-500">Deploying</Badge>;
      default:
        return <Badge className="bg-red-500/10 text-red-500">Error</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {infrastructureData.map((infra) => (
          <Card key={infra.provider} className="bg-slate-900 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${infra.bgColor} rounded-lg flex items-center justify-center`}>
                    <infra.icon className={infra.color} />
                  </div>
                  <CardTitle className="text-white">{infra.provider}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Resources */}
              <div className="space-y-3">
                {infra.resources.map((resource) => (
                  <div key={resource.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">{resource.name}</p>
                      <p className="text-xs text-slate-400">{resource.count} instances</p>
                    </div>
                    {getStatusBadge(resource.status)}
                  </div>
                ))}
              </div>

              {/* Metrics */}
              <div className="space-y-3 pt-4 border-t border-slate-700">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Cpu className="w-3 h-3" /> CPU
                    </span>
                    <span className="text-white">{infra.metrics.cpu}%</span>
                  </div>
                  <Progress value={infra.metrics.cpu} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Activity className="w-3 h-3" /> Memory
                    </span>
                    <span className="text-white">{infra.metrics.memory}%</span>
                  </div>
                  <Progress value={infra.metrics.memory} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-1">
                      <HardDrive className="w-3 h-3" /> Storage
                    </span>
                    <span className="text-white">{infra.metrics.storage}%</span>
                  </div>
                  <Progress value={infra.metrics.storage} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
