import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, Bot, User } from "lucide-react"

export function ChatWorkspace() {
  const [messages] = React.useState([
    { id: 1, type: "bot", content: "Hello! I'm your AI assistant. How can I help you with your cloud deployment today?" },
    { id: 2, type: "user", content: "I need help deploying a React app to AWS" },
    { id: 3, type: "bot", content: "I can help you deploy your React app to AWS! Let me guide you through the process. First, do you have an AWS account set up?" }
  ])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Chat Workspace</h1>
          <p className="text-muted-foreground">Get intelligent assistance for your cloud deployments</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Chat History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="p-2 rounded bg-muted cursor-pointer">
                    <p className="text-sm font-medium">AWS Deployment Help</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                  <div className="p-2 rounded cursor-pointer hover:bg-muted">
                    <p className="text-sm font-medium">Azure Setup Questions</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                  <div className="p-2 rounded cursor-pointer hover:bg-muted">
                    <p className="text-sm font-medium">GCP Configuration</p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>AI Assistant</span>
                  <Badge variant="secondary">Online</Badge>
                </CardTitle>
                <CardDescription>Ask questions about cloud deployment, monitoring, and optimization</CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex items-start space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`p-2 rounded-full ${message.type === 'user' ? 'bg-primary' : 'bg-muted'}`}>
                          {message.type === 'user' ? (
                            <User className="h-4 w-4 text-primary-foreground" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        <div className={`p-3 rounded-lg ${message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <Input placeholder="Ask me anything about cloud deployment..." className="flex-1" />
                  <Button size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
