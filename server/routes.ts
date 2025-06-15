
import type { Express } from "express";
import { azureService } from "./azure-service";
import { deploymentService } from "./deployment-service";
import { aiChatService } from "./ai-chat-service";

export function registerRoutes(app: Express) {
  // Azure connection test
  app.post("/api/azure/test-connection", async (req, res) => {
    try {
      const credentials = req.body;
      const result = await azureService.testConnection(credentials);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Azure IaC code generation
  app.post("/api/azure/generate-iac", async (req, res) => {
    try {
      const { prompt, resourceType, provider } = req.body;
      
      const terraformCode = generateTerraformCode(resourceType, prompt);
      
      res.json({
        terraform: terraformCode,
        description: `Generated Terraform code for ${resourceType}`,
        resourceType: resourceType
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Azure deployment
  app.post("/api/azure/deploy", async (req, res) => {
    try {
      const { code, codeType, provider, resourceType } = req.body;
      
      const deploymentId = await deploymentService.deployInfrastructure({
        code,
        codeType,
        provider,
        resourceType
      });
      
      res.json({
        success: true,
        deploymentId,
        message: "Deployment initiated successfully"
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Azure resource deployment
  app.post("/api/azure/deploy-resource", async (req, res) => {
    try {
      const config = req.body;
      
      // Simulate deployment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      res.json({
        success: true,
        deploymentId: `dep_${Date.now()}`,
        resourceGroup: config.resourceGroup,
        location: config.location,
        name: config.name
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get deployment status
  app.get("/api/deployment/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const status = deploymentService.getDeploymentStatus(id);
      
      if (!status) {
        return res.status(404).json({ error: "Deployment not found" });
      }
      
      res.json(status);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return { close: () => {} };
}

function generateTerraformCode(resourceType: string, prompt: string): string {
  switch (resourceType) {
    case 'resource_group':
      return `resource "azurerm_resource_group" "main" {
  name     = "instanti8-rg"
  location = "East US"

  tags = {
    Environment = "Development"
    CreatedBy   = "Instanti8"
    Project     = "Infrastructure"
  }
}`;
    
    case 'storage_account':
      return `resource "azurerm_storage_account" "main" {
  name                     = "instanti8storage"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  tags = {
    Environment = "Development"
    CreatedBy   = "Instanti8"
  }
}`;
    
    case 'virtual_machine':
      return `resource "azurerm_virtual_machine" "main" {
  name                = "instanti8-vm"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  vm_size             = "Standard_B1s"

  storage_os_disk {
    name              = "instanti8-osdisk"
    caching           = "ReadWrite"
    create_option     = "FromImage"
    managed_disk_type = "Standard_LRS"
  }

  os_profile {
    computer_name  = "instanti8"
    admin_username = "adminuser"
    admin_password = "Password123!"
  }

  os_profile_linux_config {
    disable_password_authentication = false
  }
}`;
    
    default:
      return `# Generated Terraform code for ${resourceType}
resource "azurerm_resource_group" "main" {
  name     = "instanti8-rg"
  location = "East US"
}`;
  }
}
