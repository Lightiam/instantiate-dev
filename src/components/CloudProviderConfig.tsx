
import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, CheckCircle, AlertCircle } from "lucide-react"

interface AzureCredentials {
  subscriptionId: string
  tenantId: string
  clientId: string
  clientSecret: string
}

export function CloudProviderConfig() {
  const [azureCredentials, setAzureCredentials] = React.useState<AzureCredentials>({
    subscriptionId: '',
    tenantId: '',
    clientId: '',
    clientSecret: ''
  })
  const [isConnected, setIsConnected] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleAzureCredentialChange = (field: keyof AzureCredentials, value: string) => {
    setAzureCredentials(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const testAzureConnection = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/azure/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(azureCredentials)
      })
      
      const result = await response.json()
      setIsConnected(result.success)
    } catch (error) {
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  const allFieldsFilled = Object.values(azureCredentials).every(value => value.trim() !== '')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Azure Configuration</span>
          {isConnected && <CheckCircle className="h-4 w-4 text-green-500" />}
          {!isConnected && allFieldsFilled && <AlertCircle className="h-4 w-4 text-red-500" />}
        </CardTitle>
        <CardDescription>
          Configure your Azure credentials for deployment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="subscriptionId">Subscription ID</Label>
          <Input
            id="subscriptionId"
            type="password"
            placeholder="Enter Azure Subscription ID"
            value={azureCredentials.subscriptionId}
            onChange={(e) => handleAzureCredentialChange('subscriptionId', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tenantId">Tenant ID</Label>
          <Input
            id="tenantId"
            type="password"
            placeholder="Enter Azure Tenant ID"
            value={azureCredentials.tenantId}
            onChange={(e) => handleAzureCredentialChange('tenantId', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="clientId">Client ID</Label>
          <Input
            id="clientId"
            type="password"
            placeholder="Enter Azure Client ID"
            value={azureCredentials.clientId}
            onChange={(e) => handleAzureCredentialChange('clientId', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="clientSecret">Client Secret</Label>
          <Input
            id="clientSecret"
            type="password"
            placeholder="Enter Azure Client Secret"
            value={azureCredentials.clientSecret}
            onChange={(e) => handleAzureCredentialChange('clientSecret', e.target.value)}
          />
        </div>

        <Button 
          onClick={testAzureConnection}
          disabled={!allFieldsFilled || isLoading}
          className="w-full"
        >
          {isLoading ? 'Testing Connection...' : 'Test Azure Connection'}
        </Button>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Connection Status:</span>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Connected" : "Not Connected"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
