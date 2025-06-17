
import React, { useState } from "react";

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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Navigation */}
      <nav style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        padding: '1rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#c4b5fd', fontSize: '1.25rem', fontFamily: 'monospace' }}>&lt;/&gt;</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Instanti8.dev</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <button onClick={() => scrollToSection('platform')} style={{
              background: 'none', border: 'none', color: 'white', cursor: 'pointer'
            }}>Platform</button>
            <a href="#pricing" style={{ color: 'white', textDecoration: 'none' }}>Pricing</a>
            <a href="#docs" style={{ color: 'white', textDecoration: 'none' }}>Docs</a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => window.location.href = '/auth'} style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}>Sign In</button>
            <button onClick={() => scrollToSection('deploy')} style={{
              background: '#2563eb',
              border: 'none',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '9999px',
          fontSize: '0.875rem',
          marginBottom: '2rem',
          display: 'inline-block'
        }}>
          🚀 Infrastructure as Code Simplified
        </div>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          lineHeight: '1.2'
        }}>
          Infrastructure as{" "}
          <span style={{
            background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Code Simplified
          </span>
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: 'rgba(255, 255, 255, 0.9)',
          marginBottom: '2rem',
          maxWidth: '768px',
          margin: '0 auto 2rem auto',
          lineHeight: '1.6'
        }}>
          Instanti8.dev transforms complex infrastructure provisioning into simple, declarative code. Define once, deploy everywhere - seamlessly orchestrate resources across AWS, Azure, and GCP with intelligent automation, version control, and collaborative workflows.
        </p>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '3rem'
        }}>
          <button 
            onClick={() => scrollToSection('deploy')}
            style={{
              background: '#2563eb',
              border: 'none',
              color: 'white',
              fontSize: '1.125rem',
              padding: '0.75rem 2rem',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            Start Deploying →
          </button>
          <button 
            onClick={() => scrollToSection('platform')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              fontSize: '1.125rem',
              padding: '0.75rem 2rem',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            Try AI Assistant
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        padding: '0 2rem',
        maxWidth: '1200px',
        margin: '0 auto 4rem auto'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '2rem',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'transform 0.3s'
        }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            background: '#10b981',
            borderRadius: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            margin: '0 auto 1rem auto'
          }}>
            🔧
          </div>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem'
          }}>Simply Fill Out the Form</h3>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: '1.6'
          }}>
            Generate and deploy cloud infrastructure directly from our intuitive interface. 
            Select from pre-built templates and customize to your needs.
          </p>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '2rem',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'transform 0.3s'
        }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            background: '#8b5cf6',
            borderRadius: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            margin: '0 auto 1rem auto'
          }}>
            💻
          </div>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem'
          }}>Generate the Code</h3>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: '1.6'
          }}>
            Automatically create Infrastructure as Code configurations using Terraform, 
            CloudFormation, or Pulumi based on your selections.
          </p>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '2rem',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'transform 0.3s'
        }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            background: '#f59e0b',
            borderRadius: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            margin: '0 auto 1rem auto'
          }}>
            📊
          </div>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem'
          }}>Deploy & Understand Impact</h3>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: '1.6'
          }}>
            Deploy with confidence while understanding costs and security implications. 
            Full visibility into your infrastructure changes.
          </p>
        </div>
      </section>

      {/* Platform Section */}
      <section id="platform" style={{
        background: 'rgba(255, 255, 255, 0.05)',
        margin: '0 2rem',
        borderRadius: '1.5rem',
        padding: '3rem',
        maxWidth: '1200px',
        marginLeft: 'auto',
        marginRight: 'auto',
        backdropFilter: 'blur(10px)',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '2rem'
        }}>Multi-Cloud Infrastructure Platform</h2>
        
        {/* Platform Tabs */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {['aws', 'gcp', 'azure', 'kubernetes', 'mlops'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid',
                borderColor: activeTab === tab ? '#2563eb' : 'rgba(255, 255, 255, 0.2)',
                background: activeTab === tab ? '#2563eb' : 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '0.75rem',
          padding: '2rem'
        }}>
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
      <section id="deploy" style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '1rem',
        padding: '2rem',
        margin: '0 2rem',
        maxWidth: '1024px',
        marginLeft: 'auto',
        marginRight: 'auto',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '1.875rem',
          fontWeight: 'bold',
          marginBottom: '2rem'
        }}>Deploy Infrastructure</h2>
        <form onSubmit={handleDeploy} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', color: 'white', marginBottom: '0.5rem', fontWeight: '500' }}>Project Name</label>
              <input
                type="text"
                placeholder="my-mlops-project"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: 'white', marginBottom: '0.5rem', fontWeight: '500' }}>Environment</label>
              <select
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '1rem'
                }}
              >
                <option value="">Select Environment</option>
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', color: 'white', marginBottom: '0.5rem', fontWeight: '500' }}>Cloud Provider</label>
              <select
                required
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '1rem'
                }}
              >
                <option value="">Select Provider</option>
                <option value="aws">Amazon Web Services</option>
                <option value="gcp">Google Cloud Platform</option>
                <option value="azure">Microsoft Azure</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: 'white', marginBottom: '0.5rem', fontWeight: '500' }}>Region</label>
              <select
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '1rem'
                }}
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
            <label style={{ display: 'block', color: 'white', marginBottom: '0.5rem', fontWeight: '500' }}>Infrastructure Type</label>
            <select
              required
              value={selectedInfraType}
              onChange={(e) => setSelectedInfraType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '0.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '1rem'
              }}
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
            <label style={{ display: 'block', color: 'white', marginBottom: '0.5rem', fontWeight: '500' }}>Template</label>
            <select
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '0.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '1rem'
              }}
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
            <label style={{ display: 'block', color: 'white', marginBottom: '0.5rem', fontWeight: '500' }}>Description (Optional)</label>
            <textarea
              rows={3}
              placeholder="Describe your infrastructure deployment..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '0.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '1rem',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              type="submit"
              disabled={isDeploying}
              style={{
                background: '#2563eb',
                border: 'none',
                color: 'white',
                fontSize: '1.125rem',
                padding: '0.75rem 2rem',
                borderRadius: '0.375rem',
                cursor: isDeploying ? 'not-allowed' : 'pointer',
                opacity: isDeploying ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto'
              }}
            >
              {isDeploying ? (
                <>
                  <div style={{
                    animation: 'spin 1s linear infinite',
                    borderRadius: '50%',
                    width: '1.25rem',
                    height: '1.25rem',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    marginRight: '0.5rem'
                  }}></div>
                  Deploying...
                </>
              ) : (
                'Deploy Infrastructure'
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Dashboard */}
      {showDashboard && (
        <section id="dashboard" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          margin: '0 2rem',
          maxWidth: '1200px',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginBottom: '4rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <span style={{ fontWeight: '600' }}>EKS Cluster</span>
              <span style={{
                background: '#10b981',
                color: 'white',
                fontSize: '0.75rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px'
              }}>Running</span>
            </div>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>Kubernetes cluster with 3 nodes</p>
            <div style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '9999px',
              height: '0.5rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                height: '0.5rem',
                borderRadius: '9999px',
                width: '100%'
              }}></div>
            </div>
            <div style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.75rem'
            }}>Deployed 5 minutes ago</div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <span style={{ fontWeight: '600' }}>MLflow Server</span>
              <span style={{
                background: '#10b981',
                color: 'white',
                fontSize: '0.75rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px'
              }}>Running</span>
            </div>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>Model tracking and registry</p>
            <div style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '9999px',
              height: '0.5rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                height: '0.5rem',
                borderRadius: '9999px',
                width: '100%'
              }}></div>
            </div>
            <div style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.75rem'
            }}>Deployed 3 minutes ago</div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <span style={{ fontWeight: '600' }}>Jupyter Hub</span>
              <span style={{
                background: '#f59e0b',
                color: 'white',
                fontSize: '0.75rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px'
              }}>Deploying</span>
            </div>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>Multi-user notebook environment</p>
            <div style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '9999px',
              height: '0.5rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                height: '0.5rem',
                borderRadius: '9999px',
                width: '60%'
              }}></div>
            </div>
            <div style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.75rem'
            }}>Started 2 minutes ago</div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <span style={{ fontWeight: '600' }}>Monitoring</span>
              <span style={{
                background: '#10b981',
                color: 'white',
                fontSize: '0.75rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px'
              }}>Running</span>
            </div>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>Prometheus + Grafana stack</p>
            <div style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '9999px',
              height: '0.5rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                height: '0.5rem',
                borderRadius: '9999px',
                width: '100%'
              }}></div>
            </div>
            <div style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.75rem'
            }}>Deployed 8 minutes ago</div>
          </div>
        </section>
      )}
    </div>
  );
}
