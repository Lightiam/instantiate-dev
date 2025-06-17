import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Save, Plus, Trash2, Key, Cloud, Shield, CheckCircle, XCircle, AlertCircle, Settings as SettingsIcon, Globe, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
  provider?: string;
}

interface ProviderStatus {
  provider: string;
  status: 'connected' | 'error' | 'not-configured';
  resourceCount: number;
  totalCost?: number;
  lastSync: string;
  error?: string;
}

interface DeploymentConfig {
  mode: 'simulation' | 'real';
  defaultProvider: 'aws' | 'azure' | 'gcp';
  defaultRegion: string;
  autoApprove: boolean;
  enableTerraform: boolean;
  resourceTags: Record<string, string>;
}

export function Settings() {
  const { toast } = useToast();
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>([]);
  const [providerStatuses, setProviderStatuses] = useState<ProviderStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [deploymentConfig, setDeploymentConfig] = useState<DeploymentConfig>({
    mode: 'simulation',
    defaultProvider: 'aws',
    defaultRegion: 'us-east-1',
    autoApprove: false,
    enableTerraform: true,
    resourceTags: {}
  });

  useEffect(() => {
    loadEnvironmentVariables();
    loadProviderStatuses();
  }, []);

  const loadEnvironmentVariables = async () => {
    try {
      const response = await fetch('/api/credentials/env-vars');
      const data = await response.json();
      
      if (data.success) {
        setEnvVars(data.envVars);
      } else {
        toast({
          title: "Error loading environment variables",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error loading environment variables",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadProviderStatuses = async () => {
    try {
      const response = await fetch('/api/credentials/provider-status');
      const data = await response.json();
      
      if (data.success) {
        setProviderStatuses(data.statuses);
      }
    } catch (error: any) {
      console.error('Error loading provider statuses:', error);
    }
  };

  const testConnection = async (provider: string) => {
    setTestingConnection(provider);
    try {
      const response = await fetch('/api/credentials/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Connection successful",
          description: `Successfully connected to ${provider.toUpperCase()}`,
        });
      } else {
        toast({
          title: "Connection failed",
          description: result.error,
          variant: "destructive",
        });
      }
      
      await loadProviderStatuses();
    } catch (error: any) {
      toast({
        title: "Connection test failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTestingConnection(null);
    }
  };

  const toggleSecretVisibility = (id: string) => {
    setShowSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const updateEnvVar = (id: string, field: 'key' | 'value', newValue: string) => {
    setEnvVars(prev => prev.map(env => 
      env.id === id ? { ...env, [field]: newValue } : env
    ));
  };

  const addEnvVar = () => {
    const newVar: EnvironmentVariable = {
      id: Date.now().toString(),
      key: "",
      value: "",
      isSecret: true
    };
    setEnvVars(prev => [...prev, newVar]);
  };

  const removeEnvVar = (id: string) => {
    setEnvVars(prev => prev.filter(env => env.id !== id));
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/credentials/env-vars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ envVars })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Settings saved",
          description: "Environment variables have been updated successfully.",
        });
        await loadProviderStatuses();
      } else {
        toast({
          title: "Error saving settings",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getProviderVars = (provider: string) => {
    return envVars.filter(env => env.provider === provider);
  };

  const getCustomVars = () => {
    return envVars.filter(env => !env.provider);
  };

  const getProviderStatus = (provider: string) => {
    return providerStatuses.find(status => status.provider === provider);
  };

  const renderProviderStatusBadge = (provider: string) => {
    const status = getProviderStatus(provider);
    if (!status) return null;

    const statusConfig = {
      connected: { icon: CheckCircle, color: "bg-green-500", text: "Connected" },
      error: { icon: XCircle, color: "bg-red-500", text: "Error" },
      'not-configured': { icon: AlertCircle, color: "bg-yellow-500", text: "Not Configured" }
    };

    const config = statusConfig[status.status];
    const Icon = config.icon;

    return (
      <div className="flex items-center space-x-2">
        <Badge variant="secondary" className="flex items-center space-x-1">
          <Icon className="w-3 h-3" />
          <span>{config.text}</span>
        </Badge>
        {status.status === 'connected' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => testConnection(provider)}
            disabled={testingConnection === provider}
            className="text-xs"
          >
            {testingConnection === provider ? "Testing..." : "Test"}
          </Button>
        )}
      </div>
    );
  };

  const renderEnvVarInput = (envVar: EnvironmentVariable) => (
    <div key={envVar.id} className="space-y-2 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1">
          <div className="flex-1">
            <Label htmlFor={`key-${envVar.id}`} className="text-sm text-slate-300">Variable Name</Label>
            <Input
              id={`key-${envVar.id}`}
              value={envVar.key}
              onChange={(e) => updateEnvVar(envVar.id, 'key', e.target.value)}
              placeholder="VARIABLE_NAME"
              className="bg-slate-900 border-slate-600 text-white"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor={`value-${envVar.id}`} className="text-sm text-slate-300">Value</Label>
            <div className="relative">
              <Input
                id={`value-${envVar.id}`}
                type={envVar.isSecret && !showSecrets[envVar.id] ? "password" : "text"}
                value={envVar.value}
                onChange={(e) => updateEnvVar(envVar.id, 'value', e.target.value)}
                placeholder={envVar.isSecret ? "••••••••" : "value"}
                className="bg-slate-900 border-slate-600 text-white pr-10"
              />
              {envVar.isSecret && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => toggleSecretVisibility(envVar.id)}
                >
                  {showSecrets[envVar.id] ? (
                    <EyeOff className="h-4 w-4 text-slate-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-400" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          {envVar.isSecret && <Badge variant="secondary"><Key className="w-3 h-3 mr-1" />Secret</Badge>}
          {!envVar.provider && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeEnvVar(envVar.id)}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Configure environment variables and cloud provider credentials for your deployments.</p>
      </div>

      <Tabs defaultValue="providers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800">
          <TabsTrigger value="providers" className="data-[state=active]:bg-slate-700">Cloud Providers</TabsTrigger>
          <TabsTrigger value="deployment" className="data-[state=active]:bg-slate-700">Deployment Config</TabsTrigger>
          <TabsTrigger value="custom" className="data-[state=active]:bg-slate-700">Custom Variables</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-6">
          {/* AWS Configuration */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Cloud className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Amazon Web Services</CardTitle>
                    <CardDescription>Configure AWS credentials for resource provisioning</CardDescription>
                  </div>
                </div>
                {renderProviderStatusBadge("aws")}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {getProviderVars("aws").map(renderEnvVarInput)}
              <div className="text-xs text-slate-400">
                <Shield className="w-3 h-3 inline mr-1" />
                Get your AWS credentials from the AWS IAM console. Ensure your user has appropriate permissions for the resources you plan to deploy.
              </div>
            </CardContent>
          </Card>

          {/* Azure Configuration */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Cloud className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Microsoft Azure</CardTitle>
                    <CardDescription>Configure Azure service principal credentials</CardDescription>
                  </div>
                </div>
                {renderProviderStatusBadge("azure")}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {getProviderVars("azure").map(renderEnvVarInput)}
              <div className="text-xs text-slate-400">
                <Shield className="w-3 h-3 inline mr-1" />
                Create a service principal in Azure Active Directory with contributor role on your subscription.
              </div>
            </CardContent>
          </Card>

          {/* GCP Configuration */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <Cloud className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Google Cloud Platform</CardTitle>
                    <CardDescription>Configure GCP service account credentials</CardDescription>
                  </div>
                </div>
                {renderProviderStatusBadge("gcp")}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {getProviderVars("gcp").map(renderEnvVarInput)}
              <div className="text-xs text-slate-400">
                <Shield className="w-3 h-3 inline mr-1" />
                Download service account key JSON from Google Cloud Console and paste the file path or content.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-6">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <SettingsIcon className="w-4 h-4 text-black" />
                </div>
                <div>
                  <CardTitle className="text-white">Deployment Mode</CardTitle>
                  <CardDescription>Configure how deployments are executed</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-white">Deployment Mode</Label>
                    <p className="text-sm text-slate-400">
                      {deploymentConfig.mode === 'simulation' 
                        ? 'Preview mode - Generate code without deploying real resources'
                        : 'Real deployment - Actually provision cloud resources'
                      }
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm ${deploymentConfig.mode === 'simulation' ? 'text-amber-400' : 'text-slate-400'}`}>
                      Preview
                    </span>
                    <Button
                      variant={deploymentConfig.mode === 'real' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => 
                        setDeploymentConfig(prev => ({ ...prev, mode: prev.mode === 'real' ? 'simulation' : 'real' }))
                      }
                      className="px-3 py-1"
                    >
                      {deploymentConfig.mode === 'real' ? 'ON' : 'OFF'}
                    </Button>
                    <span className={`text-sm ${deploymentConfig.mode === 'real' ? 'text-green-400' : 'text-slate-400'}`}>
                      Real
                    </span>
                  </div>
                </div>

                {deploymentConfig.mode === 'real' && (
                  <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
                    <div className="flex items-center space-x-2 text-red-400">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Real Deployment Mode</span>
                    </div>
                    <p className="text-xs text-red-300 mt-1">
                      This will create actual cloud resources and may incur costs. Ensure your credentials are properly configured.
                    </p>
                  </div>
                )}

                {deploymentConfig.mode === 'simulation' && (
                  <div className="p-4 bg-amber-900/20 border border-amber-700 rounded-lg">
                    <div className="flex items-center space-x-2 text-amber-400">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm font-medium">Preview Mode</span>
                    </div>
                    <p className="text-xs text-amber-300 mt-1">
                      Generate infrastructure code and preview deployments without creating real resources.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Globe className="w-4 h-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white">Default Deployment Settings</CardTitle>
                  <CardDescription>Configure default settings for new deployments</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Default Cloud Provider</Label>
                  <Select 
                    value={deploymentConfig.defaultProvider} 
                    onValueChange={(value: 'aws' | 'azure' | 'gcp') => 
                      setDeploymentConfig(prev => ({ ...prev, defaultProvider: value }))
                    }
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="aws">Amazon Web Services</SelectItem>
                      <SelectItem value="azure">Microsoft Azure</SelectItem>
                      <SelectItem value="gcp">Google Cloud Platform</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Default Region</Label>
                  <Select 
                    value={deploymentConfig.defaultRegion} 
                    onValueChange={(value) => 
                      setDeploymentConfig(prev => ({ ...prev, defaultRegion: value }))
                    }
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {deploymentConfig.defaultProvider === 'aws' && (
                        <>
                          <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                          <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                          <SelectItem value="eu-west-1">Europe (Ireland)</SelectItem>
                          <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                        </>
                      )}
                      {deploymentConfig.defaultProvider === 'azure' && (
                        <>
                          <SelectItem value="eastus">East US</SelectItem>
                          <SelectItem value="westus2">West US 2</SelectItem>
                          <SelectItem value="westeurope">West Europe</SelectItem>
                          <SelectItem value="southeastasia">Southeast Asia</SelectItem>
                        </>
                      )}
                      {deploymentConfig.defaultProvider === 'gcp' && (
                        <>
                          <SelectItem value="us-central1">US Central 1</SelectItem>
                          <SelectItem value="us-west1">US West 1</SelectItem>
                          <SelectItem value="europe-west1">Europe West 1</SelectItem>
                          <SelectItem value="asia-southeast1">Asia Southeast 1</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-white">Enable Terraform</Label>
                    <p className="text-sm text-slate-400">Use Terraform for infrastructure as code deployments</p>
                  </div>
                  <Button
                    variant={deploymentConfig.enableTerraform ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => 
                      setDeploymentConfig(prev => ({ ...prev, enableTerraform: !prev.enableTerraform }))
                    }
                    className="px-3 py-1"
                  >
                    {deploymentConfig.enableTerraform ? 'ON' : 'OFF'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-white">Auto-approve Deployments</Label>
                    <p className="text-sm text-slate-400">Automatically approve deployment plans without manual confirmation</p>
                  </div>
                  <Button
                    variant={deploymentConfig.autoApprove ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => 
                      setDeploymentConfig(prev => ({ ...prev, autoApprove: !prev.autoApprove }))
                    }
                    disabled={deploymentConfig.mode === 'simulation'}
                    className="px-3 py-1"
                  >
                    {deploymentConfig.autoApprove ? 'ON' : 'OFF'}
                  </Button>
                </div>
              </div>

              {deploymentConfig.autoApprove && deploymentConfig.mode === 'real' && (
                <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
                  <div className="flex items-center space-x-2 text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Auto-approve Enabled</span>
                  </div>
                  <p className="text-xs text-red-300 mt-1">
                    Deployments will proceed automatically without manual approval. Use with caution in production.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Custom Environment Variables</CardTitle>
              <CardDescription>Add application-specific environment variables for your deployments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getCustomVars().map(renderEnvVarInput)}
              
              <Button
                onClick={addEnvVar}
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Environment Variable
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button 
          onClick={saveSettings} 
          disabled={loading}
          className="bg-primary hover:bg-primary/90"
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
