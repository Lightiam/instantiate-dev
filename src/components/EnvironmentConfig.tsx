
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Key, Cloud, Database } from 'lucide-react';

interface EnvironmentConfigProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EnvironmentConfig({ isOpen, onClose }: EnvironmentConfigProps) {
  const [azureConfig, setAzureConfig] = useState({
    subscriptionId: '',
    clientId: '',
    clientSecret: '',
    tenantId: ''
  });

  const [awsConfig, setAwsConfig] = useState({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1'
  });

  const [gcpConfig, setGcpConfig] = useState({
    projectId: '',
    serviceAccountKey: ''
  });

  if (!isOpen) return null;

  const handleSave = () => {
    // Save credentials to localStorage for now
    localStorage.setItem('azure-config', JSON.stringify(azureConfig));
    localStorage.setItem('aws-config', JSON.stringify(awsConfig));
    localStorage.setItem('gcp-config', JSON.stringify(gcpConfig));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Environment Configuration</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6">
          <Tabs defaultValue="azure" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800">
              <TabsTrigger value="azure" className="data-[state=active]:bg-blue-600">
                <Cloud className="w-4 h-4 mr-2" />
                Azure
              </TabsTrigger>
              <TabsTrigger value="aws" className="data-[state=active]:bg-orange-600">
                <Database className="w-4 h-4 mr-2" />
                AWS
              </TabsTrigger>
              <TabsTrigger value="gcp" className="data-[state=active]:bg-green-600">
                <Key className="w-4 h-4 mr-2" />
                GCP
              </TabsTrigger>
            </TabsList>

            <TabsContent value="azure" className="space-y-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Azure Configuration</CardTitle>
                  <CardDescription>Configure your Azure service principal credentials</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="azure-subscription" className="text-white">Subscription ID</Label>
                    <Input
                      id="azure-subscription"
                      value={azureConfig.subscriptionId}
                      onChange={(e) => setAzureConfig({...azureConfig, subscriptionId: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    />
                  </div>
                  <div>
                    <Label htmlFor="azure-client-id" className="text-white">Client ID</Label>
                    <Input
                      id="azure-client-id"
                      value={azureConfig.clientId}
                      onChange={(e) => setAzureConfig({...azureConfig, clientId: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    />
                  </div>
                  <div>
                    <Label htmlFor="azure-client-secret" className="text-white">Client Secret</Label>
                    <Input
                      id="azure-client-secret"
                      type="password"
                      value={azureConfig.clientSecret}
                      onChange={(e) => setAzureConfig({...azureConfig, clientSecret: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Your client secret"
                    />
                  </div>
                  <div>
                    <Label htmlFor="azure-tenant-id" className="text-white">Tenant ID</Label>
                    <Input
                      id="azure-tenant-id"
                      value={azureConfig.tenantId}
                      onChange={(e) => setAzureConfig({...azureConfig, tenantId: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="aws" className="space-y-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">AWS Configuration</CardTitle>
                  <CardDescription>Configure your AWS IAM credentials</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="aws-access-key" className="text-white">Access Key ID</Label>
                    <Input
                      id="aws-access-key"
                      value={awsConfig.accessKeyId}
                      onChange={(e) => setAwsConfig({...awsConfig, accessKeyId: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="AKIAIOSFODNN7EXAMPLE"
                    />
                  </div>
                  <div>
                    <Label htmlFor="aws-secret-key" className="text-white">Secret Access Key</Label>
                    <Input
                      id="aws-secret-key"
                      type="password"
                      value={awsConfig.secretAccessKey}
                      onChange={(e) => setAwsConfig({...awsConfig, secretAccessKey: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                    />
                  </div>
                  <div>
                    <Label htmlFor="aws-region" className="text-white">Default Region</Label>
                    <Input
                      id="aws-region"
                      value={awsConfig.region}
                      onChange={(e) => setAwsConfig({...awsConfig, region: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="us-east-1"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gcp" className="space-y-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">GCP Configuration</CardTitle>
                  <CardDescription>Configure your Google Cloud Platform credentials</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="gcp-project-id" className="text-white">Project ID</Label>
                    <Input
                      id="gcp-project-id"
                      value={gcpConfig.projectId}
                      onChange={(e) => setGcpConfig({...gcpConfig, projectId: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="my-project-id"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gcp-service-account" className="text-white">Service Account Key (JSON)</Label>
                    <textarea
                      id="gcp-service-account"
                      value={gcpConfig.serviceAccountKey}
                      onChange={(e) => setGcpConfig({...gcpConfig, serviceAccountKey: e.target.value})}
                      className="w-full h-32 p-3 bg-slate-700 border border-slate-600 text-white rounded-md resize-none"
                      placeholder='{"type": "service_account", "project_id": "...", ...}'
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-slate-700">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-slate-600 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              Save Configuration
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
