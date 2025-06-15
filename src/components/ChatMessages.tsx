import * as React from "react"
import { Bot, User, Cloud, Zap, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Message {
  id: number
  type: "bot" | "user"
  content: string
  timestamp?: string
  deploymentId?: string
  status?: "pending" | "deploying" | "success" | "error"
}

interface ChatMessagesProps {
  messages: Message[]
  onDeploy?: (provider: string, config: any) => void
}

export function ChatMessages({ messages, onDeploy }: ChatMessagesProps) {
  const handleQuickDeploy = (provider: string) => {
    if (onDeploy) {
      onDeploy(provider, {
        name: `quick-deploy-${Date.now()}`,
        type: 'container',
        image: 'nginx:latest'
      });
    }
  };

  const renderDeploymentStatus = (message: Message) => {
    if (!message.deploymentId || !message.status) return null;

    const statusConfig = {
      pending: { icon: Clock, color: 'bg-yellow-500', text: 'Pending' },
      deploying: { icon: Zap, color: 'bg-blue-500', text: 'Deploying' },
      success: { icon: CheckCircle, color: 'bg-green-500', text: 'Success' },
      error: { icon: AlertCircle, color: 'bg-red-500', text: 'Error' }
    };

    const config = statusConfig[message.status];
    const Icon = config.icon;

    return (
      <div className="mt-2 p-2 bg-slate-50 rounded border">
        <div className="flex items-center space-x-2">
          <Icon className="h-4 w-4" />
          <span className="text-sm font-medium">Deployment {message.deploymentId}</span>
          <Badge variant="secondary" className={`${config.color} text-white`}>
            {config.text}
          </Badge>
        </div>
      </div>
    );
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <Cloud className="h-16 w-16 text-slate-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-600 mb-2">Ready for Cloud Deployment</h3>
        <p className="text-slate-500 mb-6 max-w-md">
          Start by asking me to deploy infrastructure or choose a quick deployment option below.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="flex flex-col items-center p-4 h-auto"
            onClick={() => handleQuickDeploy('azure')}
          >
            <div className="text-2xl mb-2">☁️</div>
            <span className="font-medium">Azure Container</span>
            <span className="text-xs text-slate-500">Deploy to Azure ACI</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center p-4 h-auto"
            onClick={() => handleQuickDeploy('aws')}
          >
            <div className="text-2xl mb-2">🚀</div>
            <span className="font-medium">AWS Lambda</span>
            <span className="text-xs text-slate-500">Serverless function</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center p-4 h-auto"
            onClick={() => handleQuickDeploy('gcp')}
          >
            <div className="text-2xl mb-2">⚡</div>
            <span className="font-medium">GCP Cloud Run</span>
            <span className="text-xs text-slate-500">Containerized app</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 mb-4 overflow-y-auto p-4">
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
              {message.timestamp && (
                <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
              )}
              {renderDeploymentStatus(message)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
