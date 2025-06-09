import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, AlertCircle, Play, Pause, RotateCcw } from "lucide-react"

export function DeploymentTest() {
  const [isRunning, setIsRunning] = React.useState(false)
  const [progress, setProgress] = React.useState(0)

  const tests = [
    { name: "Build Process", status: "passed", duration: "2.3s" },
    { name: "Unit Tests", status: "passed", duration: "1.8s" },
    { name: "Integration Tests", status: "running", duration: "0.5s" },
    { name: "Security Scan", status: "pending", duration: "-" },
    { name: "Performance Test", status: "pending", duration: "-" },
    { name: "Deployment", status: "pending", duration: "-" }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "running":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed":
        return "default"
      case "running":
        return "secondary"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Deployment Testing</h1>
          <p className="text-muted-foreground">Automated testing pipeline for your deployments</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Test Pipeline
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsRunning(!isRunning)}
                  >
                    {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isRunning ? "Pause" : "Start"}
                  </Button>
                  <Button size="sm" variant="outline">
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Comprehensive testing before deployment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>33%</span>
                  </div>
                  <Progress value={33} />
                </div>

                <div className="space-y-3">
                  {tests.map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(test.status)}
                        <span className="font-medium">{test.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusColor(test.status) as any}>
                          {test.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{test.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>Detailed results from the latest test run</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-500">2</div>
                    <div className="text-sm text-muted-foreground">Passed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-500">1</div>
                    <div className="text-sm text-muted-foreground">Running</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-muted-foreground">3</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Latest Build</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Build #127</div>
                      <div>Started: 2 minutes ago</div>
                      <div>Branch: main</div>
                      <div>Commit: a1b2c3d</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Environment</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Node.js: v18.20.8</div>
                      <div>Platform: Linux</div>
                      <div>Memory: 2GB</div>
                      <div>CPU: 2 cores</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Test History</CardTitle>
            <CardDescription>Previous test runs and their results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { build: "#126", status: "passed", duration: "4m 32s", time: "1 hour ago" },
                { build: "#125", status: "passed", duration: "4m 18s", time: "3 hours ago" },
                { build: "#124", status: "failed", duration: "2m 45s", time: "5 hours ago" },
                { build: "#123", status: "passed", duration: "4m 55s", time: "8 hours ago" }
              ].map((run, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(run.status)}
                    <span className="font-medium">Build {run.build}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{run.duration}</span>
                    <span>{run.time}</span>
                    <Badge variant={getStatusColor(run.status) as any}>
                      {run.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
