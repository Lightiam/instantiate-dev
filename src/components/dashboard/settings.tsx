import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Save, Plus, Trash2, Key, Cloud, Shield, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

export function Settings() {
  const { toast } = useToast();
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>([]);
  const [providerStatuses, setProviderStatuses] = useState<ProviderStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

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
        <TabsList className="grid w-full grid-cols-2 bg-slate-800">
          <TabsTrigger value="providers" className="data-[state=active]:bg-slate-700">Cloud Providers</TabsTrigger>
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
