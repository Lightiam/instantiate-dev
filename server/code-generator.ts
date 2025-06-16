interface CodeGenerationRequest {
  prompt: string;
  provider: 'azure' | 'aws' | 'gcp';
  resourceType: 'container' | 'database' | 'storage' | 'network' | 'kubernetes' | 'custom';
  codeType: 'terraform' | 'pulumi';
}

interface GeneratedCode {
  code: string;
  codeType: string;
  resources: string[];
  description: string;
}

export class CodeGenerator {
  private cache = new Map<string, GeneratedCode>();
  
  generateTerraform(request: CodeGenerationRequest): GeneratedCode {
    // Cache key for faster lookups
    const cacheKey = `terraform-${request.provider}-${request.resourceType}-${request.prompt.slice(0, 50)}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    const { prompt, provider, resourceType } = request;
    
    let result: GeneratedCode;
    
    if (provider === 'azure') {
      switch (resourceType) {
        case 'container':
          result = this.generateAzureContainerTerraform(prompt);
          break;
        case 'database':
          result = this.generateAzureDatabaseTerraform(prompt);
          break;
        case 'storage':
          result = this.generateAzureStorageTerraform(prompt);
          break;
        case 'network':
          result = this.generateAzureNetworkTerraform(prompt);
          break;
        case 'kubernetes':
          result = this.generateAzureKubernetesTerraform(prompt);
          break;
        default:
          result = this.generateAzureCustomTerraform(prompt);
          break;
      }
    } else if (provider === 'aws') {
      switch (resourceType) {
        case 'container':
          result = this.generateAWSContainerTerraform(prompt);
          break;
        case 'database':
          result = this.generateAWSDatabaseTerraform(prompt);
          break;
        case 'storage':
          result = this.generateAWSStorageTerraform(prompt);
          break;
        case 'network':
          result = this.generateAWSNetworkTerraform(prompt);
          break;
        case 'kubernetes':
          result = this.generateAWSKubernetesTerraform(prompt);
          break;
        default:
          result = this.generateAWSCustomTerraform(prompt);
          break;
      }
    } else if (provider === 'gcp') {
      switch (resourceType) {
        case 'container':
          result = this.generateGCPContainerTerraform(prompt);
          break;
        case 'database':
          result = this.generateGCPDatabaseTerraform(prompt);
          break;
        case 'storage':
          result = this.generateGCPStorageTerraform(prompt);
          break;
        case 'network':
          result = this.generateGCPNetworkTerraform(prompt);
          break;
        case 'kubernetes':
          result = this.generateGCPKubernetesTerraform(prompt);
          break;
        default:
          result = this.generateGCPCustomTerraform(prompt);
          break;
      }
    } else {
      result = {
        code: '# Code generation for other providers coming soon',
        codeType: 'terraform',
        resources: [],
        description: 'Feature in development'
      };
    }
    
    // Cache the result for faster future responses
    this.cache.set(cacheKey, result);
    return result;
  }

  generatePulumi(request: CodeGenerationRequest): GeneratedCode {
    const { prompt, provider, resourceType } = request;
    
    if (provider === 'azure') {
      switch (resourceType) {
        case 'container':
          return this.generateAzureContainerPulumi(prompt);
        case 'database':
          return this.generateAzureDatabasePulumi(prompt);
        case 'storage':
          return this.generateAzureStoragePulumi(prompt);
        case 'network':
          return this.generateAzureNetworkPulumi(prompt);
        case 'kubernetes':
          return this.generateAzureKubernetesPulumi(prompt);
        default:
          return this.generateAzureCustomPulumi(prompt);
      }
    } else if (provider === 'aws') {
      switch (resourceType) {
        case 'container':
          return this.generateAWSContainerPulumi(prompt);
        case 'database':
          return this.generateAWSDatabasePulumi(prompt);
        case 'storage':
          return this.generateAWSStoragePulumi(prompt);
        case 'network':
          return this.generateAWSNetworkPulumi(prompt);
        case 'kubernetes':
          return this.generateAWSKubernetesPulumi(prompt);
        default:
          return this.generateAWSCustomPulumi(prompt);
      }
    } else if (provider === 'gcp') {
      switch (resourceType) {
        case 'container':
          return this.generateGCPContainerPulumi(prompt);
        case 'database':
          return this.generateGCPDatabasePulumi(prompt);
        case 'storage':
          return this.generateGCPStoragePulumi(prompt);
        case 'network':
          return this.generateGCPNetworkPulumi(prompt);
        case 'kubernetes':
          return this.generateGCPKubernetesPulumi(prompt);
        default:
          return this.generateGCPCustomPulumi(prompt);
      }
    }
    
    return {
      code: '// Code generation for other providers coming soon',
      codeType: 'pulumi',
      resources: [],
      description: 'Feature in development'
    };
  }

  private generateAzureContainerTerraform(prompt: string): GeneratedCode {
    const containerName = this.extractContainerName(prompt) || 'my-container';
    const imageName = this.extractImageName(prompt) || 'nginx:latest';
    const resourceGroup = this.extractResourceGroup(prompt) || 'rg-containers';
    const location = this.extractLocation(prompt) || 'East US';
    const ports = this.extractPorts(prompt) || [80];
    const cpu = this.extractCpu(prompt) || 1;
    const memory = this.extractMemory(prompt) || 1;

    const code = `# Azure Container Instance Configuration
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "${resourceGroup}"
  location = "${location}"
  
  tags = {
    Environment = "Production"
    ManagedBy   = "Terraform"
  }
}

# Container Instance
resource "azurerm_container_group" "${containerName.replace(/-/g, '_')}" {
  name                = "${containerName}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  ip_address_type     = "Public"
  dns_name_label      = "${containerName}-${Math.random().toString(36).substr(2, 5)}"
  os_type             = "Linux"
  
  container {
    name   = "${containerName}"
    image  = "${imageName}"
    cpu    = "${cpu}"
    memory = "${memory}"
    
    ${ports.map(port => `
    ports {
      port     = ${port}
      protocol = "TCP"
    }`).join('')}
  }
  
  tags = {
    Environment = "Production"
    Application = "${containerName}"
  }
}

# Outputs
output "container_fqdn" {
  description = "The FQDN of the container instance"
  value       = azurerm_container_group.${containerName.replace(/-/g, '_')}.fqdn
}

output "container_ip" {
  description = "The public IP address of the container instance"
  value       = azurerm_container_group.${containerName.replace(/-/g, '_')}.ip_address
}`;

    return {
      code,
      codeType: 'terraform',
      resources: ['azurerm_resource_group', 'azurerm_container_group'],
      description: `Azure Container Instance deployment for ${containerName} with ${imageName}`
    };
  }

  private generateAzureContainerPulumi(prompt: string): GeneratedCode {
    const containerName = this.extractContainerName(prompt) || 'my-container';
    const imageName = this.extractImageName(prompt) || 'nginx:latest';
    const resourceGroup = this.extractResourceGroup(prompt) || 'rg-containers';
    const location = this.extractLocation(prompt) || 'East US';
    const ports = this.extractPorts(prompt) || [80];
    const cpu = this.extractCpu(prompt) || 1;
    const memory = this.extractMemory(prompt) || 1;

    const code = `import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-native";

// Create Resource Group
const resourceGroup = new azure.resources.ResourceGroup("${resourceGroup}", {
    resourceGroupName: "${resourceGroup}",
    location: "${location}",
    tags: {
        Environment: "Production",
        ManagedBy: "Pulumi",
    },
});

// Create Container Instance
const containerGroup = new azure.containerinstance.ContainerGroup("${containerName}", {
    containerGroupName: "${containerName}",
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    ipAddress: {
        type: "Public",
        dnsNameLabel: "${containerName}-" + Math.random().toString(36).substr(2, 5),
        ports: [${ports.map(port => `{
            port: ${port},
            protocol: "TCP",
        }`).join(', ')}],
    },
    osType: "Linux",
    containers: [{
        name: "${containerName}",
        image: "${imageName}",
        resources: {
            requests: {
                cpu: ${cpu},
                memoryInGB: ${memory},
            },
        },
        ports: [${ports.map(port => `{
            port: ${port},
            protocol: "TCP",
        }`).join(', ')}],
    }],
    tags: {
        Environment: "Production",
        Application: "${containerName}",
    },
});

// Export outputs
export const containerFqdn = containerGroup.ipAddress.apply(ip => ip?.fqdn);
export const containerIp = containerGroup.ipAddress.apply(ip => ip?.ip);
export const resourceGroupName = resourceGroup.name;`;

    return {
      code,
      codeType: 'pulumi',
      resources: ['ResourceGroup', 'ContainerGroup'],
      description: `Azure Container Instance deployment for ${containerName} with ${imageName}`
    };
  }

  private generateAzureDatabaseTerraform(prompt: string): GeneratedCode {
    const dbName = this.extractDatabaseName(prompt) || 'mydb';
    const resourceGroup = this.extractResourceGroup(prompt) || 'rg-database';
    const location = this.extractLocation(prompt) || 'East US';
    const sku = this.extractSku(prompt) || 'B_Gen5_1';

    const code = `# Azure PostgreSQL Database Configuration
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "${resourceGroup}"
  location = "${location}"
}

# PostgreSQL Server
resource "azurerm_postgresql_server" "${dbName}" {
  name                = "${dbName}-server"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  
  administrator_login          = "psqladmin"
  administrator_login_password = "H@sh1CoR3!"
  
  sku_name   = "${sku}"
  version    = "11"
  storage_mb = 5120
  
  backup_retention_days        = 7
  geo_redundant_backup_enabled = false
  auto_grow_enabled           = true
  
  public_network_access_enabled    = false
  ssl_enforcement_enabled          = true
  ssl_minimal_tls_version_enforced = "TLS1_2"
}

# PostgreSQL Database
resource "azurerm_postgresql_database" "${dbName}" {
  name                = "${dbName}"
  resource_group_name = azurerm_resource_group.main.name
  server_name         = azurerm_postgresql_server.${dbName}.name
  charset             = "UTF8"
  collation           = "English_United States.1252"
}

# Firewall Rule (restrict as needed)
resource "azurerm_postgresql_firewall_rule" "main" {
  name                = "AllowAzureServices"
  resource_group_name = azurerm_resource_group.main.name
  server_name         = azurerm_postgresql_server.${dbName}.name
  start_ip_address    = "0.0.0.0"
  end_ip_address      = "0.0.0.0"
}

# Outputs
output "database_fqdn" {
  description = "The FQDN of the PostgreSQL server"
  value       = azurerm_postgresql_server.${dbName}.fqdn
}

output "connection_string" {
  description = "PostgreSQL connection string"
  value       = "postgresql://psqladmin@\${azurerm_postgresql_server.${dbName}.name}:\${azurerm_postgresql_server.${dbName}.administrator_login_password}@\${azurerm_postgresql_server.${dbName}.fqdn}:5432/${dbName}"
  sensitive   = true
}`;

    return {
      code,
      codeType: 'terraform',
      resources: ['azurerm_resource_group', 'azurerm_postgresql_server', 'azurerm_postgresql_database'],
      description: `Azure PostgreSQL database deployment for ${dbName}`
    };
  }

  private generateAzureDatabasePulumi(prompt: string): GeneratedCode {
    const dbName = this.extractDatabaseName(prompt) || 'mydb';
    const resourceGroup = this.extractResourceGroup(prompt) || 'rg-database';
    const location = this.extractLocation(prompt) || 'East US';

    const code = `import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-native";

// Create Resource Group
const resourceGroup = new azure.resources.ResourceGroup("${resourceGroup}", {
    resourceGroupName: "${resourceGroup}",
    location: "${location}",
});

// Create PostgreSQL Server
const postgresServer = new azure.dbforpostgresql.Server("${dbName}-server", {
    serverName: "${dbName}-server",
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    properties: {
        administratorLogin: "psqladmin",
        administratorLoginPassword: "H@sh1CoR3!",
        version: "11",
        storageProfile: {
            storageMB: 5120,
            backupRetentionDays: 7,
            geoRedundantBackup: "Disabled",
            storageAutogrow: "Enabled",
        },
        sslEnforcement: "Enabled",
        minimalTlsVersion: "TLS1_2",
        publicNetworkAccess: "Disabled",
    },
    sku: {
        name: "B_Gen5_1",
        tier: "Basic",
        capacity: 1,
        family: "Gen5",
    },
});

// Create Database
const database = new azure.dbforpostgresql.Database("${dbName}", {
    databaseName: "${dbName}",
    resourceGroupName: resourceGroup.name,
    serverName: postgresServer.name,
    properties: {
        charset: "UTF8",
        collation: "English_United States.1252",
    },
});

// Create Firewall Rule
const firewallRule = new azure.dbforpostgresql.FirewallRule("AllowAzureServices", {
    firewallRuleName: "AllowAzureServices",
    resourceGroupName: resourceGroup.name,
    serverName: postgresServer.name,
    properties: {
        startIpAddress: "0.0.0.0",
        endIpAddress: "0.0.0.0",
    },
});

// Export outputs
export const databaseFqdn = postgresServer.properties.apply(p => p?.fullyQualifiedDomainName);
export const connectionString = pulumi.interpolate\`postgresql://psqladmin:H@sh1CoR3!@\${postgresServer.properties.fullyQualifiedDomainName}:5432/${dbName}\`;
export const resourceGroupName = resourceGroup.name;`;

    return {
      code,
      codeType: 'pulumi',
      resources: ['ResourceGroup', 'Server', 'Database', 'FirewallRule'],
      description: `Azure PostgreSQL database deployment for ${dbName}`
    };
  }

  private generateAzureStorageTerraform(prompt: string): GeneratedCode {
    const storageAccountName = this.extractStorageAccountName(prompt) || 'mystorageacct';
    const resourceGroup = this.extractResourceGroup(prompt) || 'rg-storage';
    const location = this.extractLocation(prompt) || 'East US';

    const code = `# Azure Blob Storage Configuration
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "${resourceGroup}"
  location = "${location}"
}

# Storage Account
resource "azurerm_storage_account" "${storageAccountName}" {
  name                     = "${storageAccountName}${Math.random().toString(36).substr(2, 5)}"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  
  blob_properties {
    versioning_enabled = true
    delete_retention_policy {
      days = 7
    }
  }
  
  tags = {
    Environment = "Production"
    ManagedBy   = "Terraform"
  }
}

# Storage Container
resource "azurerm_storage_container" "main" {
  name                  = "data"
  storage_account_name  = azurerm_storage_account.${storageAccountName}.name
  container_access_type = "private"
}

# Outputs
output "storage_account_name" {
  description = "The name of the storage account"
  value       = azurerm_storage_account.${storageAccountName}.name
}

output "primary_blob_endpoint" {
  description = "The primary blob service endpoint"
  value       = azurerm_storage_account.${storageAccountName}.primary_blob_endpoint
}

output "primary_access_key" {
  description = "The primary access key for the storage account"
  value       = azurerm_storage_account.${storageAccountName}.primary_access_key
  sensitive   = true
}`;

    return {
      code,
      codeType: 'terraform',
      resources: ['azurerm_resource_group', 'azurerm_storage_account', 'azurerm_storage_container'],
      description: `Azure Blob Storage deployment for ${storageAccountName}`
    };
  }

  private generateAzureStoragePulumi(prompt: string): GeneratedCode {
    const storageAccountName = this.extractStorageAccountName(prompt) || 'mystorageacct';
    const resourceGroup = this.extractResourceGroup(prompt) || 'rg-storage';
    const location = this.extractLocation(prompt) || 'East US';

    const code = `import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-native";

// Create Resource Group
const resourceGroup = new azure.resources.ResourceGroup("${resourceGroup}", {
    resourceGroupName: "${resourceGroup}",
    location: "${location}",
});

// Create Storage Account
const storageAccount = new azure.storage.StorageAccount("${storageAccountName}", {
    accountName: "${storageAccountName}" + Math.random().toString(36).substr(2, 5),
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    sku: {
        name: "Standard_LRS",
    },
    kind: "StorageV2",
    properties: {
        accessTier: "Hot",
        supportsHttpsTrafficOnly: true,
        minimumTlsVersion: "TLS1_2",
    },
    tags: {
        Environment: "Production",
        ManagedBy: "Pulumi",
    },
});

// Create Blob Container
const blobContainer = new azure.storage.BlobContainer("data", {
    containerName: "data",
    resourceGroupName: resourceGroup.name,
    accountName: storageAccount.name,
    properties: {
        publicAccess: "None",
    },
});

// Export outputs
export const storageAccountName = storageAccount.name;
export const primaryBlobEndpoint = storageAccount.properties.apply(p => p?.primaryEndpoints?.blob);
export const resourceGroupName = resourceGroup.name;`;

    return {
      code,
      codeType: 'pulumi',
      resources: ['ResourceGroup', 'StorageAccount', 'BlobContainer'],
      description: `Azure Blob Storage deployment for ${storageAccountName}`
    };
  }

  private generateAzureNetworkTerraform(prompt: string): GeneratedCode {
    const vnetName = this.extractVnetName(prompt) || 'main-vnet';
    const resourceGroup = this.extractResourceGroup(prompt) || 'rg-network';
    const location = this.extractLocation(prompt) || 'East US';

    const code = `# Azure Virtual Network Configuration
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "${resourceGroup}"
  location = "${location}"
}

# Virtual Network
resource "azurerm_virtual_network" "${vnetName.replace(/-/g, '_')}" {
  name                = "${vnetName}"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  
  tags = {
    Environment = "Production"
    ManagedBy   = "Terraform"
  }
}

# Public Subnet
resource "azurerm_subnet" "public" {
  name                 = "public-subnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.${vnetName.replace(/-/g, '_')}.name
  address_prefixes     = ["10.0.1.0/24"]
}

# Private Subnet
resource "azurerm_subnet" "private" {
  name                 = "private-subnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.${vnetName.replace(/-/g, '_')}.name
  address_prefixes     = ["10.0.2.0/24"]
}

# Network Security Group
resource "azurerm_network_security_group" "main" {
  name                = "${vnetName}-nsg"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  
  security_rule {
    name                       = "HTTP"
    priority                   = 1001
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
  
  security_rule {
    name                       = "HTTPS"
    priority                   = 1002
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

# Associate NSG with Public Subnet
resource "azurerm_subnet_network_security_group_association" "public" {
  subnet_id                 = azurerm_subnet.public.id
  network_security_group_id = azurerm_network_security_group.main.id
}

# Outputs
output "vnet_id" {
  description = "The ID of the virtual network"
  value       = azurerm_virtual_network.${vnetName.replace(/-/g, '_')}.id
}

output "public_subnet_id" {
  description = "The ID of the public subnet"
  value       = azurerm_subnet.public.id
}

output "private_subnet_id" {
  description = "The ID of the private subnet"
  value       = azurerm_subnet.private.id
}`;

    return {
      code,
      codeType: 'terraform',
      resources: ['azurerm_resource_group', 'azurerm_virtual_network', 'azurerm_subnet', 'azurerm_network_security_group'],
      description: `Azure Virtual Network deployment for ${vnetName}`
    };
  }

  private generateAzureNetworkPulumi(prompt: string): GeneratedCode {
    const vnetName = this.extractVnetName(prompt) || 'main-vnet';
    const resourceGroup = this.extractResourceGroup(prompt) || 'rg-network';
    const location = this.extractLocation(prompt) || 'East US';

    const code = `import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-native";

// Create Resource Group
const resourceGroup = new azure.resources.ResourceGroup("${resourceGroup}", {
    resourceGroupName: "${resourceGroup}",
    location: "${location}",
});

// Create Virtual Network
const virtualNetwork = new azure.network.VirtualNetwork("${vnetName}", {
    virtualNetworkName: "${vnetName}",
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    properties: {
        addressSpace: {
            addressPrefixes: ["10.0.0.0/16"],
        },
    },
    tags: {
        Environment: "Production",
        ManagedBy: "Pulumi",
    },
});

// Create Public Subnet
const publicSubnet = new azure.network.Subnet("public-subnet", {
    subnetName: "public-subnet",
    resourceGroupName: resourceGroup.name,
    virtualNetworkName: virtualNetwork.name,
    properties: {
        addressPrefix: "10.0.1.0/24",
    },
});

// Create Private Subnet
const privateSubnet = new azure.network.Subnet("private-subnet", {
    subnetName: "private-subnet",
    resourceGroupName: resourceGroup.name,
    virtualNetworkName: virtualNetwork.name,
    properties: {
        addressPrefix: "10.0.2.0/24",
    },
});

// Create Network Security Group
const networkSecurityGroup = new azure.network.NetworkSecurityGroup("${vnetName}-nsg", {
    networkSecurityGroupName: "${vnetName}-nsg",
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    properties: {
        securityRules: [
            {
                name: "HTTP",
                properties: {
                    protocol: "Tcp",
                    sourcePortRange: "*",
                    destinationPortRange: "80",
                    sourceAddressPrefix: "*",
                    destinationAddressPrefix: "*",
                    access: "Allow",
                    priority: 1001,
                    direction: "Inbound",
                },
            },
            {
                name: "HTTPS",
                properties: {
                    protocol: "Tcp",
                    sourcePortRange: "*",
                    destinationPortRange: "443",
                    sourceAddressPrefix: "*",
                    destinationAddressPrefix: "*",
                    access: "Allow",
                    priority: 1002,
                    direction: "Inbound",
                },
            },
        ],
    },
});

// Export outputs
export const vnetId = virtualNetwork.id;
export const publicSubnetId = publicSubnet.id;
export const privateSubnetId = privateSubnet.id;
export const resourceGroupName = resourceGroup.name;`;

    return {
      code,
      codeType: 'pulumi',
      resources: ['ResourceGroup', 'VirtualNetwork', 'Subnet', 'NetworkSecurityGroup'],
      description: `Azure Virtual Network deployment for ${vnetName}`
    };
  }

  private generateAzureKubernetesTerraform(prompt: string): GeneratedCode {
    const clusterName = this.extractClusterName(prompt) || 'aks-cluster';
    const resourceGroup = this.extractResourceGroup(prompt) || 'rg-kubernetes';
    const location = this.extractLocation(prompt) || 'East US';
    const nodeCount = this.extractNodeCount(prompt) || 2;

    const code = `# Azure Kubernetes Service Configuration
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "${resourceGroup}"
  location = "${location}"
}

# AKS Cluster
resource "azurerm_kubernetes_cluster" "${clusterName.replace(/-/g, '_')}" {
  name                = "${clusterName}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  dns_prefix          = "${clusterName}"
  
  default_node_pool {
    name       = "default"
    node_count = ${nodeCount}
    vm_size    = "Standard_D2_v2"
    
    upgrade_settings {
      max_surge = "10%"
    }
  }
  
  identity {
    type = "SystemAssigned"
  }
  
  network_profile {
    network_plugin = "kubenet"
    load_balancer_sku = "standard"
  }
  
  tags = {
    Environment = "Production"
    ManagedBy   = "Terraform"
  }
}

# Role Assignment for ACR
resource "azurerm_role_assignment" "aks_acr" {
  principal_id                     = azurerm_kubernetes_cluster.${clusterName.replace(/-/g, '_')}.kubelet_identity[0].object_id
  role_definition_name             = "AcrPull"
  scope                           = azurerm_resource_group.main.id
  skip_service_principal_aad_check = true
}

# Outputs
output "cluster_name" {
  description = "The name of the AKS cluster"
  value       = azurerm_kubernetes_cluster.${clusterName.replace(/-/g, '_')}.name
}

output "kubeconfig" {
  description = "Kubeconfig for the AKS cluster"
  value       = azurerm_kubernetes_cluster.${clusterName.replace(/-/g, '_')}.kube_config_raw
  sensitive   = true
}

output "cluster_fqdn" {
  description = "The FQDN of the AKS cluster"
  value       = azurerm_kubernetes_cluster.${clusterName.replace(/-/g, '_')}.fqdn
}`;

    return {
      code,
      codeType: 'terraform',
      resources: ['azurerm_resource_group', 'azurerm_kubernetes_cluster', 'azurerm_role_assignment'],
      description: `Azure Kubernetes Service deployment for ${clusterName}`
    };
  }

  private generateAzureKubernetesPulumi(prompt: string): GeneratedCode {
    const clusterName = this.extractClusterName(prompt) || 'aks-cluster';
    const resourceGroup = this.extractResourceGroup(prompt) || 'rg-kubernetes';
    const location = this.extractLocation(prompt) || 'East US';
    const nodeCount = this.extractNodeCount(prompt) || 2;

    const code = `import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-native";

// Create Resource Group
const resourceGroup = new azure.resources.ResourceGroup("${resourceGroup}", {
    resourceGroupName: "${resourceGroup}",
    location: "${location}",
});

// Create AKS Cluster
const aksCluster = new azure.containerservice.ManagedCluster("${clusterName}", {
    resourceName: "${clusterName}",
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    properties: {
        dnsPrefix: "${clusterName}",
        agentPoolProfiles: [{
            name: "default",
            count: ${nodeCount},
            vmSize: "Standard_D2_v2",
            mode: "System",
            osType: "Linux",
            type: "VirtualMachineScaleSets",
            upgradeSettings: {
                maxSurge: "10%",
            },
        }],
        identity: {
            type: "SystemAssigned",
        },
        networkProfile: {
            networkPlugin: "kubenet",
            loadBalancerSku: "Standard",
        },
        kubernetesVersion: "1.25.6",
    },
    tags: {
        Environment: "Production",
        ManagedBy: "Pulumi",
    },
});

// Export outputs
export const clusterName = aksCluster.name;
export const kubeconfig = aksCluster.properties.apply(p => p?.kubeConfigRaw);
export const clusterFqdn = aksCluster.properties.apply(p => p?.fqdn);
export const resourceGroupName = resourceGroup.name;`;

    return {
      code,
      codeType: 'pulumi',
      resources: ['ResourceGroup', 'ManagedCluster'],
      description: `Azure Kubernetes Service deployment for ${clusterName}`
    };
  }

  private generateAzureCustomTerraform(prompt: string): GeneratedCode {
    return {
      code: `# Custom Azure Infrastructure Configuration
# Generated based on: "${prompt}"

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "rg-custom"
  location = "East US"
  
  tags = {
    Environment = "Production"
    ManagedBy   = "Terraform"
    Purpose     = "Custom Infrastructure"
  }
}

# Add your custom resources here based on requirements`,
      codeType: 'terraform',
      resources: ['azurerm_resource_group'],
      description: 'Custom Azure infrastructure template'
    };
  }

  private generateAzureCustomPulumi(prompt: string): GeneratedCode {
    return {
      code: `import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-native";

// Custom Azure Infrastructure Configuration
// Generated based on: "${prompt}"

// Create Resource Group
const resourceGroup = new azure.resources.ResourceGroup("rg-custom", {
    resourceGroupName: "rg-custom",
    location: "East US",
    tags: {
        Environment: "Production",
        ManagedBy: "Pulumi",
        Purpose: "Custom Infrastructure",
    },
});

// Add your custom resources here based on requirements

// Export outputs
export const resourceGroupName = resourceGroup.name;`,
      codeType: 'pulumi',
      resources: ['ResourceGroup'],
      description: 'Custom Azure infrastructure template'
    };
  }

  private generateAWSContainerTerraform(prompt: string): GeneratedCode {
    const containerName = this.extractContainerName(prompt) || 'my-container';
    const imageName = this.extractImageName(prompt) || 'nginx:latest';
    const region = this.extractAWSRegion(prompt) || 'us-east-1';
    const ports = this.extractPorts(prompt) || [80];
    const cpu = this.extractCpu(prompt) || 256;
    const memory = this.extractMemory(prompt) || 512;

    const code = `# AWS ECS Fargate Container Configuration
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "${region}"
}

# VPC and Networking
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${containerName}-vpc"
    Environment = "Production"
    ManagedBy   = "Terraform"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${containerName}-igw"
  }
}

resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.\${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  map_public_ip_on_launch = true

  tags = {
    Name = "${containerName}-public-subnet-\${count.index + 1}"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${containerName}-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

data "aws_availability_zones" "available" {
  state = "available"
}

# Security Group
resource "aws_security_group" "ecs_tasks" {
  name_prefix = "${containerName}-ecs-tasks-"
  vpc_id      = aws_vpc.main.id

  ${ports.map(port => `
  ingress {
    protocol         = "tcp"
    from_port        = ${port}
    to_port          = ${port}
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }`).join('')}

  egress {
    protocol         = "-1"
    from_port        = 0
    to_port          = 0
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name = "${containerName}-ecs-tasks-sg"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "${containerName.replace(/-/g, '_')}" {
  name = "${containerName}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name        = "${containerName}-cluster"
    Environment = "Production"
  }
}

# ECS Task Definition
resource "aws_ecs_task_definition" "${containerName.replace(/-/g, '_')}" {
  family                   = "${containerName}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "${cpu}"
  memory                   = "${memory}"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "${containerName}"
      image     = "${imageName}"
      essential = true
      
      portMappings = [${ports.map(port => `
        {
          protocol      = "tcp"
          containerPort = ${port}
          hostPort      = ${port}
        }`).join(',')}
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs.name
          awslogs-region        = "${region}"
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])

  tags = {
    Name = "${containerName}-task-definition"
  }
}

# ECS Service
resource "aws_ecs_service" "${containerName.replace(/-/g, '_')}" {
  name            = "${containerName}-service"
  cluster         = aws_ecs_cluster.${containerName.replace(/-/g, '_')}.id
  task_definition = aws_ecs_task_definition.${containerName.replace(/-/g, '_')}.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_tasks.id]
    subnets          = aws_subnet.public[*].id
    assign_public_ip = true
  }

  depends_on = [aws_iam_role_policy_attachment.ecs_task_execution_role]

  tags = {
    Name = "${containerName}-service"
  }
}

# IAM Role for ECS Task Execution
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${containerName}-ecsTaskExecutionRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${containerName}"
  retention_in_days = 30

  tags = {
    Name = "${containerName}-log-group"
  }
}

# Outputs
output "cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.${containerName.replace(/-/g, '_')}.name
}

output "service_name" {
  description = "Name of the ECS service"
  value       = aws_ecs_service.${containerName.replace(/-/g, '_')}.name
}

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}`;

    return {
      code,
      codeType: 'terraform',
      resources: ['aws_vpc', 'aws_ecs_cluster', 'aws_ecs_service', 'aws_ecs_task_definition'],
      description: `AWS ECS Fargate deployment for ${containerName} with ${imageName}`
    };
  }

  private generateAWSDatabaseTerraform(prompt: string): GeneratedCode {
    const dbName = this.extractDatabaseName(prompt) || 'mydb';
    const region = this.extractAWSRegion(prompt) || 'us-east-1';
    const instanceClass = this.extractAWSInstanceClass(prompt) || 'db.t3.micro';

    const code = `# AWS RDS PostgreSQL Database Configuration
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "${region}"
}

# VPC for RDS
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${dbName}-vpc"
  }
}

# Subnets
resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.\${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "${dbName}-private-subnet-\${count.index + 1}"
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

# DB Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${dbName}-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "${dbName} DB subnet group"
  }
}

# Security Group
resource "aws_security_group" "rds" {
  name_prefix = "${dbName}-rds-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${dbName}-rds-sg"
  }
}

# RDS Instance
resource "aws_db_instance" "${dbName}" {
  identifier     = "${dbName}"
  engine         = "postgres"
  engine_version = "14.9"
  instance_class = "${instanceClass}"
  
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp2"
  storage_encrypted     = true
  
  db_name  = "${dbName}"
  username = "postgres"
  password = "changeme123!"
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = 7
  backup_window          = "07:00-09:00"
  maintenance_window     = "Sun:09:00-Sun:11:00"
  
  skip_final_snapshot = true
  deletion_protection = false

  tags = {
    Name        = "${dbName}"
    Environment = "Production"
    ManagedBy   = "Terraform"
  }
}

# Outputs
output "rds_hostname" {
  description = "RDS instance hostname"
  value       = aws_db_instance.${dbName}.address
}

output "rds_port" {
  description = "RDS instance port"
  value       = aws_db_instance.${dbName}.port
}

output "rds_username" {
  description = "RDS instance root username"
  value       = aws_db_instance.${dbName}.username
  sensitive   = true
}

output "connection_string" {
  description = "PostgreSQL connection string"
  value       = "postgresql://\${aws_db_instance.${dbName}.username}:\${aws_db_instance.${dbName}.password}@\${aws_db_instance.${dbName}.address}:\${aws_db_instance.${dbName}.port}/${dbName}"
  sensitive   = true
}`;

    return {
      code,
      codeType: 'terraform',
      resources: ['aws_vpc', 'aws_db_instance', 'aws_db_subnet_group', 'aws_security_group'],
      description: `AWS RDS PostgreSQL database deployment for ${dbName}`
    };
  }

  private generateAWSStorageTerraform(prompt: string): GeneratedCode {
    const bucketName = this.extractStorageAccountName(prompt) || 'my-storage-bucket';
    const region = this.extractAWSRegion(prompt) || 'us-east-1';

    const code = `# AWS S3 Bucket Configuration
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "${region}"
}

# S3 Bucket
resource "aws_s3_bucket" "${bucketName.replace(/-/g, '_')}" {
  bucket = "${bucketName}-\${random_string.bucket_suffix.result}"

  tags = {
    Name        = "${bucketName}"
    Environment = "Production"
    ManagedBy   = "Terraform"
  }
}

resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

# S3 Bucket Versioning
resource "aws_s3_bucket_versioning" "${bucketName.replace(/-/g, '_')}" {
  bucket = aws_s3_bucket.${bucketName.replace(/-/g, '_')}.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 Bucket Server Side Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "${bucketName.replace(/-/g, '_')}" {
  bucket = aws_s3_bucket.${bucketName.replace(/-/g, '_')}.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# S3 Bucket Public Access Block
resource "aws_s3_bucket_public_access_block" "${bucketName.replace(/-/g, '_')}" {
  bucket = aws_s3_bucket.${bucketName.replace(/-/g, '_')}.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 Bucket Policy
resource "aws_s3_bucket_policy" "${bucketName.replace(/-/g, '_')}" {
  bucket = aws_s3_bucket.${bucketName.replace(/-/g, '_')}.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "DenyInsecureConnections"
        Effect    = "Deny"
        Principal = "*"
        Action    = "s3:*"
        Resource = [
          aws_s3_bucket.${bucketName.replace(/-/g, '_')}.arn,
          "\${aws_s3_bucket.${bucketName.replace(/-/g, '_')}.arn}/*",
        ]
        Condition = {
          Bool = {
            "aws:SecureTransport" = "false"
          }
        }
      },
    ]
  })
}

# Outputs
output "bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.${bucketName.replace(/-/g, '_')}.bucket
}

output "bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.${bucketName.replace(/-/g, '_')}.arn
}

output "bucket_domain_name" {
  description = "Domain name of the S3 bucket"
  value       = aws_s3_bucket.${bucketName.replace(/-/g, '_')}.bucket_domain_name
}`;

    return {
      code,
      codeType: 'terraform',
      resources: ['aws_s3_bucket', 'aws_s3_bucket_versioning', 'aws_s3_bucket_server_side_encryption_configuration'],
      description: `AWS S3 bucket deployment for ${bucketName}`
    };
  }

  private generateAWSNetworkTerraform(prompt: string): GeneratedCode {
    const vpcName = this.extractVnetName(prompt) || 'main-vpc';
    const region = this.extractAWSRegion(prompt) || 'us-east-1';

    const code = `# AWS VPC Configuration
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "${region}"
}

# VPC
resource "aws_vpc" "${vpcName.replace(/-/g, '_')}" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${vpcName}"
    Environment = "Production"
    ManagedBy   = "Terraform"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.${vpcName.replace(/-/g, '_')}.id

  tags = {
    Name = "${vpcName}-igw"
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.${vpcName.replace(/-/g, '_')}.id
  cidr_block        = "10.0.\${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  map_public_ip_on_launch = true

  tags = {
    Name = "${vpcName}-public-subnet-\${count.index + 1}"
    Type = "Public"
  }
}

# Private Subnets
resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.${vpcName.replace(/-/g, '_')}.id
  cidr_block        = "10.0.\${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "${vpcName}-private-subnet-\${count.index + 1}"
    Type = "Private"
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

# NAT Gateway
resource "aws_eip" "nat" {
  count  = 2
  domain = "vpc"

  tags = {
    Name = "${vpcName}-nat-eip-\${count.index + 1}"
  }

  depends_on = [aws_internet_gateway.main]
}

resource "aws_nat_gateway" "main" {
  count         = 2
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = {
    Name = "${vpcName}-nat-gateway-\${count.index + 1}"
  }

  depends_on = [aws_internet_gateway.main]
}

# Route Tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.${vpcName.replace(/-/g, '_')}.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${vpcName}-public-rt"
  }
}

resource "aws_route_table" "private" {
  count  = 2
  vpc_id = aws_vpc.${vpcName.replace(/-/g, '_')}.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }

  tags = {
    Name = "${vpcName}-private-rt-\${count.index + 1}"
  }
}

# Route Table Associations
resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = length(aws_subnet.private)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# Security Groups
resource "aws_security_group" "web" {
  name_prefix = "${vpcName}-web-"
  vpc_id      = aws_vpc.${vpcName.replace(/-/g, '_')}.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${vpcName}-web-sg"
  }
}

# Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.${vpcName.replace(/-/g, '_')}.id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = aws_subnet.private[*].id
}

output "internet_gateway_id" {
  description = "ID of the Internet Gateway"
  value       = aws_internet_gateway.main.id
}`;

    return {
      code,
      codeType: 'terraform',
      resources: ['aws_vpc', 'aws_subnet', 'aws_internet_gateway', 'aws_nat_gateway', 'aws_route_table'],
      description: `AWS VPC deployment for ${vpcName}`
    };
  }

  private generateAWSKubernetesTerraform(prompt: string): GeneratedCode {
    const clusterName = this.extractClusterName(prompt) || 'eks-cluster';
    const region = this.extractAWSRegion(prompt) || 'us-east-1';
    const nodeCount = this.extractNodeCount(prompt) || 2;

    const code = `# AWS EKS Cluster Configuration
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "${region}"
}

# VPC for EKS
resource "aws_vpc" "eks" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name                                        = "${clusterName}-vpc"
    "kubernetes.io/cluster/${clusterName}"      = "shared"
  }
}

# Subnets
resource "aws_subnet" "eks" {
  count             = 2
  vpc_id            = aws_vpc.eks.id
  cidr_block        = "10.0.\${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  map_public_ip_on_launch = true

  tags = {
    Name                                        = "${clusterName}-subnet-\${count.index + 1}"
    "kubernetes.io/cluster/${clusterName}"      = "shared"
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

# Internet Gateway
resource "aws_internet_gateway" "eks" {
  vpc_id = aws_vpc.eks.id

  tags = {
    Name = "${clusterName}-igw"
  }
}

# Route Table
resource "aws_route_table" "eks" {
  vpc_id = aws_vpc.eks.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.eks.id
  }

  tags = {
    Name = "${clusterName}-rt"
  }
}

resource "aws_route_table_association" "eks" {
  count          = length(aws_subnet.eks)
  subnet_id      = aws_subnet.eks[count.index].id
  route_table_id = aws_route_table.eks.id
}

# EKS Cluster IAM Role
resource "aws_iam_role" "eks_cluster" {
  name = "${clusterName}-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster.name
}

# EKS Node Group IAM Role
resource "aws_iam_role" "eks_node_group" {
  name = "${clusterName}-node-group-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "eks_worker_node_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.eks_node_group.name
}

resource "aws_iam_role_policy_attachment" "eks_cni_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.eks_node_group.name
}

resource "aws_iam_role_policy_attachment" "eks_container_registry_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.eks_node_group.name
}

# EKS Cluster
resource "aws_eks_cluster" "${clusterName.replace(/-/g, '_')}" {
  name     = "${clusterName}"
  role_arn = aws_iam_role.eks_cluster.arn
  version  = "1.27"

  vpc_config {
    subnet_ids = aws_subnet.eks[*].id
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy,
  ]

  tags = {
    Name        = "${clusterName}"
    Environment = "Production"
    ManagedBy   = "Terraform"
  }
}

# EKS Node Group
resource "aws_eks_node_group" "${clusterName.replace(/-/g, '_')}" {
  cluster_name    = aws_eks_cluster.${clusterName.replace(/-/g, '_')}.name
  node_group_name = "${clusterName}-nodes"
  node_role_arn   = aws_iam_role.eks_node_group.arn
  subnet_ids      = aws_subnet.eks[*].id

  scaling_config {
    desired_size = ${nodeCount}
    max_size     = ${nodeCount + 2}
    min_size     = 1
  }

  update_config {
    max_unavailable = 1
  }

  instance_types = ["t3.medium"]

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.eks_container_registry_policy,
  ]

  tags = {
    Name = "${clusterName}-nodes"
  }
}

# Outputs
output "cluster_name" {
  description = "Name of the EKS cluster"
  value       = aws_eks_cluster.${clusterName.replace(/-/g, '_')}.name
}

output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = aws_eks_cluster.${clusterName.replace(/-/g, '_')}.endpoint
}

output "cluster_security_group_id" {
  description = "Security group ids attached to the cluster control plane"
  value       = aws_eks_cluster.${clusterName.replace(/-/g, '_')}.vpc_config[0].cluster_security_group_id
}

output "cluster_arn" {
  description = "The Amazon Resource Name (ARN) of the cluster"
  value       = aws_eks_cluster.${clusterName.replace(/-/g, '_')}.arn
}`;

    return {
      code,
      codeType: 'terraform',
      resources: ['aws_vpc', 'aws_eks_cluster', 'aws_eks_node_group', 'aws_iam_role'],
      description: `AWS EKS cluster deployment for ${clusterName}`
    };
  }

  private generateAWSCustomTerraform(prompt: string): GeneratedCode {
    const region = this.extractAWSRegion(prompt) || 'us-east-1';

    return {
      code: `# Custom AWS Infrastructure Configuration
# Generated based on: "${prompt}"

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "${region}"
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "custom-vpc"
    Environment = "Production"
    ManagedBy   = "Terraform"
    Purpose     = "Custom Infrastructure"
  }
}

# Add your custom AWS resources here based on requirements`,
      codeType: 'terraform',
      resources: ['aws_vpc'],
      description: 'Custom AWS infrastructure template'
    };
  }

  private generateGCPContainerTerraform(prompt: string): GeneratedCode {
    const containerName = this.extractContainerName(prompt) || 'my-container';
    const imageName = this.extractImageName(prompt) || 'nginx:latest';
    const region = this.extractGCPRegion(prompt) || 'us-central1';
    const projectId = this.extractGCPProjectId(prompt) || 'my-project';
    const ports = this.extractPorts(prompt) || [80];

    const code = `# GCP Cloud Run Container Configuration
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = "${projectId}"
  region  = "${region}"
}

# Enable required APIs
resource "google_project_service" "cloud_run_api" {
  service = "run.googleapis.com"
}

resource "google_project_service" "container_registry_api" {
  service = "containerregistry.googleapis.com"
}

# Cloud Run Service
resource "google_cloud_run_service" "${containerName.replace(/-/g, '_')}" {
  name     = "${containerName}"
  location = "${region}"

  template {
    spec {
      containers {
        image = "${imageName}"
        
        ${ports.map(port => `
        ports {
          container_port = ${port}
        }`).join('')}
        
        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }
        
        env {
          name  = "PORT"
          value = "${ports[0]}"
        }
      }
      
      container_concurrency = 80
      timeout_seconds       = 300
    }
    
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = "100"
        "run.googleapis.com/cpu-throttling" = "false"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [google_project_service.cloud_run_api]
}

# IAM policy to allow public access
resource "google_cloud_run_service_iam_member" "public" {
  service  = google_cloud_run_service.${containerName.replace(/-/g, '_')}.name
  location = google_cloud_run_service.${containerName.replace(/-/g, '_')}.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Outputs
output "service_url" {
  description = "URL of the Cloud Run service"
  value       = google_cloud_run_service.${containerName.replace(/-/g, '_')}.status[0].url
}

output "service_name" {
  description = "Name of the Cloud Run service"
  value       = google_cloud_run_service.${containerName.replace(/-/g, '_')}.name
}`;

    return {
      code,
      codeType: 'terraform',
      resources: ['google_cloud_run_service', 'google_project_service', 'google_cloud_run_service_iam_member'],
      description: `GCP Cloud Run deployment for ${containerName} with ${imageName}`
    };
  }

  private generateGCPDatabaseTerraform(prompt: string): GeneratedCode {
    const dbName = this.extractDatabaseName(prompt) || 'mydb';
    const region = this.extractGCPRegion(prompt) || 'us-central1';
    const projectId = this.extractGCPProjectId(prompt) || 'my-project';
    const tier = this.extractGCPTier(prompt) || 'db-f1-micro';

    const code = `# GCP Cloud SQL PostgreSQL Database Configuration
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = "${projectId}"
  region  = "${region}"
}

# Enable Cloud SQL API
resource "google_project_service" "sql_api" {
  service = "sqladmin.googleapis.com"
}

# Cloud SQL Instance
resource "google_sql_database_instance" "${dbName.replace(/-/g, '_')}" {
  name             = "${dbName}-instance"
  database_version = "POSTGRES_14"
  region           = "${region}"
  
  settings {
    tier = "${tier}"
    
    backup_configuration {
      enabled                        = true
      start_time                     = "23:00"
      point_in_time_recovery_enabled = true
      backup_retention_settings {
        retained_backups = 7
      }
    }
    
    ip_configuration {
      ipv4_enabled    = true
      authorized_networks {
        value = "0.0.0.0/0"
        name  = "all"
      }
    }
    
    database_flags {
      name  = "log_checkpoints"
      value = "on"
    }
  }
  
  deletion_protection = false

  depends_on = [google_project_service.sql_api]
}

# Database
resource "google_sql_database" "${dbName}" {
  name     = "${dbName}"
  instance = google_sql_database_instance.${dbName.replace(/-/g, '_')}.name
}

# Database User
resource "google_sql_user" "${dbName}_user" {
  name     = "postgres"
  instance = google_sql_database_instance.${dbName.replace(/-/g, '_')}.name
  password = "changeme123!"
}

# Outputs
output "database_connection_name" {
  description = "Connection name for the database instance"
  value       = google_sql_database_instance.${dbName.replace(/-/g, '_')}.connection_name
}

output "database_ip_address" {
  description = "IP address of the database instance"
  value       = google_sql_database_instance.${dbName.replace(/-/g, '_')}.public_ip_address
}

output "connection_string" {
  description = "PostgreSQL connection string"
  value       = "postgresql://postgres:changeme123!@\${google_sql_database_instance.${dbName.replace(/-/g, '_')}.public_ip_address}:5432/${dbName}"
  sensitive   = true
}`;

    return {
      code,
      codeType: 'terraform',
      resources: ['google_sql_database_instance', 'google_sql_database', 'google_sql_user'],
      description: `GCP Cloud SQL PostgreSQL database deployment for ${dbName}`
    };
  }

  private generateGCPStorageTerraform(prompt: string): GeneratedCode {
    const bucketName = this.extractStorageAccountName(prompt) || 'my-storage-bucket';
    const region = this.extractGCPRegion(prompt) || 'us-central1';
    const projectId = this.extractGCPProjectId(prompt) || 'my-project';

    const code = `# GCP Cloud Storage Bucket Configuration
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = "${projectId}"
  region  = "${region}"
}

# Cloud Storage Bucket
resource "google_storage_bucket" "${bucketName.replace(/-/g, '_')}" {
  name          = "${bucketName}-\${random_string.bucket_suffix.result}"
  location      = "${region.toUpperCase()}"
  force_destroy = true

  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "Delete"
    }
  }

  lifecycle_rule {
    condition {
      age = 7
    }
    action {
      type = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }

  labels = {
    environment = "production"
    managed_by  = "terraform"
  }
}

resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

# Bucket IAM - Private by default
resource "google_storage_bucket_iam_binding" "bucket_admin" {
  bucket = google_storage_bucket.${bucketName.replace(/-/g, '_')}.name
  role   = "roles/storage.admin"
  
  members = [
    "serviceAccount:\${data.google_compute_default_service_account.default.email}",
  ]
}

data "google_compute_default_service_account" "default" {}

# Outputs
output "bucket_name" {
  description = "Name of the storage bucket"
  value       = google_storage_bucket.${bucketName.replace(/-/g, '_')}.name
}

output "bucket_url" {
  description = "URL of the storage bucket"
  value       = google_storage_bucket.${bucketName.replace(/-/g, '_')}.url
}

output "bucket_self_link" {
  description = "Self link of the storage bucket"
  value       = google_storage_bucket.${bucketName.replace(/-/g, '_')}.self_link
}`;

    return {
      code,
      codeType: 'terraform',
      resources: ['google_storage_bucket', 'google_storage_bucket_iam_binding'],
      description: `GCP Cloud Storage bucket deployment for ${bucketName}`
    };
  }

  private generateGCPNetworkTerraform(prompt: string): GeneratedCode {
    const vpcName = this.extractVnetName(prompt) || 'main-vpc';
    const region = this.extractGCPRegion(prompt) || 'us-central1';
    const projectId = this.extractGCPProjectId(prompt) || 'my-project';

    const code = `# GCP VPC Network Configuration
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = "${projectId}"
  region  = "${region}"
}

# Enable Compute Engine API
resource "google_project_service" "compute_api" {
  service = "compute.googleapis.com"
}

# VPC Network
resource "google_compute_network" "${vpcName.replace(/-/g, '_')}" {
  name                    = "${vpcName}"
  auto_create_subnetworks = false
  mtu                     = 1460

  depends_on = [google_project_service.compute_api]
}

# Public Subnet
resource "google_compute_subnetwork" "public" {
  name          = "${vpcName}-public-subnet"
  ip_cidr_range = "10.0.1.0/24"
  region        = "${region}"
  network       = google_compute_network.${vpcName.replace(/-/g, '_')}.id
  
  secondary_ip_range {
    range_name    = "services-range"
    ip_cidr_range = "192.168.1.0/24"
  }

  secondary_ip_range {
    range_name    = "pod-ranges"
    ip_cidr_range = "192.168.64.0/22"
  }
}

# Private Subnet
resource "google_compute_subnetwork" "private" {
  name          = "${vpcName}-private-subnet"
  ip_cidr_range = "10.0.2.0/24"
  region        = "${region}"
  network       = google_compute_network.${vpcName.replace(/-/g, '_')}.id
  
  private_ip_google_access = true
}

# Firewall Rules
resource "google_compute_firewall" "allow_http" {
  name    = "${vpcName}-allow-http"
  network = google_compute_network.${vpcName.replace(/-/g, '_')}.name

  allow {
    protocol = "tcp"
    ports    = ["80"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["http-server"]
}

resource "google_compute_firewall" "allow_https" {
  name    = "${vpcName}-allow-https"
  network = google_compute_network.${vpcName.replace(/-/g, '_')}.name

  allow {
    protocol = "tcp"
    ports    = ["443"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["https-server"]
}

resource "google_compute_firewall" "allow_ssh" {
  name    = "${vpcName}-allow-ssh"
  network = google_compute_network.${vpcName.replace(/-/g, '_')}.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["ssh-server"]
}

# Cloud Router for NAT
resource "google_compute_router" "router" {
  name    = "${vpcName}-router"
  region  = "${region}"
  network = google_compute_network.${vpcName.replace(/-/g, '_')}.id
}

# Cloud NAT
resource "google_compute_router_nat" "nat" {
  name                               = "${vpcName}-nat"
  router                             = google_compute_router.router.name
  region                             = google_compute_router.router.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}

# Outputs
output "network_name" {
  description = "Name of the VPC network"
  value       = google_compute_network.${vpcName.replace(/-/g, '_')}.name
}

output "network_self_link" {
  description = "Self link of the VPC network"
  value       = google_compute_network.${vpcName.replace(/-/g, '_')}.self_link
}

output "public_subnet_name" {
  description = "Name of the public subnet"
  value       = google_compute_subnetwork.public.name
}

output "private_subnet_name" {
  description = "Name of the private subnet"
  value       = google_compute_subnetwork.private.name
}`;

    return {
      code,
      codeType: 'terraform',
      resources: ['google_compute_network', 'google_compute_subnetwork', 'google_compute_firewall', 'google_compute_router'],
      description: `GCP VPC network deployment for ${vpcName}`
    };
  }

  private generateGCPKubernetesTerraform(prompt: string): GeneratedCode {
    const clusterName = this.extractClusterName(prompt) || 'gke-cluster';
    const region = this.extractGCPRegion(prompt) || 'us-central1';
    const projectId = this.extractGCPProjectId(prompt) || 'my-project';
    const nodeCount = this.extractNodeCount(prompt) || 2;

    const code = `# GCP GKE Cluster Configuration
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = "${projectId}"
  region  = "${region}"
}

# Enable required APIs
resource "google_project_service" "container_api" {
  service = "container.googleapis.com"
}

# VPC for GKE
resource "google_compute_network" "gke_vpc" {
  name                    = "${clusterName}-vpc"
  auto_create_subnetworks = false

  depends_on = [google_project_service.container_api]
}

# Subnet for GKE
resource "google_compute_subnetwork" "gke_subnet" {
  name          = "${clusterName}-subnet"
  ip_cidr_range = "10.0.0.0/24"
  region        = "${region}"
  network       = google_compute_network.gke_vpc.name
  
  secondary_ip_range {
    range_name    = "services-range"
    ip_cidr_range = "192.168.1.0/24"
  }

  secondary_ip_range {
    range_name    = "pod-ranges"
    ip_cidr_range = "192.168.64.0/22"
  }
}

# GKE Cluster
resource "google_container_cluster" "${clusterName.replace(/-/g, '_')}" {
  name     = "${clusterName}"
  location = "${region}"
  
  # We can't create a cluster with no node pool defined, but we want to only use
  # separately managed node pools. So we create the smallest possible default
  # node pool and immediately delete it.
  remove_default_node_pool = true
  initial_node_count       = 1

  network    = google_compute_network.gke_vpc.name
  subnetwork = google_compute_subnetwork.gke_subnet.name

  # Enable IP aliasing
  ip_allocation_policy {
    cluster_secondary_range_name  = "pod-ranges"
    services_secondary_range_name = "services-range"
  }

  # Enable network policy
  network_policy {
    enabled = true
  }

  # Enable Workload Identity
  workload_identity_config {
    workload_pool = "${projectId}.svc.id.goog"
  }

  # Enable shielded nodes
  enable_shielded_nodes = true

  # Master authorized networks
  master_authorized_networks_config {
    cidr_blocks {
      cidr_block   = "0.0.0.0/0"
      display_name = "All networks"
    }
  }

  # Private cluster config
  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
    master_ipv4_cidr_block  = "172.16.0.0/28"
  }

  depends_on = [google_project_service.container_api]
}

# GKE Node Pool
resource "google_container_node_pool" "${clusterName.replace(/-/g, '_')}_nodes" {
  name       = "${clusterName}-node-pool"
  location   = "${region}"
  cluster    = google_container_cluster.${clusterName.replace(/-/g, '_')}.name
  node_count = ${nodeCount}

  node_config {
    preemptible  = false
    machine_type = "e2-medium"

    # Google recommends custom service accounts that have cloud-platform scope and permissions granted via IAM Roles.
    service_account = google_service_account.gke_service_account.email
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]

    labels = {
      env = "production"
    }

    tags = ["gke-node", "${clusterName}-node"]

    metadata = {
      disable-legacy-endpoints = "true"
    }

    # Enable shielded VM features
    shielded_instance_config {
      enable_secure_boot          = true
      enable_integrity_monitoring = true
    }
  }

  # Enable auto-upgrade and auto-repair
  management {
    auto_repair  = true
    auto_upgrade = true
  }

  # Enable autoscaling
  autoscaling {
    min_node_count = 1
    max_node_count = ${nodeCount + 3}
  }
}

# Service Account for GKE nodes
resource "google_service_account" "gke_service_account" {
  account_id   = "${clusterName}-gke-sa"
  display_name = "GKE Service Account for ${clusterName}"
}

resource "google_project_iam_member" "gke_service_account_roles" {
  for_each = toset([
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter",
    "roles/monitoring.viewer",
    "roles/stackdriver.resourceMetadata.writer"
  ])
  
  project = "${projectId}"
  role    = each.value
  member  = "serviceAccount:\${google_service_account.gke_service_account.email}"
}

# Outputs
output "cluster_name" {
  description = "Name of the GKE cluster"
  value       = google_container_cluster.${clusterName.replace(/-/g, '_')}.name
}

output "cluster_endpoint" {
  description = "Endpoint for GKE control plane"
  value       = google_container_cluster.${clusterName.replace(/-/g, '_')}.endpoint
  sensitive   = true
}

output "cluster_ca_certificate" {
  description = "Cluster CA certificate (base64 encoded)"
  value       = google_container_cluster.${clusterName.replace(/-/g, '_')}.master_auth.0.cluster_ca_certificate
  sensitive   = true
}`;

    return {
      code,
      codeType: 'terraform',
      resources: ['google_container_cluster', 'google_container_node_pool', 'google_service_account'],
      description: `GCP GKE cluster deployment for ${clusterName}`
    };
  }

  private generateGCPCustomTerraform(prompt: string): GeneratedCode {
    const region = this.extractGCPRegion(prompt) || 'us-central1';
    const projectId = this.extractGCPProjectId(prompt) || 'my-project';

    return {
      code: `# Custom GCP Infrastructure Configuration
# Generated based on: "${prompt}"

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = "${projectId}"
  region  = "${region}"
}

# VPC Network
resource "google_compute_network" "main" {
  name                    = "custom-vpc"
  auto_create_subnetworks = false
}

# Subnet
resource "google_compute_subnetwork" "main" {
  name          = "custom-subnet"
  ip_cidr_range = "10.0.1.0/24"
  region        = "${region}"
  network       = google_compute_network.main.id
}

# Add your custom GCP resources here based on requirements`,
      codeType: 'terraform',
      resources: ['google_compute_network', 'google_compute_subnetwork'],
      description: 'Custom GCP infrastructure template'
    };
  }

  // Helper methods to extract information from prompts
  private extractAWSRegion(prompt: string): string | null {
    const regions = {
      'us-east-1': 'us-east-1',
      'us-west-1': 'us-west-1', 
      'us-west-2': 'us-west-2',
      'eu-west-1': 'eu-west-1',
      'eu-central-1': 'eu-central-1',
      'ap-southeast-1': 'ap-southeast-1'
    };
    
    for (const [key, value] of Object.entries(regions)) {
      if (prompt.toLowerCase().includes(key)) {
        return value;
      }
    }
    return null;
  }

  private extractAWSInstanceClass(prompt: string): string | null {
    if (prompt.toLowerCase().includes('micro')) return 'db.t3.micro';
    if (prompt.toLowerCase().includes('small')) return 'db.t3.small';
    if (prompt.toLowerCase().includes('medium')) return 'db.t3.medium';
    if (prompt.toLowerCase().includes('large')) return 'db.t3.large';
    return null;
  }

  private extractGCPRegion(prompt: string): string | null {
    const regions = {
      'us-central1': 'us-central1',
      'us-east1': 'us-east1',
      'us-west1': 'us-west1',
      'europe-west1': 'europe-west1',
      'asia-southeast1': 'asia-southeast1'
    };
    
    for (const [key, value] of Object.entries(regions)) {
      if (prompt.toLowerCase().includes(key)) {
        return value;
      }
    }
    return null;
  }

  private extractGCPProjectId(prompt: string): string | null {
    const match = prompt.match(/project[:\s]+([a-zA-Z0-9-]+)/i);
    return match ? match[1] : null;
  }

  private extractGCPTier(prompt: string): string | null {
    if (prompt.toLowerCase().includes('micro')) return 'db-f1-micro';
    if (prompt.toLowerCase().includes('small')) return 'db-g1-small';
    if (prompt.toLowerCase().includes('standard')) return 'db-n1-standard-1';
    if (prompt.toLowerCase().includes('high-mem')) return 'db-n1-highmem-2';
    return null;
  }

  private generateAWSContainerPulumi(prompt: string): GeneratedCode {
    const containerName = this.extractContainerName(prompt) || 'my-container';
    const imageName = this.extractImageName(prompt) || 'nginx:latest';
    const region = this.extractAWSRegion(prompt) || 'us-east-1';
    const ports = this.extractPorts(prompt) || [80];
    const cpu = this.extractCpu(prompt) || 256;
    const memory = this.extractMemory(prompt) || 512;

    const code = `import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// VPC and Networking
const vpc = new aws.ec2.Vpc("${containerName}-vpc", {
    cidrBlock: "10.0.0.0/16",
    enableDnsHostnames: true,
    enableDnsSupport: true,
    tags: {
        Name: "${containerName}-vpc",
        Environment: "Production",
        ManagedBy: "Pulumi",
    },
});

const internetGateway = new aws.ec2.InternetGateway("${containerName}-igw", {
    vpcId: vpc.id,
    tags: {
        Name: "${containerName}-igw",
    },
});

const publicSubnet = new aws.ec2.Subnet("${containerName}-public-subnet", {
    vpcId: vpc.id,
    cidrBlock: "10.0.1.0/24",
    availabilityZone: "${region}a",
    mapPublicIpOnLaunch: true,
    tags: {
        Name: "${containerName}-public-subnet",
    },
});

const routeTable = new aws.ec2.RouteTable("${containerName}-rt", {
    vpcId: vpc.id,
    routes: [
        {
            cidrBlock: "0.0.0.0/0",
            gatewayId: internetGateway.id,
        },
    ],
    tags: {
        Name: "${containerName}-rt",
    },
});

const routeTableAssociation = new aws.ec2.RouteTableAssociation("${containerName}-rta", {
    subnetId: publicSubnet.id,
    routeTableId: routeTable.id,
});

// Security Group
const securityGroup = new aws.ec2.SecurityGroup("${containerName}-sg", {
    vpcId: vpc.id,
    description: "Security group for ${containerName} ECS tasks",
    ingress: [${ports.map(port => `
        {
            protocol: "tcp",
            fromPort: ${port},
            toPort: ${port},
            cidrBlocks: ["0.0.0.0/0"],
        }`).join(',')}
    ],
    egress: [
        {
            protocol: "-1",
            fromPort: 0,
            toPort: 0,
            cidrBlocks: ["0.0.0.0/0"],
        },
    ],
    tags: {
        Name: "${containerName}-sg",
    },
});

// ECS Cluster
const cluster = new aws.ecs.Cluster("${containerName}-cluster", {
    name: "${containerName}-cluster",
    settings: [
        {
            name: "containerInsights",
            value: "enabled",
        },
    ],
    tags: {
        Name: "${containerName}-cluster",
        Environment: "Production",
    },
});

// IAM Role for ECS Task Execution
const taskExecutionRole = new aws.iam.Role("${containerName}-execution-role", {
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
            {
                Action: "sts:AssumeRole",
                Effect: "Allow",
                Principal: {
                    Service: "ecs-tasks.amazonaws.com",
                },
            },
        ],
    }),
});

const taskExecutionRolePolicyAttachment = new aws.iam.RolePolicyAttachment("${containerName}-execution-role-policy", {
    role: taskExecutionRole.name,
    policyArn: "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
});

// CloudWatch Log Group
const logGroup = new aws.cloudwatch.LogGroup("${containerName}-logs", {
    name: "/ecs/${containerName}",
    retentionInDays: 30,
    tags: {
        Name: "${containerName}-logs",
    },
});

// ECS Task Definition
const taskDefinition = new aws.ecs.TaskDefinition("${containerName}-task", {
    family: "${containerName}",
    networkMode: "awsvpc",
    requiresCompatibilities: ["FARGATE"],
    cpu: "${cpu}",
    memory: "${memory}",
    executionRoleArn: taskExecutionRole.arn,
    containerDefinitions: JSON.stringify([
        {
            name: "${containerName}",
            image: "${imageName}",
            essential: true,
            portMappings: [${ports.map(port => `
                {
                    protocol: "tcp",
                    containerPort: ${port},
                    hostPort: ${port},
                }`).join(',')}
            ],
            logConfiguration: {
                logDriver: "awslogs",
                options: {
                    "awslogs-group": logGroup.name,
                    "awslogs-region": "${region}",
                    "awslogs-stream-prefix": "ecs",
                },
            },
        },
    ]),
    tags: {
        Name: "${containerName}-task",
    },
});

// ECS Service
const service = new aws.ecs.Service("${containerName}-service", {
    name: "${containerName}-service",
    cluster: cluster.id,
    taskDefinition: taskDefinition.arn,
    desiredCount: 1,
    launchType: "FARGATE",
    networkConfiguration: {
        securityGroups: [securityGroup.id],
        subnets: [publicSubnet.id],
        assignPublicIp: true,
    },
    tags: {
        Name: "${containerName}-service",
    },
}, { dependsOn: [taskExecutionRolePolicyAttachment] });

// Export outputs
export const clusterName = cluster.name;
export const serviceName = service.name;
export const vpcId = vpc.id;
export const taskDefinitionArn = taskDefinition.arn;`;

    return {
      code,
      codeType: 'pulumi',
      resources: ['aws.ec2.Vpc', 'aws.ecs.Cluster', 'aws.ecs.Service', 'aws.ecs.TaskDefinition'],
      description: `AWS ECS Fargate deployment for ${containerName} with ${imageName}`
    };
  }

  private generateAWSDatabasePulumi(prompt: string): GeneratedCode {
    const dbName = this.extractDatabaseName(prompt) || 'mydb';
    const region = this.extractAWSRegion(prompt) || 'us-east-1';
    const instanceClass = this.extractAWSInstanceClass(prompt) || 'db.t3.micro';

    const code = `import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// VPC for RDS
const vpc = new aws.ec2.Vpc("${dbName}-vpc", {
    cidrBlock: "10.0.0.0/16",
    enableDnsHostnames: true,
    enableDnsSupport: true,
    tags: {
        Name: "${dbName}-vpc",
    },
});

// Private Subnets
const privateSubnet1 = new aws.ec2.Subnet("${dbName}-private-subnet-1", {
    vpcId: vpc.id,
    cidrBlock: "10.0.1.0/24",
    availabilityZone: "${region}a",
    tags: {
        Name: "${dbName}-private-subnet-1",
    },
});

const privateSubnet2 = new aws.ec2.Subnet("${dbName}-private-subnet-2", {
    vpcId: vpc.id,
    cidrBlock: "10.0.2.0/24",
    availabilityZone: "${region}b",
    tags: {
        Name: "${dbName}-private-subnet-2",
    },
});

// DB Subnet Group
const dbSubnetGroup = new aws.rds.SubnetGroup("${dbName}-subnet-group", {
    name: "${dbName}-subnet-group",
    subnetIds: [privateSubnet1.id, privateSubnet2.id],
    tags: {
        Name: "${dbName} DB subnet group",
    },
});

const rdsSecurityGroup = new aws.ec2.SecurityGroup("${dbName}-rds-sg", {
    vpcId: vpc.id,
    description: "Security group for ${dbName} RDS instance",
    ingress: [
        {
            fromPort: 5432,
            toPort: 5432,
            protocol: "tcp",
            cidrBlocks: [vpc.cidrBlock],
        },
    ],
    egress: [
        {
            fromPort: 0,
            toPort: 0,
            protocol: "-1",
            cidrBlocks: ["0.0.0.0/0"],
        },
    ],
    tags: {
        Name: "${dbName}-rds-sg",
    },
});

// RDS Instance
const rdsInstance = new aws.rds.Instance("${dbName}", {
    identifier: "${dbName}",
    engine: "postgres",
    engineVersion: "14.9",
    instanceClass: "${instanceClass}",
    allocatedStorage: 20,
    maxAllocatedStorage: 100,
    storageType: "gp2",
    storageEncrypted: true,
    dbName: "${dbName}",
    username: "postgres",
    password: "changeme123!",
    vpcSecurityGroupIds: [rdsSecurityGroup.id],
    dbSubnetGroupName: dbSubnetGroup.name,
    backupRetentionPeriod: 7,
    backupWindow: "07:00-09:00",
    maintenanceWindow: "Sun:09:00-Sun:11:00",
    skipFinalSnapshot: true,
    deletionProtection: false,
    tags: {
        Name: "${dbName}",
        Environment: "Production",
        ManagedBy: "Pulumi",
    },
});

// Export outputs
export const rdsHostname = rdsInstance.address;
export const rdsPort = rdsInstance.port;
export const rdsUsername = rdsInstance.username;
export const connectionString = pulumi.interpolate\`postgresql://\${rdsInstance.username}:changeme123!@\${rdsInstance.address}:\${rdsInstance.port}/${dbName}\`;`;

    return {
      code,
      codeType: 'pulumi',
      resources: ['aws.ec2.Vpc', 'aws.rds.Instance', 'aws.rds.SubnetGroup', 'aws.ec2.SecurityGroup'],
      description: `AWS RDS PostgreSQL database deployment for ${dbName}`
    };
  }

  private generateAWSStoragePulumi(prompt: string): GeneratedCode {
    const bucketName = this.extractStorageAccountName(prompt) || 'my-storage-bucket';
    const region = this.extractAWSRegion(prompt) || 'us-east-1';

    const code = `import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const bucketSuffix = new pulumi.random.RandomString("bucket-suffix", {
    length: 8,
    special: false,
    upper: false,
});

// S3 Bucket
const bucket = new aws.s3.Bucket("${bucketName}", {
    bucket: pulumi.interpolate\`${bucketName}-\${bucketSuffix.result}\`,
    tags: {
        Name: "${bucketName}",
        Environment: "Production",
        ManagedBy: "Pulumi",
    },
});

// S3 Bucket Versioning
const bucketVersioning = new aws.s3.BucketVersioning("${bucketName}-versioning", {
    bucket: bucket.id,
    versioningConfiguration: {
        status: "Enabled",
    },
});

// S3 Bucket Server Side Encryption
const bucketEncryption = new aws.s3.BucketServerSideEncryptionConfiguration("${bucketName}-encryption", {
    bucket: bucket.id,
    rules: [
        {
            applyServerSideEncryptionByDefault: {
                sseAlgorithm: "AES256",
            },
        },
    ],
});

// S3 Bucket Public Access Block
const bucketPublicAccessBlock = new aws.s3.BucketPublicAccessBlock("${bucketName}-pab", {
    bucket: bucket.id,
    blockPublicAcls: true,
    blockPublicPolicy: true,
    ignorePublicAcls: true,
    restrictPublicBuckets: true,
});

// S3 Bucket Policy
const bucketPolicy = new aws.s3.BucketPolicy("${bucketName}-policy", {
    bucket: bucket.id,
    policy: pulumi.all([bucket.arn]).apply(([bucketArn]) => JSON.stringify({
        Version: "2012-10-17",
        Statement: [
            {
                Sid: "DenyInsecureConnections",
                Effect: "Deny",
                Principal: "*",
                Action: "s3:*",
                Resource: [
                    bucketArn,
                    \`\${bucketArn}/*\`,
                ],
                Condition: {
                    Bool: {
                        "aws:SecureTransport": "false",
                    },
                },
            },
        ],
    })),
});

// Export outputs
export const bucketName = bucket.bucket;
export const bucketArn = bucket.arn;
export const bucketDomainName = bucket.bucketDomainName;`;

    return {
      code,
      codeType: 'pulumi',
      resources: ['aws.s3.Bucket', 'aws.s3.BucketVersioning', 'aws.s3.BucketServerSideEncryptionConfiguration'],
      description: `AWS S3 bucket deployment for ${bucketName}`
    };
  }

  private generateAWSNetworkPulumi(prompt: string): GeneratedCode {
    const vpcName = this.extractVnetName(prompt) || 'main-vpc';
    const region = this.extractAWSRegion(prompt) || 'us-east-1';

    const code = `import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const vpc = new aws.ec2.Vpc("${vpcName}", {
    cidrBlock: "10.0.0.0/16",
    enableDnsHostnames: true,
    enableDnsSupport: true,
    tags: {
        Name: "${vpcName}",
        Environment: "Production",
        ManagedBy: "Pulumi",
    },
});

// Internet Gateway
const internetGateway = new aws.ec2.InternetGateway("${vpcName}-igw", {
    vpcId: vpc.id,
    tags: {
        Name: "${vpcName}-igw",
    },
});

// Public Subnets
const publicSubnet1 = new aws.ec2.Subnet("${vpcName}-public-subnet-1", {
    vpcId: vpc.id,
    cidrBlock: "10.0.1.0/24",
    availabilityZone: "${region}a",
    mapPublicIpOnLaunch: true,
    tags: {
        Name: "${vpcName}-public-subnet-1",
        Type: "Public",
    },
});

const publicSubnet2 = new aws.ec2.Subnet("${vpcName}-public-subnet-2", {
    vpcId: vpc.id,
    cidrBlock: "10.0.2.0/24",
    availabilityZone: "${region}b",
    mapPublicIpOnLaunch: true,
    tags: {
        Name: "${vpcName}-public-subnet-2",
        Type: "Public",
    },
});

// Private Subnets
const privateSubnet1 = new aws.ec2.Subnet("${vpcName}-private-subnet-1", {
    vpcId: vpc.id,
    cidrBlock: "10.0.10.0/24",
    availabilityZone: "${region}a",
    tags: {
        Name: "${vpcName}-private-subnet-1",
        Type: "Private",
    },
});

const privateSubnet2 = new aws.ec2.Subnet("${vpcName}-private-subnet-2", {
    vpcId: vpc.id,
    cidrBlock: "10.0.11.0/24",
    availabilityZone: "${region}b",
    tags: {
        Name: "${vpcName}-private-subnet-2",
        Type: "Private",
    },
});

const natEip1 = new aws.ec2.Eip("${vpcName}-nat-eip-1", {
    domain: "vpc",
    tags: {
        Name: "${vpcName}-nat-eip-1",
    },
}, { dependsOn: [internetGateway] });

const natEip2 = new aws.ec2.Eip("${vpcName}-nat-eip-2", {
    domain: "vpc",
    tags: {
        Name: "${vpcName}-nat-eip-2",
    },
}, { dependsOn: [internetGateway] });

const natGateway1 = new aws.ec2.NatGateway("${vpcName}-nat-gateway-1", {
    allocationId: natEip1.id,
    subnetId: publicSubnet1.id,
    tags: {
        Name: "${vpcName}-nat-gateway-1",
    },
}, { dependsOn: [internetGateway] });

const natGateway2 = new aws.ec2.NatGateway("${vpcName}-nat-gateway-2", {
    allocationId: natEip2.id,
    subnetId: publicSubnet2.id,
    tags: {
        Name: "${vpcName}-nat-gateway-2",
    },
}, { dependsOn: [internetGateway] });

// Route Tables
const publicRouteTable = new aws.ec2.RouteTable("${vpcName}-public-rt", {
    vpcId: vpc.id,
    routes: [
        {
            cidrBlock: "0.0.0.0/0",
            gatewayId: internetGateway.id,
        },
    ],
    tags: {
        Name: "${vpcName}-public-rt",
    },
});

const privateRouteTable1 = new aws.ec2.RouteTable("${vpcName}-private-rt-1", {
    vpcId: vpc.id,
    routes: [
        {
            cidrBlock: "0.0.0.0/0",
            natGatewayId: natGateway1.id,
        },
    ],
    tags: {
        Name: "${vpcName}-private-rt-1",
    },
});

const privateRouteTable2 = new aws.ec2.RouteTable("${vpcName}-private-rt-2", {
    vpcId: vpc.id,
    routes: [
        {
            cidrBlock: "0.0.0.0/0",
            natGatewayId: natGateway2.id,
        },
    ],
    tags: {
        Name: "${vpcName}-private-rt-2",
    },
});

// Route Table Associations
const publicRtAssociation1 = new aws.ec2.RouteTableAssociation("${vpcName}-public-rta-1", {
    subnetId: publicSubnet1.id,
    routeTableId: publicRouteTable.id,
});

const publicRtAssociation2 = new aws.ec2.RouteTableAssociation("${vpcName}-public-rta-2", {
    subnetId: publicSubnet2.id,
    routeTableId: publicRouteTable.id,
});

const privateRtAssociation1 = new aws.ec2.RouteTableAssociation("${vpcName}-private-rta-1", {
    subnetId: privateSubnet1.id,
    routeTableId: privateRouteTable1.id,
});

const privateRtAssociation2 = new aws.ec2.RouteTableAssociation("${vpcName}-private-rta-2", {
    subnetId: privateSubnet2.id,
    routeTableId: privateRouteTable2.id,
});

// Security Group
const webSecurityGroup = new aws.ec2.SecurityGroup("${vpcName}-web-sg", {
    vpcId: vpc.id,
    description: "Security group for web servers",
    ingress: [
        {
            description: "HTTP",
            fromPort: 80,
            toPort: 80,
            protocol: "tcp",
            cidrBlocks: ["0.0.0.0/0"],
        },
        {
            description: "HTTPS",
            fromPort: 443,
            toPort: 443,
            protocol: "tcp",
            cidrBlocks: ["0.0.0.0/0"],
        },
    ],
    egress: [
        {
            fromPort: 0,
            toPort: 0,
            protocol: "-1",
            cidrBlocks: ["0.0.0.0/0"],
        },
    ],
    tags: {
        Name: "${vpcName}-web-sg",
    },
});

// Export outputs
export const vpcId = vpc.id;
export const publicSubnetIds = [publicSubnet1.id, publicSubnet2.id];
export const privateSubnetIds = [privateSubnet1.id, privateSubnet2.id];
export const internetGatewayId = internetGateway.id;`;

    return {
      code,
      codeType: 'pulumi',
      resources: ['aws.ec2.Vpc', 'aws.ec2.Subnet', 'aws.ec2.InternetGateway', 'aws.ec2.NatGateway', 'aws.ec2.RouteTable'],
      description: `AWS VPC deployment for ${vpcName}`
    };
  }

  private generateAWSKubernetesPulumi(prompt: string): GeneratedCode {
    const clusterName = this.extractClusterName(prompt) || 'eks-cluster';
    const region = this.extractAWSRegion(prompt) || 'us-east-1';
    const nodeCount = this.extractNodeCount(prompt) || 2;

    const code = `import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// VPC for EKS
const vpc = new aws.ec2.Vpc("${clusterName}-vpc", {
    cidrBlock: "10.0.0.0/16",
    enableDnsHostnames: true,
    enableDnsSupport: true,
    tags: {
        Name: "${clusterName}-vpc",
        [\`kubernetes.io/cluster/${clusterName}\`]: "shared",
    },
});

const subnet1 = new aws.ec2.Subnet("${clusterName}-subnet-1", {
    vpcId: vpc.id,
    cidrBlock: "10.0.1.0/24",
    availabilityZone: "${region}a",
    mapPublicIpOnLaunch: true,
    tags: {
        Name: "${clusterName}-subnet-1",
        [\`kubernetes.io/cluster/${clusterName}\`]: "shared",
    },
});

const subnet2 = new aws.ec2.Subnet("${clusterName}-subnet-2", {
    vpcId: vpc.id,
    cidrBlock: "10.0.2.0/24",
    availabilityZone: "${region}b",
    mapPublicIpOnLaunch: true,
    tags: {
        Name: "${clusterName}-subnet-2",
        [\`kubernetes.io/cluster/${clusterName}\`]: "shared",
    },
});

// Internet Gateway
const internetGateway = new aws.ec2.InternetGateway("${clusterName}-igw", {
    vpcId: vpc.id,
    tags: {
        Name: "${clusterName}-igw",
    },
});

// Route Table
const routeTable = new aws.ec2.RouteTable("${clusterName}-rt", {
    vpcId: vpc.id,
    routes: [
        {
            cidrBlock: "0.0.0.0/0",
            gatewayId: internetGateway.id,
        },
    ],
    tags: {
        Name: "${clusterName}-rt",
    },
});

const routeTableAssociation1 = new aws.ec2.RouteTableAssociation("${clusterName}-rta-1", {
    subnetId: subnet1.id,
    routeTableId: routeTable.id,
});

const routeTableAssociation2 = new aws.ec2.RouteTableAssociation("${clusterName}-rta-2", {
    subnetId: subnet2.id,
    routeTableId: routeTable.id,
});

// EKS Cluster IAM Role
const eksClusterRole = new aws.iam.Role("${clusterName}-cluster-role", {
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
            {
                Action: "sts:AssumeRole",
                Effect: "Allow",
                Principal: {
                    Service: "eks.amazonaws.com",
                },
            },
        ],
    }),
});

const eksClusterPolicyAttachment = new aws.iam.RolePolicyAttachment("${clusterName}-cluster-policy", {
    policyArn: "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy",
    role: eksClusterRole.name,
});

// EKS Node Group IAM Role
const eksNodeGroupRole = new aws.iam.Role("${clusterName}-node-group-role", {
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
            {
                Action: "sts:AssumeRole",
                Effect: "Allow",
                Principal: {
                    Service: "ec2.amazonaws.com",
                },
            },
        ],
    }),
});

const eksWorkerNodePolicyAttachment = new aws.iam.RolePolicyAttachment("${clusterName}-worker-node-policy", {
    policyArn: "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
    role: eksNodeGroupRole.name,
});

const eksCniPolicyAttachment = new aws.iam.RolePolicyAttachment("${clusterName}-cni-policy", {
    policyArn: "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
    role: eksNodeGroupRole.name,
});

const eksContainerRegistryPolicyAttachment = new aws.iam.RolePolicyAttachment("${clusterName}-container-registry-policy", {
    policyArn: "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
    role: eksNodeGroupRole.name,
});

// EKS Cluster
const eksCluster = new aws.eks.Cluster("${clusterName}", {
    name: "${clusterName}",
    roleArn: eksClusterRole.arn,
    version: "1.27",
    vpcConfig: {
        subnetIds: [subnet1.id, subnet2.id],
    },
    tags: {
        Name: "${clusterName}",
        Environment: "Production",
        ManagedBy: "Pulumi",
    },
}, { dependsOn: [eksClusterPolicyAttachment] });

// EKS Node Group
const eksNodeGroup = new aws.eks.NodeGroup("${clusterName}-nodes", {
    clusterName: eksCluster.name,
    nodeGroupName: "${clusterName}-nodes",
    nodeRoleArn: eksNodeGroupRole.arn,
    subnetIds: [subnet1.id, subnet2.id],
    scalingConfig: {
        desiredSize: ${nodeCount},
        maxSize: ${nodeCount + 2},
        minSize: 1,
    },
    updateConfig: {
        maxUnavailable: 1,
    },
    instanceTypes: ["t3.medium"],
    tags: {
        Name: "${clusterName}-nodes",
    },
}, {
    dependsOn: [
        eksWorkerNodePolicyAttachment,
        eksCniPolicyAttachment,
        eksContainerRegistryPolicyAttachment,
    ],
});

// Export outputs
export const clusterName = eksCluster.name;
export const clusterEndpoint = eksCluster.endpoint;
export const clusterSecurityGroupId = eksCluster.vpcConfig.clusterSecurityGroupId;
export const clusterArn = eksCluster.arn;`;

    return {
      code,
      codeType: 'pulumi',
      resources: ['aws.ec2.Vpc', 'aws.eks.Cluster', 'aws.eks.NodeGroup', 'aws.iam.Role'],
      description: `AWS EKS cluster deployment for ${clusterName}`
    };
  }

  private generateAWSCustomPulumi(prompt: string): GeneratedCode {
    const region = this.extractAWSRegion(prompt) || 'us-east-1';

    return {
      code: `import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Custom AWS Infrastructure Configuration
// Generated based on: "${prompt}"

const vpc = new aws.ec2.Vpc("custom-vpc", {
    cidrBlock: "10.0.0.0/16",
    enableDnsHostnames: true,
    enableDnsSupport: true,
    tags: {
        Name: "custom-vpc",
        Environment: "Production",
        ManagedBy: "Pulumi",
        Purpose: "Custom Infrastructure",
    },
});

// Add your custom AWS resources here based on requirements

// Export outputs
export const vpcId = vpc.id;`,
      codeType: 'pulumi',
      resources: ['aws.ec2.Vpc'],
      description: 'Custom AWS infrastructure template'
    };
  }

  private generateGCPContainerPulumi(prompt: string): GeneratedCode {
    const containerName = this.extractContainerName(prompt) || 'my-container';
    const imageName = this.extractImageName(prompt) || 'nginx:latest';
    const region = this.extractGCPRegion(prompt) || 'us-central1';
    const projectId = this.extractGCPProjectId(prompt) || 'my-project';
    const ports = this.extractPorts(prompt) || [80];

    const code = `import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

// Enable required APIs
const cloudRunApi = new gcp.projects.Service("cloud-run-api", {
    service: "run.googleapis.com",
});

const containerRegistryApi = new gcp.projects.Service("container-registry-api", {
    service: "containerregistry.googleapis.com",
});

// Cloud Run Service
const cloudRunService = new gcp.cloudrun.Service("${containerName}", {
    name: "${containerName}",
    location: "${region}",
    template: {
        spec: {
            containers: [
                {
                    image: "${imageName}",
                    ports: [${ports.map(port => `
                        {
                            containerPort: ${port},
                        }`).join(',')}
                    ],
                    resources: {
                        limits: {
                            cpu: "1000m",
                            memory: "512Mi",
                        },
                    },
                    envs: [
                        {
                            name: "PORT",
                            value: "${ports[0]}",
                        },
                    ],
                },
            ],
            containerConcurrency: 80,
            timeoutSeconds: 300,
        },
        metadata: {
            annotations: {
                "autoscaling.knative.dev/maxScale": "100",
                "run.googleapis.com/cpu-throttling": "false",
            },
        },
    },
    traffics: [
        {
            percent: 100,
            latestRevision: true,
        },
    ],
}, { dependsOn: [cloudRunApi] });

// IAM policy to allow public access
const publicAccess = new gcp.cloudrun.IamMember("${containerName}-public", {
    service: cloudRunService.name,
    location: cloudRunService.location,
    role: "roles/run.invoker",
    member: "allUsers",
});

// Export outputs
export const serviceUrl = cloudRunService.statuses.apply(statuses => statuses[0]?.url);
export const serviceName = cloudRunService.name;`;

    return {
      code,
      codeType: 'pulumi',
      resources: ['gcp.cloudrun.Service', 'gcp.projects.Service', 'gcp.cloudrun.IamMember'],
      description: `GCP Cloud Run deployment for ${containerName} with ${imageName}`
    };
  }

  private generateGCPDatabasePulumi(prompt: string): GeneratedCode {
    const dbName = this.extractDatabaseName(prompt) || 'mydb';
    const region = this.extractGCPRegion(prompt) || 'us-central1';
    const projectId = this.extractGCPProjectId(prompt) || 'my-project';
    const tier = this.extractGCPTier(prompt) || 'db-f1-micro';

    const code = `import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

// Enable Cloud SQL API
const sqlApi = new gcp.projects.Service("sql-api", {
    service: "sqladmin.googleapis.com",
});

// Cloud SQL Instance
const sqlInstance = new gcp.sql.DatabaseInstance("${dbName}-instance", {
    name: "${dbName}-instance",
    databaseVersion: "POSTGRES_14",
    region: "${region}",
    settings: {
        tier: "${tier}",
        backupConfiguration: {
            enabled: true,
            startTime: "23:00",
            pointInTimeRecoveryEnabled: true,
            backupRetentionSettings: {
                retainedBackups: 7,
            },
        },
        ipConfiguration: {
            ipv4Enabled: true,
            authorizedNetworks: [
                {
                    value: "0.0.0.0/0",
                    name: "all",
                },
            ],
        },
        databaseFlags: [
            {
                name: "log_checkpoints",
                value: "on",
            },
        ],
    },
    deletionProtection: false,
}, { dependsOn: [sqlApi] });

const database = new gcp.sql.Database("${dbName}", {
    name: "${dbName}",
    instance: sqlInstance.name,
});

// Database User
const databaseUser = new gcp.sql.User("${dbName}-user", {
    name: "postgres",
    instance: sqlInstance.name,
    password: "changeme123!",
});

// Export outputs
export const databaseConnectionName = sqlInstance.connectionName;
export const databaseIpAddress = sqlInstance.publicIpAddress;
export const connectionString = pulumi.interpolate\`postgresql://postgres:changeme123!@\${sqlInstance.publicIpAddress}:5432/${dbName}\`;`;

    return {
      code,
      codeType: 'pulumi',
      resources: ['gcp.sql.DatabaseInstance', 'gcp.sql.Database', 'gcp.sql.User'],
      description: `GCP Cloud SQL PostgreSQL database deployment for ${dbName}`
    };
  }

  private generateGCPStoragePulumi(prompt: string): GeneratedCode {
    const bucketName = this.extractStorageAccountName(prompt) || 'my-storage-bucket';
    const region = this.extractGCPRegion(prompt) || 'us-central1';
    const projectId = this.extractGCPProjectId(prompt) || 'my-project';

    const code = `import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

const bucketSuffix = new pulumi.random.RandomString("bucket-suffix", {
    length: 8,
    special: false,
    upper: false,
});

// Cloud Storage Bucket
const bucket = new gcp.storage.Bucket("${bucketName}", {
    name: pulumi.interpolate\`${bucketName}-\${bucketSuffix.result}\`,
    location: "${region.toUpperCase()}",
    forceDestroy: true,
    uniformBucketLevelAccess: true,
    versioning: {
        enabled: true,
    },
    lifecycleRules: [
        {
            condition: {
                age: 30,
            },
            action: {
                type: "Delete",
            },
        },
        {
            condition: {
                age: 7,
            },
            action: {
                type: "SetStorageClass",
                storageClass: "NEARLINE",
            },
        },
    ],
    labels: {
        environment: "production",
        managed_by: "pulumi",
    },
});

const defaultServiceAccount = gcp.compute.getDefaultServiceAccount({});

// Bucket IAM - Private by default
const bucketAdmin = new gcp.storage.BucketIAMBinding("${bucketName}-admin", {
    bucket: bucket.name,
    role: "roles/storage.admin",
    members: [
        defaultServiceAccount.then(sa => \`serviceAccount:\${sa.email}\`),
    ],
});

// Export outputs
export const bucketName = bucket.name;
export const bucketUrl = bucket.url;
export const bucketSelfLink = bucket.selfLink;`;

    return {
      code,
      codeType: 'pulumi',
      resources: ['gcp.storage.Bucket', 'gcp.storage.BucketIAMBinding'],
      description: `GCP Cloud Storage bucket deployment for ${bucketName}`
    };
  }

  private generateGCPNetworkPulumi(prompt: string): GeneratedCode {
    const vpcName = this.extractVnetName(prompt) || 'main-vpc';
    const region = this.extractGCPRegion(prompt) || 'us-central1';
    const projectId = this.extractGCPProjectId(prompt) || 'my-project';

    const code = `import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

// Enable Compute Engine API
const computeApi = new gcp.projects.Service("compute-api", {
    service: "compute.googleapis.com",
});

// VPC Network
const network = new gcp.compute.Network("${vpcName}", {
    name: "${vpcName}",
    autoCreateSubnetworks: false,
    mtu: 1460,
}, { dependsOn: [computeApi] });

// Public Subnet
const publicSubnet = new gcp.compute.Subnetwork("${vpcName}-public-subnet", {
    name: "${vpcName}-public-subnet",
    ipCidrRange: "10.0.1.0/24",
    region: "${region}",
    network: network.id,
    secondaryIpRanges: [
        {
            rangeName: "services-range",
            ipCidrRange: "192.168.1.0/24",
        },
        {
            rangeName: "pod-ranges",
            ipCidrRange: "192.168.64.0/22",
        },
    ],
});

// Private Subnet
const privateSubnet = new gcp.compute.Subnetwork("${vpcName}-private-subnet", {
    name: "${vpcName}-private-subnet",
    ipCidrRange: "10.0.2.0/24",
    region: "${region}",
    network: network.id,
    privateIpGoogleAccess: true,
});

// Firewall Rules
const allowHttp = new gcp.compute.Firewall("${vpcName}-allow-http", {
    name: "${vpcName}-allow-http",
    network: network.name,
    allows: [
        {
            protocol: "tcp",
            ports: ["80"],
        },
    ],
    sourceRanges: ["0.0.0.0/0"],
    targetTags: ["http-server"],
});

const allowHttps = new gcp.compute.Firewall("${vpcName}-allow-https", {
    name: "${vpcName}-allow-https",
    network: network.name,
    allows: [
        {
            protocol: "tcp",
            ports: ["443"],
        },
    ],
    sourceRanges: ["0.0.0.0/0"],
    targetTags: ["https-server"],
});

const allowSsh = new gcp.compute.Firewall("${vpcName}-allow-ssh", {
    name: "${vpcName}-allow-ssh",
    network: network.name,
    allows: [
        {
            protocol: "tcp",
            ports: ["22"],
        },
    ],
    sourceRanges: ["0.0.0.0/0"],
    targetTags: ["ssh-server"],
});

// Cloud Router for NAT
const router = new gcp.compute.Router("${vpcName}-router", {
    name: "${vpcName}-router",
    region: "${region}",
    network: network.id,
});

// Cloud NAT
const nat = new gcp.compute.RouterNat("${vpcName}-nat", {
    name: "${vpcName}-nat",
    router: router.name,
    region: router.region,
    natIpAllocateOption: "AUTO_ONLY",
    sourceSubnetworkIpRangesToNat: "ALL_SUBNETWORKS_ALL_IP_RANGES",
    logConfig: {
        enable: true,
        filter: "ERRORS_ONLY",
    },
});

// Export outputs
export const networkName = network.name;
export const networkSelfLink = network.selfLink;
export const publicSubnetName = publicSubnet.name;
export const privateSubnetName = privateSubnet.name;`;

    return {
      code,
      codeType: 'pulumi',
      resources: ['gcp.compute.Network', 'gcp.compute.Subnetwork', 'gcp.compute.Firewall', 'gcp.compute.Router'],
      description: `GCP VPC network deployment for ${vpcName}`
    };
  }

  private generateGCPKubernetesPulumi(prompt: string): GeneratedCode {
    const clusterName = this.extractClusterName(prompt) || 'gke-cluster';
    const region = this.extractGCPRegion(prompt) || 'us-central1';
    const projectId = this.extractGCPProjectId(prompt) || 'my-project';
    const nodeCount = this.extractNodeCount(prompt) || 2;

    const code = `import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

// Enable required APIs
const containerApi = new gcp.projects.Service("container-api", {
    service: "container.googleapis.com",
});

// VPC for GKE
const gkeVpc = new gcp.compute.Network("${clusterName}-vpc", {
    name: "${clusterName}-vpc",
    autoCreateSubnetworks: false,
}, { dependsOn: [containerApi] });

// Subnet for GKE
const gkeSubnet = new gcp.compute.Subnetwork("${clusterName}-subnet", {
    name: "${clusterName}-subnet",
    ipCidrRange: "10.0.0.0/24",
    region: "${region}",
    network: gkeVpc.name,
    secondaryIpRanges: [
        {
            rangeName: "services-range",
            ipCidrRange: "192.168.1.0/24",
        },
        {
            rangeName: "pod-ranges",
            ipCidrRange: "192.168.64.0/22",
        },
    ],
});

// Service Account for GKE nodes
const gkeServiceAccount = new gcp.serviceaccount.Account("${clusterName}-gke-sa", {
    accountId: "${clusterName}-gke-sa",
    displayName: "GKE Service Account for ${clusterName}",
});

const gkeServiceAccountRoles = [
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter",
    "roles/monitoring.viewer",
    "roles/stackdriver.resourceMetadata.writer",
];

const gkeServiceAccountIamMembers = gkeServiceAccountRoles.map((role, index) =>
    new gcp.projects.IAMMember(\`${clusterName}-gke-sa-role-\${index}\`, {
        project: "${projectId}",
        role: role,
        member: pulumi.interpolate\`serviceAccount:\${gkeServiceAccount.email}\`,
    })
);

// GKE Cluster
const gkeCluster = new gcp.container.Cluster("${clusterName}", {
    name: "${clusterName}",
    location: "${region}",
    removeDefaultNodePool: true,
    initialNodeCount: 1,
    network: gkeVpc.name,
    subnetwork: gkeSubnet.name,
    ipAllocationPolicy: {
        clusterSecondaryRangeName: "pod-ranges",
        servicesSecondaryRangeName: "services-range",
    },
    networkPolicy: {
        enabled: true,
    },
    workloadIdentityConfig: {
        workloadPool: \`${projectId}.svc.id.goog\`,
    },
    enableShieldedNodes: true,
    masterAuthorizedNetworksConfig: {
        cidrBlocks: [
            {
                cidrBlock: "0.0.0.0/0",
                displayName: "All networks",
            },
        ],
    },
    privateClusterConfig: {
        enablePrivateNodes: true,
        enablePrivateEndpoint: false,
        masterIpv4CidrBlock: "172.16.0.0/28",
    },
}, { dependsOn: [containerApi] });

// GKE Node Pool
const gkeNodePool = new gcp.container.NodePool("${clusterName}-nodes", {
    name: "${clusterName}-node-pool",
    location: "${region}",
    cluster: gkeCluster.name,
    nodeCount: ${nodeCount},
    nodeConfig: {
        preemptible: false,
        machineType: "e2-medium",
        serviceAccount: gkeServiceAccount.email,
        oauthScopes: [
            "https://www.googleapis.com/auth/cloud-platform",
        ],
        labels: {
            env: "production",
        },
        tags: ["gke-node", \`${clusterName}-node\`],
        metadata: {
            "disable-legacy-endpoints": "true",
        },
        shieldedInstanceConfig: {
            enableSecureBoot: true,
            enableIntegrityMonitoring: true,
        },
    },
    management: {
        autoRepair: true,
        autoUpgrade: true,
    },
    autoscaling: {
        minNodeCount: 1,
        maxNodeCount: ${nodeCount + 3},
    },
});

// Export outputs
export const clusterName = gkeCluster.name;
export const clusterEndpoint = gkeCluster.endpoint;
export const clusterCaCertificate = gkeCluster.masterAuth.apply(auth => auth.clusterCaCertificate);`;

    return {
      code,
      codeType: 'pulumi',
      resources: ['gcp.container.Cluster', 'gcp.container.NodePool', 'gcp.serviceaccount.Account'],
      description: `GCP GKE cluster deployment for ${clusterName}`
    };
  }

  private generateGCPCustomPulumi(prompt: string): GeneratedCode {
    const region = this.extractGCPRegion(prompt) || 'us-central1';
    const projectId = this.extractGCPProjectId(prompt) || 'my-project';

    return {
      code: `import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

// Custom GCP Infrastructure Configuration
// Generated based on: "${prompt}"

// VPC Network
const network = new gcp.compute.Network("custom-vpc", {
    name: "custom-vpc",
    autoCreateSubnetworks: false,
});

const subnet = new gcp.compute.Subnetwork("custom-subnet", {
    name: "custom-subnet",
    ipCidrRange: "10.0.1.0/24",
    region: "${region}",
    network: network.id,
});

// Add your custom GCP resources here based on requirements

// Export outputs
export const networkName = network.name;
export const subnetName = subnet.name;`,
      codeType: 'pulumi',
      resources: ['gcp.compute.Network', 'gcp.compute.Subnetwork'],
      description: 'Custom GCP infrastructure template'
    };
  }

  private extractContainerName(prompt: string): string | null {
    const match = prompt.match(/(?:named?|called?)\s+([a-zA-Z0-9-]+)/i);
    return match ? match[1] : null;
  }

  private extractImageName(prompt: string): string | null {
    const match = prompt.match(/(?:nginx|apache|node|postgres|mysql|redis|ubuntu|alpine|python|java)/i);
    if (match) {
      const image = match[0].toLowerCase();
      switch (image) {
        case 'nginx': return 'nginx:latest';
        case 'apache': return 'httpd:latest';
        case 'node': return 'node:18-alpine';
        case 'postgres': return 'postgres:14';
        case 'mysql': return 'mysql:8.0';
        case 'redis': return 'redis:alpine';
        case 'python': return 'python:3.11';
        case 'java': return 'openjdk:17';
        default: return 'nginx:latest';
      }
    }
    return null;
  }

  private extractResourceGroup(prompt: string): string | null {
    const match = prompt.match(/(?:resource group|rg)\s+([a-zA-Z0-9-]+)/i);
    return match ? match[1] : null;
  }

  private extractLocation(prompt: string): string | null {
    const locations = {
      'east us': 'East US',
      'west us': 'West US',
      'west europe': 'West Europe',
      'north europe': 'North Europe',
      'southeast asia': 'Southeast Asia',
      'japan east': 'Japan East'
    };
    
    for (const [key, value] of Object.entries(locations)) {
      if (prompt.toLowerCase().includes(key)) {
        return value;
      }
    }
    return null;
  }

  private extractPorts(prompt: string): number[] | null {
    const match = prompt.match(/port[s]?\s+(\d+(?:,\s*\d+)*)/i);
    if (match) {
      return match[1].split(',').map(p => parseInt(p.trim()));
    }
    if (prompt.toLowerCase().includes('web') || prompt.toLowerCase().includes('nginx')) {
      return [80];
    }
    if (prompt.toLowerCase().includes('api')) {
      return [3000];
    }
    return null;
  }

  private extractCpu(prompt: string): number | null {
    const match = prompt.match(/(\d+(?:\.\d+)?)\s*cpu/i);
    return match ? parseFloat(match[1]) : null;
  }

  private extractMemory(prompt: string): number | null {
    const match = prompt.match(/(\d+(?:\.\d+)?)\s*(?:gb|memory)/i);
    return match ? parseFloat(match[1]) : null;
  }

  private extractDatabaseName(prompt: string): string | null {
    const match = prompt.match(/database\s+(?:named?|called?)\s+([a-zA-Z0-9-]+)/i);
    return match ? match[1] : null;
  }

  private extractSku(prompt: string): string | null {
    if (prompt.toLowerCase().includes('basic')) return 'B_Gen5_1';
    if (prompt.toLowerCase().includes('standard')) return 'GP_Gen5_2';
    if (prompt.toLowerCase().includes('premium')) return 'MO_Gen5_4';
    return null;
  }

  private extractStorageAccountName(prompt: string): string | null {
    const match = prompt.match(/storage\s+(?:account\s+)?(?:named?|called?)\s+([a-zA-Z0-9]+)/i);
    return match ? match[1] : null;
  }

  private extractVnetName(prompt: string): string | null {
    const match = prompt.match(/(?:vnet|network)\s+(?:named?|called?)\s+([a-zA-Z0-9-]+)/i);
    return match ? match[1] : null;
  }

  private extractClusterName(prompt: string): string | null {
    const match = prompt.match(/(?:cluster|aks)\s+(?:named?|called?)\s+([a-zA-Z0-9-]+)/i);
    return match ? match[1] : null;
  }

  private extractNodeCount(prompt: string): number | null {
    const match = prompt.match(/(\d+)\s*nodes?/i);
    return match ? parseInt(match[1]) : null;
  }

  determineResourceType(prompt: string): 'container' | 'database' | 'storage' | 'network' | 'kubernetes' | 'custom' {
    const lowercasePrompt = prompt.toLowerCase();
    
    if (lowercasePrompt.includes('container') || lowercasePrompt.includes('docker') || lowercasePrompt.includes('nginx') || lowercasePrompt.includes('web app')) {
      return 'container';
    }
    if (lowercasePrompt.includes('database') || lowercasePrompt.includes('postgres') || lowercasePrompt.includes('mysql') || lowercasePrompt.includes('sql')) {
      return 'database';
    }
    if (lowercasePrompt.includes('storage') || lowercasePrompt.includes('blob') || lowercasePrompt.includes('bucket')) {
      return 'storage';
    }
    if (lowercasePrompt.includes('network') || lowercasePrompt.includes('vnet') || lowercasePrompt.includes('subnet')) {
      return 'network';
    }
    if (lowercasePrompt.includes('kubernetes') || lowercasePrompt.includes('aks') || lowercasePrompt.includes('k8s')) {
      return 'kubernetes';
    }
    
    return 'custom';
  }

  determineProvider(prompt: string): 'azure' | 'aws' | 'gcp' {
    const lowercasePrompt = prompt.toLowerCase();
    
    if (lowercasePrompt.includes('azure') || lowercasePrompt.includes('aks') || lowercasePrompt.includes('app service')) {
      return 'azure';
    }
    if (lowercasePrompt.includes('aws') || lowercasePrompt.includes('ec2') || lowercasePrompt.includes('s3')) {
      return 'aws';
    }
    if (lowercasePrompt.includes('gcp') || lowercasePrompt.includes('google') || lowercasePrompt.includes('gke')) {
      return 'gcp';
    }
    
    return 'azure'; // Default to Azure
  }
}

const codeGenerator = new CodeGenerator();
export { codeGenerator };
