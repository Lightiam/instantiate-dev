
import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cloud, Shield, Database, Monitor, GitBranch } from "lucide-react"

const features = [
  {
    icon: Cloud,
    title: "Multi-Cloud",
    description: "Deploy to 11+ cloud providers",
    status: "active"
  },
  {
    icon: Shield,
    title: "Governance",
    description: "Policy enforcement & compliance",
    status: "active"
  },
  {
    icon: Database,
    title: "Backup & Recovery",
    description: "Infrastructure resilience",
    status: "active"
  },
  {
    icon: Monitor,
    title: "Monitoring",
    description: "Real-time insights",
    status: "active"
  },
  {
    icon: GitBranch,
    title: "IaC Pipeline",
    description: "CI/CD integration",
    status: "active"
  }
]

export function ChatSidebar() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Platform Features</CardTitle>
          <CardDescription className="text-xs">
            Available capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <feature.icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {feature.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
