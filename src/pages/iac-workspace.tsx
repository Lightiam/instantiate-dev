
import * as React from "react"
import { ChatHeader } from "@/components/ChatHeader"
import { CloudProviderConfig } from "@/components/CloudProviderConfig"
import { IaCGenerator } from "@/components/IaCGenerator"

export function IaCWorkspace() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <ChatHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-1">
            <CloudProviderConfig />
          </div>

          <div className="lg:col-span-2">
            <IaCGenerator />
          </div>
        </div>
      </div>
    </div>
  )
}
