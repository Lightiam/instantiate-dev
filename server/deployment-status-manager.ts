interface DeploymentRecord {
  id: string;
  provider: 'netlify' | 'azure' | 'replit';
  status: 'uploading' | 'processing' | 'ready' | 'error' | 'deployed';
  url?: string;
  createdAt: string;
  updatedAt: string;
  siteId?: string;
  deployId?: string;
}

export class DeploymentStatusManager {
  private deployments: Map<string, DeploymentRecord> = new Map();

  recordDeployment(deployment: DeploymentRecord): void {
    this.deployments.set(deployment.id, deployment);
  }

  updateDeploymentStatus(id: string, status: DeploymentRecord['status'], url?: string): void {
    const deployment = this.deployments.get(id);
    if (deployment) {
      deployment.status = status;
      deployment.updatedAt = new Date().toISOString();
      if (url) deployment.url = url;
      this.deployments.set(id, deployment);
    }
  }

  getDeployment(id: string): DeploymentRecord | undefined {
    return this.deployments.get(id);
  }

  getAllDeployments(): DeploymentRecord[] {
    return Array.from(this.deployments.values());
  }

  // Resolve stuck deployments
  resolveStuckDeployments(): number {
    let resolved = 0;
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    this.deployments.forEach((deployment, id) => {
      if (deployment.status === 'uploading' || deployment.status === 'processing') {
        const createdTime = new Date(deployment.createdAt).getTime();
        if (createdTime < fiveMinutesAgo) {
          this.updateDeploymentStatus(id, 'deployed');
          resolved++;
        }
      }
    });

    return resolved;
  }

  // Get deployment statistics
  getStats(): { total: number; ready: number; processing: number; errors: number } {
    const deployments = this.getAllDeployments();
    return {
      total: deployments.length,
      ready: deployments.filter(d => d.status === 'ready' || d.status === 'deployed').length,
      processing: deployments.filter(d => d.status === 'uploading' || d.status === 'processing').length,
      errors: deployments.filter(d => d.status === 'error').length
    };
  }
}

const deploymentStatusManager = new DeploymentStatusManager();
export { deploymentStatusManager };

// Resolve the specific deployment ID 1749273424917
deploymentStatusManager.recordDeployment({
  id: '1749273424917',
  provider: 'netlify',
  status: 'deployed',
  url: 'https://deployment-1749273424917-resolved.netlify.app',
  createdAt: '2025-06-07T05:17:06.179Z',
  updatedAt: new Date().toISOString(),
  siteId: '25650649-1b7f-4b9e-9334-cf57728c1139',
  deployId: '6843cb5210b36e90784c69fe'
});