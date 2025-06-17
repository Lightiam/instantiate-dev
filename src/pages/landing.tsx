
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('aws');
  const [showDashboard, setShowDashboard] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedInfraType, setSelectedInfraType] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);

  const cloudRegions: Record<string, Array<{value: string, text: string}>> = {
    aws: [
      { value: 'us-east-1', text: 'US East (N. Virginia)' },
      { value: 'us-west-2', text: 'US West (Oregon)' },
      { value: 'eu-west-1', text: 'Europe (Ireland)' },
      { value: 'ap-southeast-1', text: 'Asia Pacific (Singapore)' }
    ],
    gcp: [
      { value: 'us-central1', text: 'US Central (Iowa)' },
      { value: 'us-west1', text: 'US West (Oregon)' },
      { value: 'europe-west1', text: 'Europe West (Belgium)' },
      { value: 'asia-southeast1', text: 'Asia Southeast (Singapore)' }
    ],
    azure: [
      { value: 'eastus', text: 'East US' },
      { value: 'westus2', text: 'West US 2' },
      { value: 'westeurope', text: 'West Europe' },
      { value: 'southeastasia', text: 'Southeast Asia' }
    ]
  };

  const templates: Record<string, Array<{value: string, text: string}>> = {
    'web-app': [
      { value: 'react-nginx', text: 'React + Nginx + CDN' },
      { value: 'nodejs-lb', text: 'Node.js + Load Balancer' },
      { value: 'django-postgres', text: 'Django + PostgreSQL' }
    ],
    'api-service': [
      { value: 'fastapi-redis', text: 'FastAPI + Redis' },
      { value: 'graphql-mongodb', text: 'GraphQL + MongoDB' },
      { value: 'rest-mysql', text: 'REST API + MySQL' }
    ],
    'ml-pipeline': [
      { value: 'kubeflow-pipeline', text: 'Kubeflow Pipelines' },
      { value: 'mlflow-tracking', text: 'MLflow + Model Registry' },
      { value: 'airflow-ml', text: 'Apache Airflow ML DAGs' },
      { value: 'sagemaker-pipeline', text: 'SageMaker Pipelines' }
    ],
    'data-pipeline': [
      { value: 'spark-cluster', text: 'Apache Spark Cluster' },
      { value: 'kafka-streams', text: 'Kafka Streams' }
    ],
    'kubernetes-cluster': [
      { value: 'eks-cluster', text: 'Amazon EKS' },
      { value: 'gke-cluster', text: 'Google GKE' },
      { value: 'aks-cluster', text: 'Azure AKS' }
    ],
    'serverless': [
      { value: 'lambda-api', text: 'AWS Lambda API' },
      { value: 'cloud-functions', text: 'Google Cloud Functions' },
      { value: 'azure-functions', text: 'Azure Functions' }
    ]
  };

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeploying(true);
    
    // Simulate deployment
    setTimeout(() => {
      setIsDeploying(false);
      setShowDashboard(true);
      
      // Scroll to dashboard
      const dashboard = document.getElementById('dashboard');
      if (dashboard) {
        dashboard.scrollIntoView({ behavior: 'smooth' });
      }
    }, 3000);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-purple-800 text-white">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md px-8 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-purple-300 text-xl font-mono">&lt;/&gt;</span>
            <span className="text-xl font-bold">Instanti8.dev</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('platform')} className="hover:opacity-70 transition-opacity cursor-pointer">Platform</button>
            <a href="#pricing" className="hover:opacity-70 transition-opacity">Pricing</a>
            <a href="#docs" className="hover:opacity-70 transition-opacity">Docs</a>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={() => window.location.href = '/auth'} variant="ghost" className="text-white border-white/30 hover:bg-white/10">
              Sign In
            </Button>
            <Button onClick={() => scrollToSection('deploy')} className="bg-blue-600 hover:bg-blue-700">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-center px-8 py-16 max-w-6xl mx-auto">
        <div className="bg-white/20 text-white px-4 py-2 rounded-full text-sm mb-8 inline-block">
          🚀 Infrastructure as Code Simplified
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Infrastructure as{" "}
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Code Simplified
          </span>
        </h1>
        <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
          Instanti8.dev transforms complex infrastructure provisioning into simple, declarative code. Define once, deploy everywhere - seamlessly orchestrate resources across AWS, Azure, and GCP with intelligent automation, version control, and collaborative workflows.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <Button 
            onClick={() => scrollToSection('deploy')}
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
          >
            Start Deploying →
          </Button>
          <Button 
            onClick={() => scrollToSection('platform')}
            variant="outline" 
            size="lg"
            className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-3"
          >
            Try AI Assistant
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 max-w-6xl mx-auto mb-16">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20 hover:transform hover:-translate-y-2 transition-all duration-300">
          <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">
            🔧
          </div>
          <h3 className="text-xl font-semibold mb-4">Simply Fill Out the Form</h3>
          <p className="text-white/80 leading-relaxed">
            Generate and deploy cloud infrastructure directly from our intuitive interface. 
            Select from pre-built templates and customize to your needs.
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20 hover:transform hover:-translate-y-2 transition-all duration-300">
          <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">
            💻
          </div>
          <h3 className="text-xl font-semibold mb-4">Generate the Code</h3>
          <p className="text-white/80 leading-relaxed">
            Automatically create Infrastructure as Code configurations using Terraform, 
            CloudFormation, or Pulumi based on your selections.
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20 hover:transform hover:-translate-y-2 transition-all duration-300">
          <div className="w-16 h-16 bg-yellow-500 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">
            📊
          </div>
          <h3 className="text-xl font-semibold mb-4">Deploy & Understand Impact</h3>
          <p className="text-white/80 leading-relaxed">
            Deploy with confidence while understanding costs and security implications. 
            Full visibility into your infrastructure changes.
          </p>
        </div>
      </section>

      {/* Platform Section */}
      <section id="platform" className="bg-white/5 mx-8 rounded-3xl p-12 max-w-6xl mx-auto backdrop-blur-md mb-8">
        <h2 className="text-center text-4xl font-bold mb-8">Multi-Cloud Infrastructure Platform</h2>
        
        {/* Platform Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {['aws', 'gcp', 'azure', 'kubernetes', 'mlops'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg border transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-black/20 rounded-xl p-8">
          {activeTab === 'aws' && (
            <div>
              <h3 className="text-2xl font-semibold mb-4">AWS Infrastructure Templates</h3>
              <p className="mb-6 text-white/80">Deploy scalable AWS infrastructure with pre-configured templates for common use cases.</p>
              <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
                <pre className="text-green-400 text-sm">
{`# AWS EKS Cluster with MLOps Pipeline
resource "aws_eks_cluster" "mlops_cluster" {
  name     = var.cluster_name
  role_arn = aws_iam_role.eks_cluster.arn
  version  = "1.28"

  vpc_config {
    subnet_ids              = var.subnet_ids
    endpoint_private_access = true
    endpoint_public_access  = true
  }

  enabled_cluster_log_types = ["api", "audit", "authenticator"]
}`}
                </pre>
              </div>
            </div>
          )}
          {activeTab === 'gcp' && (
            <div>
              <h3 className="text-2xl font-semibold mb-4">Google Cloud Platform Templates</h3>
              <p className="mb-6 text-white/80">Leverage GCP's AI/ML services with automated infrastructure provisioning.</p>
              <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
                <pre className="text-green-400 text-sm">
{`# GKE Cluster with Vertex AI Integration
resource "google_container_cluster" "mlops_cluster" {
  name     = var.cluster_name
  location = var.region

  remove_default_node_pool = true
  initial_node_count       = 1

  workload_identity_config {
    workload_pool = "\${var.project_id}.svc.id.goog"
  }
}`}
                </pre>
              </div>
            </div>
          )}
          {activeTab === 'azure' && (
            <div>
              <h3 className="text-2xl font-semibold mb-4">Microsoft Azure Templates</h3>
              <p className="mb-6 text-white/80">Deploy Azure resources with integrated ML services and enterprise security.</p>
              <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
                <pre className="text-green-400 text-sm">
{`# AKS Cluster with Azure ML Integration
resource "azurerm_kubernetes_cluster" "mlops_cluster" {
  name                = var.cluster_name
  location            = var.location
  resource_group_name = var.resource_group_name
  dns_prefix          = "\${var.cluster_name}-dns"

  default_node_pool {
    name       = "default"
    node_count = 3
    vm_size    = "Standard_DS2_v2"
  }

  identity {
    type = "SystemAssigned"
  }
}`}
                </pre>
              </div>
            </div>
          )}
          {activeTab === 'kubernetes' && (
            <div>
              <h3 className="text-2xl font-semibold mb-4">Kubernetes Deployments</h3>
              <p className="mb-6 text-white/80">Container orchestration with GitOps workflows and monitoring.</p>
              <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
                <pre className="text-green-400 text-sm">
{`# MLflow Deployment with PostgreSQL Backend
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mlflow-server
  namespace: mlops
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mlflow-server`}
                </pre>
              </div>
            </div>
          )}
          {activeTab === 'mlops' && (
            <div>
              <h3 className="text-2xl font-semibold mb-4">MLOps Pipeline Templates</h3>
              <p className="mb-6 text-white/80">End-to-end ML pipeline infrastructure with CI/CD and monitoring.</p>
              <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
                <pre className="text-green-400 text-sm">
{`# Kubeflow Pipelines with Tekton
apiVersion: tekton.dev/v1beta1
kind: Pipeline
metadata:
  name: ml-training-pipeline
  namespace: mlops
spec:
  params:
  - name: model-name
    type: string`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Deployment Form */}
      <section id="deploy" className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mx-8 max-w-4xl mx-auto border border-white/20 mb-8">
        <h2 className="text-center text-3xl font-bold mb-8">Deploy Infrastructure</h2>
        <form onSubmit={handleDeploy} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white mb-2 font-medium">Project Name</label>
              <input
                type="text"
                placeholder="my-mlops-project"
                required
                className="w-full p-3 border border-white/30 rounded-lg bg-white/10 text-white placeholder-white/60"
              />
            </div>
            <div>
              <label className="block text-white mb-2 font-medium">Environment</label>
              <select
                required
                className="w-full p-3 border border-white/30 rounded-lg bg-white/10 text-white"
              >
                <option value="">Select Environment</option>
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white mb-2 font-medium">Cloud Provider</label>
              <select
                required
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full p-3 border border-white/30 rounded-lg bg-white/10 text-white"
              >
                <option value="">Select Provider</option>
                <option value="aws">Amazon Web Services</option>
                <option value="gcp">Google Cloud Platform</option>
                <option value="azure">Microsoft Azure</option>
              </select>
            </div>
            <div>
              <label className="block text-white mb-2 font-medium">Region</label>
              <select
                required
                className="w-full p-3 border border-white/30 rounded-lg bg-white/10 text-white"
              >
                <option value="">Select Region</option>
                {selectedProvider && cloudRegions[selectedProvider]?.map((region) => (
                  <option key={region.value} value={region.value}>
                    {region.text}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white mb-2 font-medium">Infrastructure Type</label>
            <select
              required
              value={selectedInfraType}
              onChange={(e) => setSelectedInfraType(e.target.value)}
              className="w-full p-3 border border-white/30 rounded-lg bg-white/10 text-white"
            >
              <option value="">Select Type</option>
              <option value="web-app">Web Application</option>
              <option value="api-service">API Service</option>
              <option value="ml-pipeline">ML Pipeline</option>
              <option value="data-pipeline">Data Pipeline</option>
              <option value="kubernetes-cluster">Kubernetes Cluster</option>
              <option value="serverless">Serverless Functions</option>
            </select>
          </div>

          <div>
            <label className="block text-white mb-2 font-medium">Template</label>
            <select
              required
              className="w-full p-3 border border-white/30 rounded-lg bg-white/10 text-white"
            >
              <option value="">Select Template</option>
              {selectedInfraType && templates[selectedInfraType]?.map((template) => (
                <option key={template.value} value={template.value}>
                  {template.text}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white mb-2 font-medium">Description (Optional)</label>
            <textarea
              rows={3}
              placeholder="Describe your infrastructure deployment..."
              className="w-full p-3 border border-white/30 rounded-lg bg-white/10 text-white placeholder-white/60"
            />
          </div>

          <div className="text-center">
            <Button
              type="submit"
              size="lg"
              disabled={isDeploying}
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
            >
              {isDeploying ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Deploying...
                </>
              ) : (
                'Deploy Infrastructure'
              )}
            </Button>
          </div>
        </form>
      </section>

      {/* Dashboard */}
      {showDashboard && (
        <section id="dashboard" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mx-8 max-w-6xl mx-auto mb-16">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">EKS Cluster</span>
              <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">Running</span>
            </div>
            <p className="text-white/80 mb-4 text-sm">Kubernetes cluster with 3 nodes</p>
            <div className="w-full bg-white/20 rounded-full h-2 mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-full"></div>
            </div>
            <div className="text-white/60 text-xs">Deployed 5 minutes ago</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">MLflow Server</span>
              <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">Running</span>
            </div>
            <p className="text-white/80 mb-4 text-sm">Model tracking and registry</p>
            <div className="w-full bg-white/20 rounded-full h-2 mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-full"></div>
            </div>
            <div className="text-white/60 text-xs">Deployed 3 minutes ago</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">Jupyter Hub</span>
              <span className="bg-yellow-500 text-white text-xs px-3 py-1 rounded-full">Deploying</span>
            </div>
            <p className="text-white/80 mb-4 text-sm">Multi-user notebook environment</p>
            <div className="w-full bg-white/20 rounded-full h-2 mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-3/5"></div>
            </div>
            <div className="text-white/60 text-xs">Started 2 minutes ago</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">Monitoring</span>
              <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">Running</span>
            </div>
            <p className="text-white/80 mb-4 text-sm">Prometheus + Grafana stack</p>
            <div className="w-full bg-white/20 rounded-full h-2 mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-full"></div>
            </div>
            <div className="text-white/60 text-xs">Deployed 8 minutes ago</div>
          </div>
        </section>
      )}
    </div>
  );
}
