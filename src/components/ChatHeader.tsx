
import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Code, Zap } from "lucide-react"

export function ChatHeader() {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Code className="h-6 w-6 text-primary" />
              <Zap className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <span className="font-bold text-lg">&lt;/&gt;instanti8.dev</span>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Ready
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          Self-service infrastructure deployment
        </div>
      </div>
    </div>
  )
}
