
export interface AzureCredentials {
  subscriptionId: string
  tenantId: string
  clientId: string
  clientSecret: string
}

export interface AzureResourceGroup {
  name: string
  location: string
  tags?: Record<string, string>
}

export interface AzureDeploymentResult {
  success: boolean
  deploymentId?: string
  resourceGroup?: string
  location?: string
  error?: string
  resources?: any[]
}

export class AzureService {
  private credentials: AzureCredentials | null = null

  setCredentials(credentials: AzureCredentials) {
    this.credentials = credentials
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.credentials) {
      return { success: false, error: 'No credentials provided' }
    }

    try {
      const token = await this.getAccessToken()
      if (token) {
        return { success: true }
      }
      return { success: false, error: 'Failed to authenticate' }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async listResourceGroups(): Promise<AzureResourceGroup[]> {
    if (!this.credentials) {
      throw new Error('Azure credentials not configured')
    }

    try {
      const token = await this.getAccessToken()
      const response = await fetch(
        `https://management.azure.com/subscriptions/${this.credentials.subscriptionId}/resourcegroups?api-version=2021-04-01`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to list resource groups: ${response.statusText}`)
      }

      const data = await response.json()
      return data.value.map((rg: any) => ({
        name: rg.name,
        location: rg.location,
        tags: rg.tags || {}
      }))
    } catch (error: any) {
      console.error('Failed to list resource groups:', error)
      return []
    }
  }

  async createResourceGroup(name: string, location: string, tags?: Record<string, string>): Promise<AzureDeploymentResult> {
    if (!this.credentials) {
      return { success: false, error: 'Azure credentials not configured' }
    }

    try {
      const token = await this.getAccessToken()
      const body = {
        location,
        tags: {
          createdBy: 'Instanti8-Platform',
          ...tags
        }
      }

      const response = await fetch(
        `https://management.azure.com/subscriptions/${this.credentials.subscriptionId}/resourcegroups/${name}?api-version=2021-04-01`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to create resource group: ${errorData.error?.message || response.statusText}`)
      }

      const result = await response.json()
      return {
        success: true,
        deploymentId: `rg-${Date.now()}`,
        resourceGroup: result.name,
        location: result.location,
        resources: [{ name: result.name, type: 'Resource Group' }]
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async deleteResourceGroup(name: string): Promise<AzureDeploymentResult> {
    if (!this.credentials) {
      return { success: false, error: 'Azure credentials not configured' }
    }

    try {
      const token = await this.getAccessToken()
      const response = await fetch(
        `https://management.azure.com/subscriptions/${this.credentials.subscriptionId}/resourcegroups/${name}?api-version=2021-04-01`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to delete resource group: ${errorData.error?.message || response.statusText}`)
      }

      return {
        success: true,
        deploymentId: `delete-${Date.now()}`,
        resourceGroup: name
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  private async getAccessToken(): Promise<string> {
    if (!this.credentials) {
      throw new Error('Azure credentials not configured')
    }

    const tokenUrl = `https://login.microsoftonline.com/${this.credentials.tenantId}/oauth2/v2.0/token`
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.credentials.clientId,
      client_secret: this.credentials.clientSecret,
      scope: 'https://management.azure.com/.default'
    })

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to get access token: ${error.error_description || response.statusText}`)
    }

    const data = await response.json()
    return data.access_token
  }

  generateTerraformCode(prompt: string, resourceType: string): { terraform: string; description: string } {
    const templates = {
      resource_group: {
        terraform: `terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "main" {
  name     = "example-rg"
  location = "East US"
  
  tags = {
    Environment = "Development"
    CreatedBy   = "Terraform"
  }
}`,
        description: "Creates an Azure Resource Group with basic configuration"
      },
      storage_account: {
        terraform: `resource "azurerm_resource_group" "main" {
  name     = "example-rg"
  location = "East US"
}

resource "azurerm_storage_account" "main" {
  name                     = "examplestorageacc"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  tags = {
    Environment = "Development"
  }
}`,
        description: "Creates an Azure Storage Account with a Resource Group"
      },
      container_instance: {
        terraform: `resource "azurerm_resource_group" "main" {
  name     = "example-rg"
  location = "East US"
}

resource "azurerm_container_group" "main" {
  name                = "example-container"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  ip_address_type     = "Public"
  os_type             = "Linux"

  container {
    name   = "hello-world"
    image  = "mcr.microsoft.com/azuredocs/aci-helloworld"
    cpu    = "0.5"
    memory = "1.5"

    ports {
      port     = 80
      protocol = "TCP"
    }
  }

  tags = {
    Environment = "Development"
  }
}`,
        description: "Creates an Azure Container Instance with public IP"
      }
    }

    const template = templates[resourceType as keyof typeof templates] || templates.resource_group
    
    // Customize based on prompt (basic implementation)
    let customizedCode = template.terraform
    const promptLower = prompt.toLowerCase()
    
    if (promptLower.includes('west us')) {
      customizedCode = customizedCode.replace('East US', 'West US')
    }
    if (promptLower.includes('production')) {
      customizedCode = customizedCode.replace('Development', 'Production')
    }

    return {
      terraform: customizedCode,
      description: template.description
    }
  }
}

const azureService = new AzureService()
export { azureService }
