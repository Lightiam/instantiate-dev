
import * as React from "react"
import { Button } from "@/components/ui/button"
import { ConversationStarter } from "@/components/ConversationStarter"
import { EnvironmentConfig } from "@/components/EnvironmentConfig"
import { CodeDisplay } from "@/components/CodeDisplay"
import { DeploymentStatus } from "@/components/DeploymentStatus"
import { ChatInterface } from "@/components/ChatInterface"

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
          <CodeDisplay
            generatedCode={generatedCode}
            isDeploying={isDeploying}
            onDeploy={deployCode}
            onDownload={downloadCode}
          />
        )}

        {/* Deployment Result */}
        {deploymentResult && (
          <DeploymentStatus deploymentResult={deploymentResult} />
        )}

        {/* Chat Interface */}
        <ChatInterface
          messages={messages}
          isGenerating={isGenerating}
          onSendMessage={handleSendMessage}
        />
        
        <EnvironmentConfig
          isOpen={showEnvConfig}
          onClose={() => setShowEnvConfig(false)}
        />
      </div>
    </div>
  )
}
