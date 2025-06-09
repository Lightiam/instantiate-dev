import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Clock } from "lucide-react"

export function TestSimple() {
  const [testStatus, setTestStatus] = React.useState<"idle" | "running" | "passed" | "failed">("idle")

  const runTest = () => {
    setTestStatus("running")
    setTimeout(() => {
      setTestStatus("passed")
    }, 2000)
  }

  const getStatusIcon = () => {
    switch (testStatus) {
      case "passed":
        return <CheckCircle className="h-8 w-8 text-green-500" />
      case "failed":
        return <AlertCircle className="h-8 w-8 text-red-500" />
      case "running":
        return <Clock className="h-8 w-8 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-8 w-8 text-muted-foreground" />
    }
  }

  const getStatusText = () => {
    switch (testStatus) {
      case "passed":
        return "All tests passed!"
      case "failed":
        return "Some tests failed"
      case "running":
        return "Running tests..."
      default:
        return "Ready to test"
    }
  }

  const getStatusColor = () => {
    switch (testStatus) {
      case "passed":
        return "default"
      case "failed":
        return "destructive"
      case "running":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Simple Test Runner</h1>
          <p className="text-muted-foreground">Quick and easy testing for your applications</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                {getStatusIcon()}
                <span>Test Status</span>
              </CardTitle>
              <CardDescription>{getStatusText()}</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <Badge variant={getStatusColor() as any} className="text-lg px-4 py-2">
                {testStatus.toUpperCase()}
              </Badge>

              <div className="space-y-4">
                <Button 
                  onClick={runTest} 
                  disabled={testStatus === "running"}
                  size="lg"
                  className="w-full"
                >
                  {testStatus === "running" ? "Running Tests..." : "Run Tests"}
                </Button>

                {testStatus === "passed" && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-medium text-green-800 mb-2">Test Results</h3>
                    <div className="text-sm text-green-700 space-y-1">
                      <div>✓ Unit tests: 15/15 passed</div>
                      <div>✓ Integration tests: 8/8 passed</div>
                      <div>✓ Linting: No issues found</div>
                      <div>✓ Type checking: All types valid</div>
                    </div>
                  </div>
                )}

                {testStatus === "failed" && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="font-medium text-red-800 mb-2">Test Failures</h3>
                    <div className="text-sm text-red-700 space-y-1">
                      <div>✗ Unit tests: 13/15 passed (2 failed)</div>
                      <div>✓ Integration tests: 8/8 passed</div>
                      <div>✗ Linting: 3 issues found</div>
                      <div>✓ Type checking: All types valid</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
              <CardDescription>Current test settings and options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Test Framework:</span>
                  <span className="ml-2 text-muted-foreground">Jest</span>
                </div>
                <div>
                  <span className="font-medium">Coverage:</span>
                  <span className="ml-2 text-muted-foreground">85%</span>
                </div>
                <div>
                  <span className="font-medium">Timeout:</span>
                  <span className="ml-2 text-muted-foreground">30s</span>
                </div>
                <div>
                  <span className="font-medium">Parallel:</span>
                  <span className="ml-2 text-muted-foreground">Yes</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
