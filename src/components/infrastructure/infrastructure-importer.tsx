import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload, 
  FileText, 
  Cloud, 
  Server, 
  Database,
  CheckCircle,
  AlertTriangle,
  Info,
  Settings,
  FolderOpen,
  GitBranch,
  Layers,
  Container
} from "lucide-react";

interface ImportResult {
  status: 'success' | 'warning' | 'error';
  message: string;
  resources: number;
  converted?: boolean;
}

export function InfrastructureImporter() {
  const [activeTab, setActiveTab] = useState("terraform");
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);

  const handleImport = async (type: string, config: any) => {
    setIsImporting(true);
    setImportProgress(0);
    
    const progressInterval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsImporting(false);
          
          const mockResults: ImportResult[] = [
            {
              status: 'success',
              message: `Successfully imported ${type} configuration`,
              resources: Math.floor(Math.random() * 50) + 10,
              converted: config.action === 'convert'
            },
            {
              status: 'warning',
              message: `${Math.floor(Math.random() * 3) + 1} resources require manual review`,
              resources: Math.floor(Math.random() * 5) + 1
            }
          ];
          
          setImportResults(mockResults);
          return 100;
        }
        return prev + Math.random() * 20;
      });
    }, 500);
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'terraform':
        return <Settings className="w-5 h-5 text-purple-500" />;
      case 'cloudformation':
        return <Cloud className="w-5 h-5 text-orange-500" />;
      case 'arm':
        return <Database className="w-5 h-5 text-blue-500" />;
      case 'kubernetes':
        return <Container className="w-5 h-5 text-blue-400" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cyan-400">Infrastructure Importer</h2>
          <p className="text-cyan-300">Import existing infrastructure from any cloud provider</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-cyan-400 border-cyan-400">
            Multi-Cloud Support
          </Badge>
        </div>
      </div>

      {isImporting && (
        <Card className="bg-blue-950 border-blue-800">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white">Importing infrastructure...</span>
                <span className="text-cyan-400">{Math.round(importProgress)}%</span>
              </div>
              <Progress value={importProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {importResults.length > 0 && (
        <Card className="bg-blue-950 border-blue-800">
          <CardHeader>
            <CardTitle className="text-cyan-400">Import Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {importResults.map((result, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-blue-900 rounded-lg">
                  {result.status === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
                  {result.status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                  {result.status === 'error' && <AlertTriangle className="w-5 h-5 text-red-400" />}
                  <div className="flex-1">
                    <p className="text-white text-sm">{result.message}</p>
                    <p className="text-cyan-300 text-xs">{result.resources} resources processed</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="terraform" className="flex items-center space-x-2">
            {getProviderIcon('terraform')}
            <span>Terraform</span>
          </TabsTrigger>
          <TabsTrigger value="cloudformation" className="flex items-center space-x-2">
            {getProviderIcon('cloudformation')}
            <span>CloudFormation</span>
          </TabsTrigger>
          <TabsTrigger value="arm" className="flex items-center space-x-2">
            {getProviderIcon('arm')}
            <span>Azure ARM</span>
          </TabsTrigger>
          <TabsTrigger value="kubernetes" className="flex items-center space-x-2">
            {getProviderIcon('kubernetes')}
            <span>Kubernetes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="terraform" className="space-y-4">
          <Card className="bg-blue-950 border-blue-800">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Terraform Configuration</span>
              </CardTitle>
              <CardDescription className="text-cyan-300">
                Import existing Terraform workspaces or convert HCL configurations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tf-workspace" className="text-white">Workspace</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select workspace" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tf-action" className="text-white">Action</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="import">Import & Coexist</SelectItem>
                      <SelectItem value="convert">Convert to Instantiate</SelectItem>
                      <SelectItem value="deploy">Deploy Configuration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tf-config" className="text-white">Terraform Configuration</Label>
                <Textarea 
                  id="tf-config"
                  placeholder="Paste your Terraform HCL configuration here..."
                  className="min-h-[120px] bg-blue-900 border-blue-700 text-white"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => handleImport('terraform', { action: 'import' })}
                  disabled={isImporting}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import Terraform
                </Button>
                <Button variant="outline" className="border-purple-500 text-purple-400">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Browse Files
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cloudformation" className="space-y-4">
          <Card className="bg-blue-950 border-blue-800">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center space-x-2">
                <Cloud className="w-5 h-5" />
                <span>AWS CloudFormation</span>
              </CardTitle>
              <CardDescription className="text-cyan-300">
                Import CloudFormation templates and stacks from AWS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cf-region" className="text-white">AWS Region</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                      <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                      <SelectItem value="eu-west-1">Europe (Ireland)</SelectItem>
                      <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cf-stack" className="text-white">Stack Name</Label>
                  <Input 
                    id="cf-stack"
                    placeholder="Enter stack name (optional)"
                    className="bg-blue-900 border-blue-700 text-white"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cf-template" className="text-white">CloudFormation Template</Label>
                <Textarea 
                  id="cf-template"
                  placeholder="Paste your CloudFormation JSON/YAML template here..."
                  className="min-h-[120px] bg-blue-900 border-blue-700 text-white"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => handleImport('cloudformation', { action: 'import' })}
                  disabled={isImporting}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import CloudFormation
                </Button>
                <Button variant="outline" className="border-orange-500 text-orange-400">
                  <Layers className="w-4 h-4 mr-2" />
                  Scan Existing Stacks
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="arm" className="space-y-4">
          <Card className="bg-blue-950 border-blue-800">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Azure Resource Manager</span>
              </CardTitle>
              <CardDescription className="text-cyan-300">
                Import ARM templates and deployments from Azure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="arm-subscription" className="text-white">Subscription</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subscription" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prod">Production Subscription</SelectItem>
                      <SelectItem value="dev">Development Subscription</SelectItem>
                      <SelectItem value="test">Test Subscription</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arm-rg" className="text-white">Resource Group</Label>
                  <Input 
                    id="arm-rg"
                    placeholder="Enter resource group name"
                    className="bg-blue-900 border-blue-700 text-white"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="arm-template" className="text-white">ARM Template</Label>
                <Textarea 
                  id="arm-template"
                  placeholder="Paste your ARM template JSON here..."
                  className="min-h-[120px] bg-blue-900 border-blue-700 text-white"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => handleImport('arm', { action: 'import' })}
                  disabled={isImporting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import ARM Template
                </Button>
                <Button variant="outline" className="border-blue-500 text-blue-400">
                  <Server className="w-4 h-4 mr-2" />
                  Scan Deployments
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kubernetes" className="space-y-4">
          <Card className="bg-blue-950 border-blue-800">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center space-x-2">
                <Container className="w-5 h-5" />
                <span>Kubernetes & Helm</span>
              </CardTitle>
              <CardDescription className="text-cyan-300">
                Import Kubernetes YAML manifests and Helm charts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="k8s-cluster" className="text-white">Cluster Context</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cluster" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prod-cluster">Production Cluster</SelectItem>
                      <SelectItem value="staging-cluster">Staging Cluster</SelectItem>
                      <SelectItem value="local">Local Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="k8s-namespace" className="text-white">Namespace</Label>
                  <Input 
                    id="k8s-namespace"
                    placeholder="default"
                    className="bg-blue-900 border-blue-700 text-white"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="k8s-config" className="text-white">Kubernetes Configuration</Label>
                <Textarea 
                  id="k8s-config"
                  placeholder="Paste your Kubernetes YAML or Helm values here..."
                  className="min-h-[120px] bg-blue-900 border-blue-700 text-white"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => handleImport('kubernetes', { action: 'import' })}
                  disabled={isImporting}
                  className="bg-blue-400 hover:bg-blue-500"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import Kubernetes
                </Button>
                <Button variant="outline" className="border-blue-400 text-blue-400">
                  <GitBranch className="w-4 h-4 mr-2" />
                  Connect Helm Repository
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-blue-950 border-blue-800">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center space-x-2">
            <Info className="w-5 h-5" />
            <span>Import Guidelines</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-white">Supported Operations</h4>
              <ul className="space-y-2 text-sm text-cyan-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Import existing infrastructure</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Convert to unified format</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Coexist with current deployments</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Deploy to multiple clouds</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-white">Best Practices</h4>
              <ul className="space-y-2 text-sm text-cyan-300">
                <li>• Test imports in development first</li>
                <li>• Review converted configurations</li>
                <li>• Backup existing deployments</li>
                <li>• Use version control for templates</li>
                <li>• Monitor resource dependencies</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}