
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChatInput } from '@/components/ChatInput';
import { Bot, User, Code } from 'lucide-react';

interface GeneratedCode {
  terraform: string;
  description: string;
  resourceType: string;
  detectedProvider?: string;
}

interface Message {
  id: number;
  type: "bot" | "user";
  content: string;
  timestamp?: string;
  code?: GeneratedCode;
}

interface ChatInterfaceProps {
  messages: Message[];
  isGenerating: boolean;
  onSendMessage: (message: string) => void;
}

export function ChatInterface({ messages, isGenerating, onSendMessage }: ChatInterfaceProps) {
  return (
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
          <ChatInput onSendMessage={onSendMessage} isLoading={isGenerating} />
        </div>
      </CardContent>
    </Card>
  );
}
