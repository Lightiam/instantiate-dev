import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle, Server, Database, Globe } from "lucide-react";

export function Monitoring() {
  const monitoringData = [
    {
      provider: "AWS",
      icon: Server,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      metrics: {
        uptime: "99.9%",
        responseTime: "145ms",
        requests: "24.5k/min",
        errorRate: "0.01%"
      },
      alerts: [
        { type: "info", message: "Instance i-1234abcd restarted", time: "2 min ago" },
        { type: "success", message: "Load balancer healthy", time: "5 min ago" }
      ]
    },
    {
      provider: "Azure",
      icon: Database,
      color: "text-blue-500", 
      bgColor: "bg-blue-500/10",
      metrics: {
        uptime: "99.7%",
        responseTime: "189ms",
        requests: "18.2k/min",
        errorRate: "0.03%"
      },
      alerts: [
        { type: "warning", message: "High memory usage detected", time: "1 min ago" },
        { type: "info", message: "Database backup completed", time: "15 min ago" }
      ]
    },
    {
      provider: "GCP",
      icon: Globe,
      color: "text-red-500",
      bgColor: "bg-red-500/10", 
      metrics: {
        uptime: "100%",
        responseTime: "98ms",
        requests: "31.8k/min",
        errorRate: "0.00%"
      },
      alerts: [
        { type: "success", message: "All systems operational", time: "now" },
        { type: "info", message: "Auto-scaling triggered", time: "8 min ago" }
      ]
    }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-primary" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <BarChart3 className="w-4 h-4 text-blue-500" />;
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case "success":
        return <Badge className="bg-primary/10 text-primary">Success</Badge>;
      case "warning":
        return <Badge className="bg-amber-500/10 text-amber-500">Warning</Badge>;
      case "error":
        return <Badge className="bg-red-500/10 text-red-500">Error</Badge>;
      default:
        return <Badge className="bg-blue-500/10 text-blue-500">Info</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Requests</p>
                <p className="text-2xl font-bold text-white">74.5k/min</p>
                <p className="text-xs text-primary flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +12% from last hour
                </p>
              </div>
              <BarChart3 className="text-primary w-8 h-8" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Avg Response Time</p>
                <p className="text-2xl font-bold text-white">144ms</p>
                <p className="text-xs text-primary flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> -8ms improvement
                </p>
              </div>
              <CheckCircle className="text-primary w-8 h-8" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Error Rate</p>
                <p className="text-2xl font-bold text-white">0.01%</p>
                <p className="text-xs text-primary flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> -0.02% reduction
                </p>
              </div>
              <AlertTriangle className="text-primary w-8 h-8" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provider Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {monitoringData.map((data) => (
          <Card key={data.provider} className="bg-slate-900 border-slate-700">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${data.bgColor} rounded-lg flex items-center justify-center`}>
                  <data.icon className={data.color} />
                </div>
                <CardTitle className="text-white">{data.provider} Monitoring</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Uptime</p>
                  <p className="text-lg font-semibold text-white">{data.metrics.uptime}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Response Time</p>
                  <p className="text-lg font-semibold text-white">{data.metrics.responseTime}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Requests/min</p>
                  <p className="text-lg font-semibold text-white">{data.metrics.requests}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Error Rate</p>
                  <p className="text-lg font-semibold text-white">{data.metrics.errorRate}</p>
                </div>
              </div>

              {/* Recent Alerts */}
              <div className="space-y-3 pt-4 border-t border-slate-700">
                <h4 className="text-sm font-medium text-white">Recent Alerts</h4>
                {data.alerts.map((alert, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{alert.message}</p>
                      <p className="text-xs text-slate-400">{alert.time}</p>
                    </div>
                    {getAlertBadge(alert.type)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
