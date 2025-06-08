import fetch from 'node-fetch';

interface LinodeDeploymentRequest {
  name: string;
  code: string;
  codeType: 'javascript' | 'python' | 'html';
  region: string;
  service: 'linode' | 'kubernetes' | 'object-storage' | 'nodebalancer';
  environmentVariables?: Record<string, string>;
}

interface LinodeResource {
  id: string;
  name: string;
  type: string;
  region: string;
  status: string;
  cost?: number;
  url?: string;
  createdAt: string;
}

export class LinodeService {
  private token: string;
  private apiUrl = 'https://api.linode.com/v4';

  constructor() {
    this.token = process.env.LINODE_ACCESS_TOKEN || '';
  }

  async deployLinode(spec: LinodeDeploymentRequest): Promise<any> {
    if (!this.token) {
      throw new Error('Linode credentials not configured. Please set LINODE_ACCESS_TOKEN.');
    }

    const linodeName = `${spec.name}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9-]/g, '');

    try {
      const stackScript = await this.createStackScript(spec);
      
      const linodeConfig = {
        label: linodeName,
        region: spec.region || 'us-east',
        type: 'g6-nanode-1', // $5/month Nanode
        image: 'linode/ubuntu20.04',
        root_pass: this.generatePassword(),
        stackscript_id: stackScript.id,
        stackscript_data: {
          app_name: spec.name,
          code_type: spec.codeType
        },
        tags: ['instantiate', 'auto-deployed'],
        private_ip: false,
        backups_enabled: false
      };

      const response = await fetch(`${this.apiUrl}/linode/instances`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(linodeConfig)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create Linode: ${error}`);
      }

      const result: any = await response.json();
      
      return {
        id: result.id.toString(),
        name: linodeName,
        type: 'linode',
        region: spec.region,
        status: 'provisioning',
        url: `https://cloud.linode.com/linodes/${result.id}`,
        createdAt: new Date().toISOString(),
        logs: [`Linode instance ${linodeName} provisioning started`]
      };
    } catch (error: any) {
      throw new Error(`Linode deployment failed: ${error.message}`);
    }
  }

  async deployObjectStorage(spec: LinodeDeploymentRequest): Promise<any> {
    if (!this.token) {
      throw new Error('Linode credentials not configured.');
    }

    const bucketName = `${spec.name}-${Date.now()}`.toLowerCase();

    try {
      const bucketConfig = {
        label: bucketName,
        cluster: spec.region || 'us-east-1'
      };

      const response = await fetch(`${this.apiUrl}/object-storage/buckets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bucketConfig)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create bucket: ${error}`);
      }

      const bucket: any = await response.json();
      
      // Upload index.html for static website
      const objectUrl = `https://${bucket.hostname}/${bucketName}/index.html`;
      
      // Note: In production, use proper S3-compatible client for uploads
      return {
        id: bucket.label,
        name: bucketName,
        type: 'object-storage',
        region: spec.region,
        status: 'active',
        url: `https://${bucket.hostname}`,
        createdAt: new Date().toISOString(),
        logs: [`Linode Object Storage bucket ${bucketName} created`]
      };
    } catch (error: any) {
      throw new Error(`Linode Object Storage deployment failed: ${error.message}`);
    }
  }

  async listResources(): Promise<LinodeResource[]> {
    if (!this.token) {
      return [];
    }

    const resources: LinodeResource[] = [];

    try {
      // List Linode instances
      const instancesResponse = await fetch(`${this.apiUrl}/linode/instances`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });

      if (instancesResponse.ok) {
        const instances: any = await instancesResponse.json();
        
        instances.data?.forEach((instance: any) => {
          if (instance.tags?.includes('instantiate')) {
            resources.push({
              id: instance.id.toString(),
              name: instance.label,
              type: 'linode',
              region: instance.region,
              status: instance.status,
              url: `http://${instance.ipv4?.[0]}`,
              createdAt: instance.created
            });
          }
        });
      }

      // List Object Storage buckets
      const bucketsResponse = await fetch(`${this.apiUrl}/object-storage/buckets`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });

      if (bucketsResponse.ok) {
        const buckets: any = await bucketsResponse.json();
        
        buckets.data?.forEach((bucket: any) => {
          if (bucket.label.includes('instantiate') || bucket.label.includes('deploy')) {
            resources.push({
              id: bucket.label,
              name: bucket.label,
              type: 'object-storage',
              region: bucket.cluster,
              status: 'active',
              url: `https://${bucket.hostname}`,
              createdAt: bucket.created
            });
          }
        });
      }

      // List Kubernetes clusters
      const clustersResponse = await fetch(`${this.apiUrl}/lke/clusters`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });

      if (clustersResponse.ok) {
        const clusters: any = await clustersResponse.json();
        
        clusters.data?.forEach((cluster: any) => {
          if (cluster.tags?.includes('instantiate')) {
            resources.push({
              id: cluster.id.toString(),
              name: cluster.label,
              type: 'kubernetes',
              region: cluster.region,
              status: cluster.status,
              createdAt: cluster.created
            });
          }
        });
      }
    } catch (error: any) {
      console.error('Error listing Linode resources:', error.message);
    }

    return resources;
  }

  async getResourceStatus(resourceId: string, resourceType: string): Promise<any> {
    if (!this.token) {
      throw new Error('Linode credentials not configured.');
    }

    try {
      if (resourceType === 'linode') {
        const response = await fetch(`${this.apiUrl}/linode/instances/${resourceId}`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        
        if (response.ok) {
          const data: any = await response.json();
          return {
            status: data.status,
            ipv4: data.ipv4,
            ipv6: data.ipv6,
            type: data.type,
            region: data.region,
            specs: data.specs
          };
        }
      } else if (resourceType === 'object-storage') {
        const response = await fetch(`${this.apiUrl}/object-storage/buckets/${resourceId}`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        
        if (response.ok) {
          const data: any = await response.json();
          return {
            status: 'active',
            cluster: data.cluster,
            hostname: data.hostname,
            size: data.size
          };
        }
      } else if (resourceType === 'kubernetes') {
        const response = await fetch(`${this.apiUrl}/lke/clusters/${resourceId}`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        
        if (response.ok) {
          const data: any = await response.json();
          return {
            status: data.status,
            k8s_version: data.k8s_version,
            region: data.region,
            control_plane: data.control_plane
          };
        }
      }
    } catch (error: any) {
      return { status: 'error', error: error.message };
    }
  }

  private async createStackScript(spec: LinodeDeploymentRequest): Promise<any> {
    const stackScriptLabel = `instantiate-${spec.name}-${Date.now()}`;
    const script = this.generateStackScript(spec);

    const stackScriptConfig = {
      label: stackScriptLabel,
      description: `StackScript for ${spec.name} deployment via Instantiate`,
      images: ['linode/ubuntu20.04'],
      script: script,
      is_public: false
    };

    const response = await fetch(`${this.apiUrl}/linode/stackscripts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stackScriptConfig)
    });

    if (!response.ok) {
      throw new Error(`Failed to create StackScript: ${response.statusText}`);
    }

    return await response.json();
  }

  private generateStackScript(spec: LinodeDeploymentRequest): string {
    return `#!/bin/bash

# Update system
apt-get update && apt-get upgrade -y

# Install nginx
apt-get install -y nginx

# Create application directory
mkdir -p /var/www/${spec.name}

# Create index.html
cat > /var/www/${spec.name}/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>${spec.name} - Linode Deployment</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; }
        .status { background: #e8f5e8; padding: 10px; border-radius: 4px; margin: 20px 0; }
        pre { background: #f8f8f8; padding: 15px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 ${spec.name}</h1>
        <div class="status">✅ Deployed successfully on Linode</div>
        <p><strong>Deployment Type:</strong> ${spec.codeType}</p>
        <p><strong>Created:</strong> $(date)</p>
        <h3>Application Code:</h3>
        <pre>${spec.code}</pre>
        <hr>
        <p><small>Powered by Instantiate Multi-Cloud Platform</small></p>
    </div>
</body>
</html>
EOF

# Configure nginx
cat > /etc/nginx/sites-available/${spec.name} << 'EOF'
server {
    listen 80;
    server_name _;
    root /var/www/${spec.name};
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/${spec.name} /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Restart nginx
systemctl restart nginx
systemctl enable nginx

# Configure firewall
ufw allow 'Nginx Full'
ufw allow ssh
ufw --force enable

echo "Deployment completed successfully!"
`;
  }

  private generatePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}

export const linodeService = new LinodeService();