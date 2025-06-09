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

  // Helper methods to extract information from prompts
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