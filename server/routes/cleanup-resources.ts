import { Router } from 'express';
import { netlifyDeploymentService } from '../netlify-deployment-service';

const router = Router();

// Clean up old/unused deployments
router.delete('/cleanup/netlify', async (req, res) => {
  try {
    const deployments = await netlifyDeploymentService.listDeployments();
    const toDelete = deployments.filter(d => 
      d.name.includes('netlify-app-') || 
      d.name.includes('deployment-') ||
      d.name.includes('instantiate-') ||
      d.name === 'afroconnectng' ||
      d.name === 'instat8'
    );

    const results = [];
    for (const deployment of toDelete) {
      try {
        await netlifyDeploymentService.deleteDeployment(deployment.id);
        results.push({ id: deployment.id, name: deployment.name, status: 'deleted' });
      } catch (error) {
        results.push({ id: deployment.id, name: deployment.name, status: 'failed', error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Cleaned up ${results.filter(r => r.status === 'deleted').length} deployments`,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Remove all old deployments
router.delete('/cleanup/all', async (req, res) => {
  try {
    const deployments = await netlifyDeploymentService.listDeployments();
    const results = [];
    
    for (const deployment of deployments) {
      try {
        await netlifyDeploymentService.deleteDeployment(deployment.id);
        results.push({ id: deployment.id, name: deployment.name, status: 'deleted' });
      } catch (error) {
        results.push({ id: deployment.id, name: deployment.name, status: 'failed', error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Cleaned up ${results.filter(r => r.status === 'deleted').length} deployments`,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export { router as cleanupRoutes };