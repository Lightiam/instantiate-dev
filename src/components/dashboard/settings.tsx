import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Save, Plus, Trash2, Key, Cloud, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
  provider?: string;
}

export function Settings() {
  const { toast } = useToast();
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>([
    { id: "1", key: "AWS_ACCESS_KEY_ID", value: "", isSecret: true, provider: "aws" },
    { id: "2", key: "AWS_SECRET_ACCESS_KEY", value: "", isSecret: true, provider: "aws" },
    { id: "3", key: "AWS_DEFAULT_REGION", value: "us-east-1", isSecret: false, provider: "aws" },
    { id: "4", key: "AZURE_CLIENT_ID", value: "", isSecret: true, provider: "azure" },
    { id: "5", key: "AZURE_CLIENT_SECRET", value: "", isSecret: true, provider: "azure" },
    { id: "6", key: "AZURE_TENANT_ID", value: "", isSecret: true, provider: "azure" },
    { id: "7", key: "GOOGLE_APPLICATION_CREDENTIALS", value: "", isSecret: true, provider: "gcp" },
    { id: "8", key: "GCP_PROJECT_ID", value: "", isSecret: false, provider: "gcp" },
  ]);

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

  const saveSettings = () => {
    // In a real app, this would save to backend
    toast({
      title: "Settings saved",
      description: "Environment variables have been updated successfully.",
    });
  };

  const getProviderVars = (provider: string) => {
    return envVars.filter(env => env.provider === provider);
  };

  const getCustomVars = () => {
    return envVars.filter(env => !env.provider);
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
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Cloud className="w-4 h-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white">Amazon Web Services</CardTitle>
                  <CardDescription>Configure AWS credentials for resource provisioning</CardDescription>
                </div>
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
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Cloud className="w-4 h-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white">Microsoft Azure</CardTitle>
                  <CardDescription>Configure Azure service principal credentials</CardDescription>
                </div>
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
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Cloud className="w-4 h-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white">Google Cloud Platform</CardTitle>
                  <CardDescription>Configure GCP service account credentials</CardDescription>
                </div>
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
        <Button onClick={saveSettings} className="bg-primary hover:bg-primary/90">
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}