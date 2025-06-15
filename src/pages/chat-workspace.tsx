
import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChatHeader } from "@/components/ChatHeader"
import { ChatSidebar } from "@/components/ChatSidebar"
import { ChatMessages } from "@/components/ChatMessages"
import { ChatInput } from "@/components/ChatInput"
import { CloudProviderConfig } from "@/components/CloudProviderConfig"
import { IaCGenerator } from "@/components/IaCGenerator"
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
  const [activeTab, setActiveTab] = React.useState<'chat' | 'iac'>('chat')

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
    
    if (lowerMessage.includes('deploy') || lowerMessage.includes('create')) {
      const deploymentId = `dep_${Date.now()}`
      
      if (lowerMessage.includes('azure')) {
        return await deployToAzure(deploymentId, message)
      } else {
        return {
          message: "I can help you deploy to Azure. Please specify 'deploy to Azure' or try the IaC Generator tab for more options.",
          status: "pending"
        }
      }
    }
    
    return {
      message: "I can help you with cloud deployments. Try asking me to 'deploy to Azure' or use the IaC Generator tab for Infrastructure as Code generation.",
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
        message: `Azure deployment initiated successfully. Resource Group: instantiate-rg, Location: eastus`,
        deploymentId,
        status: "deploying" as const
      }
    } catch (error: any) {
      throw new Error(`Azure deployment failed: ${error.message}`)
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
            <div className="flex space-x-4 mb-6">
              <Button
                variant={activeTab === 'chat' ? 'default' : 'outline'}
                onClick={() => setActiveTab('chat')}
              >
                Chat Assistant
              </Button>
              <Button
                variant={activeTab === 'iac' ? 'default' : 'outline'}
                onClick={() => setActiveTab('iac')}
              >
                IaC Generator
              </Button>
            </div>

            {activeTab === 'chat' ? (
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
            ) : (
              <IaCGenerator />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
