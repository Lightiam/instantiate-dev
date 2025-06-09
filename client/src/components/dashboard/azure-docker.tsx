import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Container, Cloud, Server, Globe, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: "pending" | "running" | "stopped" | "failed";
  resourceGroup: string;
  location: string;
  cpu: number;
  memory: number;
  ports: number[];
  publicIp?: string;
  createdAt: string;
  logs?: string;
}

interface CreateContainerRequest {
  name: string;
  image: string;
  resourceGroup: string;
  location: string;
  cpu: number;
  memory: number;
  ports: number[];
  environmentVariables?: Record<string, string>;
  command?: string[];
}

export function AzureDocker() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);

  const [containerConfig, setContainerConfig] = useState<CreateContainerRequest>({
    name: "",
    image: "nginx:latest",
    resourceGroup: "instanti8-rg",
    location: "eastus",
    cpu: 1,
    memory: 1,
    ports: [80],
    environmentVariables: {},
    command: []
  });

  // Fetch existing containers
  const { data: containers = [], isLoading } = useQuery({
    queryKey: ['/api/azure/containers'],
    queryFn: ({ queryKey }) => apiRequest(queryKey[0] as string),
  });

  // Create new container
  const createContainerMutation = useMutation({
    mutationFn: (config: CreateContainerRequest) => 
      fetch('/api/azure/containers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      }).then(res => res.json()),
    onSuccess: () => {
      toast({
        title: "Container deployment started",
        description: "Your Docker container is being deployed to Azure Container Instances.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/azure/containers'] });
      // Reset form
      setContainerConfig({
        name: "",
        image: "nginx:latest",
        resourceGroup: "instanti8-rg",
        location: "eastus",
        cpu: 1,
        memory: 1,
        ports: [80],
        environmentVariables: {},
        command: []
      });
    },
    onError: (error: any) => {
      toast({
        title: "Deployment failed",
        description: error.message || "Failed to deploy container to Azure.",
        variant: "destructive",
      });
    },
  });

  // Stop container
  const stopContainerMutation = useMutation({
    mutationFn: (containerId: string) => 
      fetch(`/api/azure/containers/${containerId}/stop`, {
        method: 'POST'
      }).then(res => res.json()),
    onSuccess: () => {
      toast({
        title: "Container stopped",
        description: "Container has been stopped successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/azure/containers'] });
    },
  });

  // Delete container
  const deleteContainerMutation = useMutation({
    mutationFn: (containerId: string) => 
      fetch(`/api/azure/containers/${containerId}`, {
        method: 'DELETE'
      }).then(res => res.json()),
    onSuccess: () => {
      toast({
        title: "Container deleted",
        description: "Container has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/azure/containers'] });
    },
  });

  const handleCreateContainer = () => {
    if (!containerConfig.name || !containerConfig.image) {
      toast({
        title: "Missing required fields",
        description: "Please provide container name and image.",
        variant: "destructive",
      });
      return;
    }

    createContainerMutation.mutate(containerConfig);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Server className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "failed":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const azureLocations = [
    { value: "eastus", label: "East US" },
    { value: "westus2", label: "West US 2" },
    { value: "westeurope", label: "West Europe" },
    { value: "northeurope", label: "North Europe" },
    { value: "southeastasia", label: "Southeast Asia" },
    { value: "australiaeast", label: "Australia East" },
  ];

  const popularImages = [
    "nginx:latest",
    "httpd:latest",
    "node:18-alpine",
    "python:3.11-slim",
    "postgres:15",
    "redis:7-alpine",
    "mongo:6",
    "ubuntu:22.04"
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
          <Container className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Azure Docker Containers</h1>
          <p className="text-slate-400">Deploy and manage Docker containers on Azure Container Instances</p>
        </div>
      </div>

      <Tabs defaultValue="containers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800">
          <TabsTrigger value="containers" className="data-[state=active]:bg-slate-700">Active Containers</TabsTrigger>
          <TabsTrigger value="deploy" className="data-[state=active]:bg-slate-700">Deploy New</TabsTrigger>
        </TabsList>

        <TabsContent value="containers" className="space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-slate-400 mt-2">Loading containers...</p>
            </div>
          ) : (containers as DockerContainer[]).length === 0 ? (
            <Card className="bg-slate-900 border-slate-700">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Container className="w-12 h-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No containers deployed</h3>
                <p className="text-slate-400 text-center max-w-md mb-6">
                  Deploy your first Docker container to Azure Container Instances to get started.
                </p>
                <Button onClick={() => setSelectedContainer("deploy")} className="bg-primary hover:bg-primary/90">
                  Deploy Container
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(containers as DockerContainer[]).map((container: DockerContainer) => (
                <Card key={container.id} className="bg-slate-900 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(container.status)}
                        <div>
                          <CardTitle className="text-white text-lg">{container.name}</CardTitle>
                          <CardDescription className="text-slate-400">{container.image}</CardDescription>
                        </div>
                      </div>
                      <Badge className={getStatusColor(container.status)}>
                        {container.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Resource Group:</span>
                        <p className="text-white">{container.resourceGroup}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Location:</span>
                        <p className="text-white">{container.location}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">CPU:</span>
                        <p className="text-white">{container.cpu} cores</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Memory:</span>
                        <p className="text-white">{container.memory} GB</p>
                      </div>
                    </div>

                    {container.publicIp && (
                      <div className="flex items-center space-x-2 p-3 bg-slate-800 rounded-lg">
                        <Globe className="w-4 h-4 text-primary" />
                        <span className="text-slate-400">Public IP:</span>
                        <a 
                          href={`http://${container.publicIp}:${container.ports[0]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {container.publicIp}
                        </a>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      {container.status === "running" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => stopContainerMutation.mutate(container.id)}
                          disabled={stopContainerMutation.isPending}
                          className="border-slate-600 text-slate-300 hover:bg-slate-800"
                        >
                          Stop
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteContainerMutation.mutate(container.id)}
                        disabled={deleteContainerMutation.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="deploy" className="space-y-6">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Deploy Docker Container</CardTitle>
              <CardDescription>Create a new container instance on Azure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300">Container Name</Label>
                  <Input
                    id="name"
                    value={containerConfig.name}
                    onChange={(e) => setContainerConfig(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="my-app-container"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image" className="text-slate-300">Docker Image</Label>
                  <Select 
                    value={containerConfig.image} 
                    onValueChange={(value) => setContainerConfig(prev => ({ ...prev, image: value }))}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue placeholder="Select or enter image" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {popularImages.map((image) => (
                        <SelectItem key={image} value={image} className="text-white hover:bg-slate-700">
                          {image}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resourceGroup" className="text-slate-300">Resource Group</Label>
                  <Input
                    id="resourceGroup"
                    value={containerConfig.resourceGroup}
                    onChange={(e) => setContainerConfig(prev => ({ ...prev, resourceGroup: e.target.value }))}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-slate-300">Location</Label>
                  <Select 
                    value={containerConfig.location} 
                    onValueChange={(value) => setContainerConfig(prev => ({ ...prev, location: value }))}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {azureLocations.map((location) => (
                        <SelectItem key={location.value} value={location.value} className="text-white hover:bg-slate-700">
                          {location.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpu" className="text-slate-300">CPU Cores</Label>
                  <Select 
                    value={containerConfig.cpu.toString()} 
                    onValueChange={(value) => setContainerConfig(prev => ({ ...prev, cpu: parseInt(value) }))}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="0.5" className="text-white hover:bg-slate-700">0.5 cores</SelectItem>
                      <SelectItem value="1" className="text-white hover:bg-slate-700">1 core</SelectItem>
                      <SelectItem value="2" className="text-white hover:bg-slate-700">2 cores</SelectItem>
                      <SelectItem value="4" className="text-white hover:bg-slate-700">4 cores</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="memory" className="text-slate-300">Memory (GB)</Label>
                  <Select 
                    value={containerConfig.memory.toString()} 
                    onValueChange={(value) => setContainerConfig(prev => ({ ...prev, memory: parseInt(value) }))}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="0.5" className="text-white hover:bg-slate-700">0.5 GB</SelectItem>
                      <SelectItem value="1" className="text-white hover:bg-slate-700">1 GB</SelectItem>
                      <SelectItem value="2" className="text-white hover:bg-slate-700">2 GB</SelectItem>
                      <SelectItem value="4" className="text-white hover:bg-slate-700">4 GB</SelectItem>
                      <SelectItem value="8" className="text-white hover:bg-slate-700">8 GB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ports" className="text-slate-300">Exposed Ports (comma-separated)</Label>
                <Input
                  id="ports"
                  value={containerConfig.ports.join(', ')}
                  onChange={(e) => {
                    const ports = e.target.value.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
                    setContainerConfig(prev => ({ ...prev, ports }));
                  }}
                  placeholder="80, 443, 8080"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleCreateContainer}
                  disabled={createContainerMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {createContainerMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Cloud className="w-4 h-4 mr-2" />
                      Deploy Container
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}