
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Settings, Code, Zap, Download, Play, CheckCircle, AlertCircle, Bot, User } from "lucide-react"

interface ConversationTemplate {
  id: string
  title: string
  description: string
  color: string
  prompt: string
}

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

interface Message {
  id: number
  type: "bot" | "user"
  content: string
  timestamp?: string
  code?: GeneratedCode
}

const templates: ConversationTemplate[] = [
  {
    id: "web-app",
    title: "Deploy Web App",
    description: "Create and deploy a web application",
    color: "bg-blue-500 hover:bg-blue-600",
    prompt: "I want to deploy a web application to Azure"
  },
  {
    id: "container",
    title: "Container Deployment", 
    description: "Deploy containerized applications",
    color: "bg-purple-500 hover:bg-purple-600",
    prompt: "Deploy a Docker container to Azure Container Instances"
  },
  {
    id: "database",
    title: "Database Setup",
    description: "Create and configure databases",
    color: "bg-green-500 hover:bg-green-600",
    prompt: "Set up a PostgreSQL database on AWS RDS"
  },
  {
    id: "kubernetes",
    title: "Kubernetes Cluster",
    description: "Deploy Kubernetes infrastructure",
    color: "bg-orange-500 hover:bg-orange-600",
    prompt: "Create a Kubernetes cluster on GCP with auto-scaling"
  },
  {
    id: "storage",
    title: "Storage Solution",
    description: "Configure cloud storage",
    color: "bg-cyan-500 hover:bg-cyan-600",
    prompt: "Create an S3 bucket with versioning and encryption"
  },
  {
    id: "network",
    title: "Network Setup",
    description: "Configure networking and VPCs",
    color: "bg-red-500 hover:bg-red-600",
    prompt: "Set up a VPC with public and private subnets"
  },
  {
    id: "monitoring",
    title: "Monitoring Stack",
    description: "Deploy monitoring and logging",
    color: "bg-yellow-500 hover:bg-yellow-600",
    prompt: "Set up monitoring with CloudWatch and alerts"
  },
  {
    id: "security",
    title: "Security Config",
    description: "Configure security and access",
    color: "bg-pink-500 hover:bg-pink-600",
    prompt: "Configure IAM roles and security groups"
  }
]

export function ChatUI() {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [generatedCode, setGeneratedCode] = React.useState<GeneratedCode | null>(null)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [isDeploying, setIsDeploying] = React.useState(false)
  const [deploymentResult, setDeploymentResult] = React.useState<DeploymentResult | null>(null)
  const [input, setInput] = React.useState("")
  const [showEnvConfig, setShowEnvConfig] = React.useState(false)

  const handleTemplateClick = (template: ConversationTemplate) => {
    setInput(template.prompt)
  }

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return


    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString()
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsGenerating(true)
    setInput("")

    try {
      const response = await fetch('/api/multi-cloud/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: message,
          codeType: 'terraform'
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not valid JSON')
      }

      const result = await response.json()
      
      if (result.success) {
        const codeData: GeneratedCode = {
          terraform: result.terraform,
          description: result.description,
          resourceType: result.resourceType || 'infrastructure',
          detectedProvider: result.detectedProvider
        }
        
        setGeneratedCode(codeData)
        setDeploymentResult(null)
        
        const botResponse: Message = {
          id: Date.now() + 1,
          type: "bot",
          content: `I've generated ${result.detectedProvider?.toUpperCase() || 'multi-cloud'} infrastructure code for your request. You can review the code above and deploy it using the deploy button.`,
          timestamp: new Date().toLocaleTimeString(),
          code: codeData
        }
        
        setMessages(prev => [...prev, botResponse])
      } else {
        throw new Error(result.error || 'Code generation failed')
      }
    } catch (error: any) {
      const errorResponse: Message = {
        id: Date.now() + 1,
        type: "bot",
        content: `I encountered an issue generating code: ${error.message}. Please try rephrasing your request or check the API configuration.`,
        timestamp: new Date().toLocaleTimeString()
      }
      
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(input)
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not valid JSON')
      }

      const result = await response.json()
      setDeploymentResult(result)
      
      const deploymentMessage: Message = {
        id: Date.now(),
        type: "bot",
        content: result.success 
          ? `✅ Deployment successful! Deployment ID: ${result.deploymentId}`
          : `❌ Deployment failed: ${result.error}`,
        timestamp: new Date().toLocaleTimeString()
      }
      
      setMessages(prev => [...prev, deploymentMessage])
    } catch (error: any) {
      const errorResult = {
        success: false,
        error: `Deployment failed: ${error.message}. Please check your cloud provider credentials and try again.`
      }
      setDeploymentResult(errorResult)
      
      const errorMessage: Message = {
        id: Date.now(),
        type: "bot",
        content: `❌ ${errorResult.error}`,
        timestamp: new Date().toLocaleTimeString()
      }
      
      setMessages(prev => [...prev, errorMessage])
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
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header with Navigation */}
      <div className="border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <button onClick={() => window.location.href = '/dashboard'}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold">New Chat</h1>
              <p className="text-sm text-slate-400">Infrastructure as Code Generation</p>
            </div>
          </div>
          <Button onClick={() => setShowEnvConfig(!showEnvConfig)}>
            <Settings className="w-4 h-4 mr-2" />
            Environment
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Code Display Area */}
        {generatedCode && (
          <Card className="bg-slate-800 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white">
                <span>Generated Infrastructure Code</span>
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
                    className="bg-blue-600 hover:bg-blue-700"
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

        {/* Deployment Result */}
        {deploymentResult && (
          <Card className="bg-slate-800 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                {deploymentResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span>Deployment Status</span>
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

        {/* Template Grid */}
        {messages.length === 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-center">Choose a deployment template</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateClick(template)}
                  className={`${template.color} p-6 rounded-xl text-white text-left hover:scale-105 transition-all duration-200 shadow-lg`}
                >
                  <h3 className="font-semibold mb-2">{template.title}</h3>
                  <p className="text-sm opacity-90">{template.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {messages.length > 0 && (
          <div className="mb-8 space-y-4 max-h-96 overflow-y-auto">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`p-2 rounded-full ${message.type === 'user' ? 'bg-blue-600' : 'bg-slate-700'}`}>
                    {message.type === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
                    <p className="text-sm">{message.content}</p>
                    {message.timestamp && (
                      <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Input Field */}
        <div className="relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="What infrastructure would you like to deploy?"
            className="w-full h-14 px-6 pr-14 bg-slate-800 border-slate-700 text-white placeholder-slate-400 rounded-xl text-lg"
            disabled={isGenerating}
          />
          <Button
            onClick={() => handleSendMessage(input)}
            disabled={isGenerating || !input.trim()}
            className="absolute right-2 top-2 h-10 w-10 p-0 bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <Zap className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Environment Configuration Modal */}
        {showEnvConfig && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="bg-slate-800 border-slate-700 w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-white">Environment Configuration</CardTitle>
                <CardDescription className="text-slate-400">
                  Configure your cloud provider credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300">AWS Access Key</label>
                  <Input className="bg-slate-900 border-slate-600 text-white" placeholder="Enter AWS access key" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300">Azure Subscription ID</label>
                  <Input className="bg-slate-900 border-slate-600 text-white" placeholder="Enter Azure subscription ID" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300">GCP Project ID</label>
                  <Input className="bg-slate-900 border-slate-600 text-white" placeholder="Enter GCP project ID" />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowEnvConfig(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setShowEnvConfig(false)}>
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
