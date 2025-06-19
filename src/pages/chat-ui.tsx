import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ChatInput } from "@/components/ChatInput"
import { ChatMessages } from "@/components/ChatMessages"
import { ConversationStarter } from "@/components/ConversationStarter"
import { EnvironmentConfig } from "@/components/EnvironmentConfig"
import { Code, Zap, Download, Play, CheckCircle, AlertCircle, Bot, User } from "lucide-react"

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

export function ChatUI() {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [generatedCode, setGeneratedCode] = React.useState<GeneratedCode | null>(null)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [isDeploying, setIsDeploying] = React.useState(false)
  const [deploymentResult, setDeploymentResult] = React.useState<DeploymentResult | null>(null)
  const [showStarter, setShowStarter] = React.useState(true)
  const [showEnvConfig, setShowEnvConfig] = React.useState(false)
  const [input, setInput] = React.useState('')

  const handleSendMessage = async (message: string) => {
    setShowStarter(false)
    
    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString()
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsGenerating(true)

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

  const handleTemplateSelect = (prompt: string) => {
    setInput(prompt)
  }

  const handleBackClick = () => {
    setShowStarter(true)
    setMessages([])
    setGeneratedCode(null)
    setDeploymentResult(null)
    setInput('')
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

  if (showStarter) {
    return (
      <>
        <ConversationStarter
          onTemplateSelect={handleTemplateSelect}
          onSendMessage={handleSendMessage}
          input={input}
          setInput={setInput}
          onBackClick={() => window.location.href = '/dashboard'}
          onEnvironmentClick={() => setShowEnvConfig(true)}
        />
        <EnvironmentConfig
          isOpen={showEnvConfig}
          onClose={() => setShowEnvConfig(false)}
        />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Infrastructure Chat</h1>
            <p className="text-slate-400">Generate and deploy infrastructure code through natural conversation</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleBackClick}
              className="border-slate-600 hover:bg-slate-800"
            >
              New Chat
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowEnvConfig(true)}
              className="border-slate-600 hover:bg-slate-800"
            >
              Environment
            </Button>
          </div>
        </div>

        {/* Code Display Area */}
        {generatedCode && (
          <Card className="bg-slate-900 border-slate-700 mb-6">
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
          <Card className="bg-slate-900 border-slate-700 mb-6">
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

        {/* Chat Interface */}
        <Card className="bg-slate-900 border-slate-700 h-[500px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-white">
              <span>Infrastructure Assistant</span>
              <Badge variant="secondary">
                {isGenerating ? "Generating..." : "Ready"}
              </Badge>
            </CardTitle>
            <CardDescription className="text-slate-400">
              Describe your infrastructure needs and I'll generate the code for you
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages Area */}
            <div className="flex-1 space-y-4 mb-4 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center h-full">
                  <Code className="h-16 w-16 text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-300 mb-2">Continue the Conversation</h3>
                  <p className="text-slate-500 mb-6 max-w-md">
                    Ask follow-up questions or request modifications to your infrastructure.
                  </p>
                </div>
              ) : (
                messages.map((message) => (
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
                ))
              )}
            </div>
            
            {/* Input Area */}
            <div className="p-4 border-t border-slate-700">
              <ChatInput onSendMessage={handleSendMessage} isLoading={isGenerating} />
            </div>
          </CardContent>
        </Card>
        
        <EnvironmentConfig
          isOpen={showEnvConfig}
          onClose={() => setShowEnvConfig(false)}
        />
      </div>
    </div>
  )
}
