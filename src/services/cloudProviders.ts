
export interface AzureDeploymentConfig {
  name: string
  resourceGroup: string
  location: string
  type: string
  tags?: Record<string, string>
}

export interface DeploymentResult {
  success: boolean
  deploymentId?: string
  resourceGroup?: string
  location?: string
  name?: string
  error?: string
}

class AzureService {
  async deploy(config: AzureDeploymentConfig): Promise<DeploymentResult> {
    try {
      const response = await fetch('/api/azure/deploy-resource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      
      if (!response.ok) {
        throw new Error(`Azure deployment failed: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}

export const cloudProviders = {
  azure: new AzureService()
}
