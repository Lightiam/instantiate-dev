
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
      // Use OpenAI for chat responses
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          provider: 'azure',
          resourceType: 'infrastructure'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const aiResponse = await response.json()
      
      const botResponse: Message = {
        id: Date.now() + 1,
        type: "bot",
        content: aiResponse.message,
        timestamp: new Date().toLocaleTimeString(),
        status: "success"
      }
      
      setMessages(prev => [...prev, botResponse])
    } catch (error: any) {
      const errorResponse: Message = {
        id: Date.now() + 1,
        type: "bot",
        content: `I encountered an issue processing your request: ${error.message}. Please try again.`,
        timestamp: new Date().toLocaleTimeString(),
        status: "error"
      }
      
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsDeploying(false)
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
                    <span>Instantiate AI Assistant (OpenAI)</span>
                    <Badge variant="secondary">Ready</Badge>
                  </CardTitle>
                  <CardDescription>Deploy infrastructure to Azure, AWS, GCP and more using OpenAI</CardDescription>
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
