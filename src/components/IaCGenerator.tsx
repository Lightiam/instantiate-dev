
import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Code, Zap, Download, Play, CheckCircle, AlertCircle } from "lucide-react"

interface GeneratedCode {
  terraform: string
  description: string
  resourceType: string
}

interface DeploymentResult {
  success: boolean
  deploymentId?: string
  error?: string
  resources?: any[]
}

export function IaCGenerator() {
  const [prompt, setPrompt] = React.useState("")
  const [resourceType, setResourceType] = React.useState("resource_group")
  const [generatedCode, setGeneratedCode] = React.useState<GeneratedCode | null>(null)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [isDeploying, setIsDeploying] = React.useState(false)
  const [deploymentResult, setDeploymentResult] = React.useState<DeploymentResult | null>(null)

  const generateIaCCode = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/azure/generate-iac', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          resourceType,
          provider: 'azure'
        })
      })

      const result = await response.json()
      setGeneratedCode(result)
    } catch (error) {
      console.error('Failed to generate IaC code:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const deployCode = async () => {
    if (!generatedCode) return

    setIsDeploying(true)
    setDeploymentResult(null)
    
    try {
      const response = await fetch('/api/azure/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: generatedCode.terraform,
          codeType: 'terraform',
          provider: 'azure',
          resourceType: generatedCode.resourceType
        })
      })

      const result = await response.json()
      setDeploymentResult(result)
    } catch (error) {
      setDeploymentResult({
        success: false,
        error: 'Deployment failed. Please check your Azure credentials and try again.'
      })
    } finally {
      setIsDeploying(false)
    }
  }

  const downloadCode = () => {
    if (!generatedCode) return

    const blob = new Blob([generatedCode.terraform], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `azure-${generatedCode.resourceType}.tf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code className="h-5 w-5" />
            <span>IaC Code Generator</span>
          </CardTitle>
          <CardDescription>
            Generate Infrastructure as Code for Azure based on your requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resourceType">Resource Type</Label>
            <Select value={resourceType} onValueChange={setResourceType}>
              <SelectTrigger>
                <SelectValue placeholder="Select resource type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resource_group">Resource Group</SelectItem>
                <SelectItem value="storage_account">Storage Account</SelectItem>
                <SelectItem value="virtual_machine">Virtual Machine</SelectItem>
                <SelectItem value="app_service">App Service</SelectItem>
                <SelectItem value="container_instance">Container Instance</SelectItem>
                <SelectItem value="sql_database">SQL Database</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Describe your infrastructure requirements</Label>
            <Textarea
              id="prompt"
              placeholder="e.g., Create a resource group named 'my-app-rg' in East US region with tags for environment and project"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Button 
            onClick={generateIaCCode}
            disabled={!prompt.trim() || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-spin" />
                Generating Code...
              </>
            ) : (
              <>
                <Code className="h-4 w-4 mr-2" />
                Generate IaC Code
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedCode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Terraform Code</span>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={downloadCode}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button 
                  size="sm" 
                  onClick={deployCode}
                  disabled={isDeploying}
                >
                  {isDeploying ? (
                    <>
                      <Zap className="h-4 w-4 mr-1 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      Deploy to Azure
                    </>
                  )}
                </Button>
              </div>
            </CardTitle>
            <CardDescription>{generatedCode.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-50 p-4 rounded-md overflow-x-auto text-sm">
              <code>{generatedCode.terraform}</code>
            </pre>
          </CardContent>
        </Card>
      )}

      {deploymentResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {deploymentResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <span>Deployment Result</span>
              <Badge variant={deploymentResult.success ? "default" : "destructive"}>
                {deploymentResult.success ? "Success" : "Failed"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deploymentResult.success ? (
              <div className="space-y-2">
                <p className="text-green-600">Deployment completed successfully!</p>
                {deploymentResult.deploymentId && (
                  <p className="text-sm text-muted-foreground">
                    Deployment ID: {deploymentResult.deploymentId}
                  </p>
                )}
                {deploymentResult.resources && deploymentResult.resources.length > 0 && (
                  <div>
                    <p className="font-medium">Created Resources:</p>
                    <ul className="list-disc list-inside text-sm">
                      {deploymentResult.resources.map((resource, index) => (
                        <li key={index}>{resource.name} ({resource.type})</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-red-600">Deployment failed</p>
                {deploymentResult.error && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Error: {deploymentResult.error}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
