
import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle } from "lucide-react"
import { ChatHeader } from "@/components/ChatHeader"
import { ChatSidebar } from "@/components/ChatSidebar"
import { ChatMessages } from "@/components/ChatMessages"
import { ChatInput } from "@/components/ChatInput"
import { CloudProviderConfig } from "@/components/CloudProviderConfig"
import { cloudProviders } from "@/services/cloudProviders"

interface Message {
  id: number
  type: "bot" | "user"
  content: string
  timestamp?: string
  deploymentId?: string
  status?: "pending" | "deploying" | "success" | "error"
}

export function ChatWorkspace() {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [isDeploying, setIsDeploying] = React.useState(false)

  const handleSendMessage = async (message: string) => {
    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString()
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsDeploying(true)

    try {
      // Process deployment requests
      const deploymentResult = await processDeploymentRequest(message)
      
      const botResponse: Message = {
        id: Date.now() + 1,
        type: "bot",
        content: deploymentResult.message,
        timestamp: new Date().toLocaleTimeString(),
        deploymentId: deploymentResult.deploymentId,
        status: deploymentResult.status
      }
      
      setMessages(prev => [...prev, botResponse])
    } catch (error: any) {
      const errorResponse: Message = {
        id: Date.now() + 1,
        type: "bot",
        content: `Deployment failed: ${error.message}`,
        timestamp: new Date().toLocaleTimeString(),
        status: "error"
      }
      
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsDeploying(false)
    }
  }

  const processDeploymentRequest = async (message: string): Promise<{
    message: string
    deploymentId?: string
    status: "pending" | "deploying" | "success" | "error"
  }> => {
    const lowerMessage = message.toLowerCase()
    
    // Check for deployment keywords
    if (lowerMessage.includes('deploy') || lowerMessage.includes('create')) {
      const deploymentId = `dep_${Date.now()}`
      
      if (lowerMessage.includes('azure')) {
        return await deployToAzure(deploymentId, message)
      } else if (lowerMessage.includes('aws')) {
        return await deployToAWS(deploymentId, message)
      } else if (lowerMessage.includes('gcp') || lowerMessage.includes('google')) {
        return await deployToGCP(deploymentId, message)
      } else {
        return {
          message: "I can help you deploy to Azure, AWS, or GCP. Please specify which cloud provider you'd like to use.",
          status: "pending"
        }
      }
    }
    
    return {
      message: "I can help you with cloud deployments. Try asking me to 'deploy to Azure' or 'create an AWS Lambda function'.",
      status: "pending"
    }
  }

  const deployToAzure = async (deploymentId: string, request: string) => {
    try {
      const result = await cloudProviders.azure.deploy({
        name: `instantiate-${Date.now()}`,
        resourceGroup: 'instantiate-rg',
        location: 'eastus',
        type: 'container'
      })
      
      return {
        message: `Azure deployment initiated successfully. Resource Group: ${result.resourceGroup}, Location: ${result.location}`,
        deploymentId,
        status: "deploying" as const
      }
    } catch (error: any) {
      throw new Error(`Azure deployment failed: ${error.message}`)
    }
  }

  const deployToAWS = async (deploymentId: string, request: string) => {
    try {
      const result = await cloudProviders.aws.deploy({
        functionName: `instantiate-${Date.now()}`,
        runtime: 'nodejs18.x',
        code: 'exports.handler = async (event) => { return { statusCode: 200, body: "Hello from AWS Lambda!" }; };'
      })
      
      return {
        message: `AWS Lambda deployment initiated. Function: ${result.functionName}`,
        deploymentId,
        status: "deploying" as const
      }
    } catch (error: any) {
      throw new Error(`AWS deployment failed: ${error.message}`)
    }
  }

  const deployToGCP = async (deploymentId: string, request: string) => {
    try {
      const result = await cloudProviders.gcp.deploy({
        name: `instantiate-${Date.now()}`,
        region: 'us-central1',
        image: 'gcr.io/cloudrun/hello'
      })
      
      return {
        message: `GCP Cloud Run deployment initiated. Service: ${result.name}`,
        deploymentId,
        status: "deploying" as const
      }
    } catch (error: any) {
      throw new Error(`GCP deployment failed: ${error.message}`)
    }
  }

  const handleQuickDeploy = async (provider: string, config: any) => {
    const deployMessage = `Deploy ${config.name} to ${provider}`
    await handleSendMessage(deployMessage)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <ChatHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
          <div className="lg:col-span-1">
            <ChatSidebar />
            <div className="mt-6">
              <CloudProviderConfig />
            </div>
          </div>

          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Instantiate AI Assistant</span>
                  <Badge variant="secondary">Ready</Badge>
                </CardTitle>
                <CardDescription>Deploy infrastructure to Azure, AWS, GCP and more</CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                <ChatMessages messages={messages} onDeploy={handleQuickDeploy} />
                <div className="p-4 border-t">
                  <ChatInput onSendMessage={handleSendMessage} isLoading={isDeploying} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
