
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
  detectedProvider?: string
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
      const response = await fetch('/api/multi-cloud/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          resourceType,
          codeType: 'terraform'
        })
      })

      const result = await response.json()
      if (result.success) {
        setGeneratedCode({
          terraform: result.terraform,
          description: result.description,
          resourceType: result.resourceType,
          detectedProvider: result.detectedProvider
        })
      } else {
        console.error('Code generation failed:', result.error)
      }
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
      const response = await fetch('/api/multi-cloud/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `${generatedCode.resourceType}-deployment`,
          code: generatedCode.terraform,
          codeType: 'terraform',
          provider: generatedCode.detectedProvider || 'azure',
          region: 'eastus',
          service: generatedCode.resourceType
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
    const provider = generatedCode.detectedProvider || 'multi-cloud'
    a.download = `${provider}-${generatedCode.resourceType}.tf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Multi-Cloud Infrastructure</h2>
        <p className="text-slate-400">Generate and deploy Infrastructure as Code across AWS, Azure, GCP, and Kubernetes</p>
      </div>
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Code className="h-5 w-5" />
            <span>IaC Code Generator</span>
          </CardTitle>
          <CardDescription className="text-slate-400">
            Generate Infrastructure as Code for AWS, Azure, GCP, and Kubernetes based on your requirements
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
                <SelectItem value="compute">Compute (VM/EC2/GCE)</SelectItem>
                <SelectItem value="storage">Storage (S3/Blob/Cloud Storage)</SelectItem>
                <SelectItem value="database">Database (RDS/SQL/Cloud SQL)</SelectItem>
                <SelectItem value="container">Container (ECS/ACI/GKE)</SelectItem>
                <SelectItem value="kubernetes">Kubernetes Cluster</SelectItem>
                <SelectItem value="network">Network (VPC/VNet)</SelectItem>
                <SelectItem value="serverless">Serverless (Lambda/Functions)</SelectItem>
                <SelectItem value="infrastructure">General Infrastructure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Describe your infrastructure requirements</Label>
            <Textarea
              id="prompt"
              placeholder="e.g., Deploy a web application to AWS using ECS with load balancer, or Create a Kubernetes cluster on GCP with 3 nodes, or Set up Azure storage account with blob containers"
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
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-white">
              <span>Generated Terraform Code</span>
              <div className="flex space-x-2">
                {generatedCode.detectedProvider && (
                  <Badge variant="secondary" className="mr-2">
                    {generatedCode.detectedProvider.toUpperCase()}
                  </Badge>
                )}
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
                      Deploy to {generatedCode.detectedProvider?.toUpperCase() || 'Cloud'}
                    </>
                  )}
                </Button>
              </div>
            </CardTitle>
            <CardDescription className="text-slate-400">{generatedCode.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-950 p-4 rounded-md overflow-x-auto text-sm border border-slate-700">
              <code className="text-slate-200">{generatedCode.terraform}</code>
            </pre>
          </CardContent>
        </Card>
      )}

      {deploymentResult && (
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
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
