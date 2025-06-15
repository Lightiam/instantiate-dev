
import { useQuery } from "@tanstack/react-query";

interface CloudResource {
  id: string;
  name: string;
  type: string;
  provider: string;
  region: string;
  status: string;
  cost?: number;
  createdAt: string;
}

export function IsometricCloudDiagram() {
  const { data: resources = [] } = useQuery<CloudResource[]>({
    queryKey: ["/api/multi-cloud/resources"],
  });

  const activeResources = resources.filter(r => r.status === 'running' || r.status === 'active');
  const selectedResource = activeResources.find(r => r.id === 'selected') || activeResources[0];
  
  const azureResources = activeResources.filter(r => r.provider === 'azure');
  const awsResources = activeResources.filter(r => r.provider === 'aws');
  const gcpResources = activeResources.filter(r => r.provider === 'gcp');
  
  const totalCost = activeResources.reduce((sum, resource) => sum + (resource.cost || 0), 0);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Cloud Infrastructure Overview</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-2">Active Resources</h4>
          <div className="text-2xl font-bold text-white">{activeResources.length}</div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-2">Monthly Cost</h4>
          <div className="text-2xl font-bold text-white">${totalCost.toFixed(2)}</div>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Azure Resources</span>
          <span className="text-white">{azureResources.length}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">AWS Resources</span>
          <span className="text-white">{awsResources.length}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">GCP Resources</span>
          <span className="text-white">{gcpResources.length}</span>
        </div>
      </div>
      
      {selectedResource && (
        <div className="mt-4 p-3 bg-slate-800 rounded">
          <h5 className="text-sm font-medium text-white">{selectedResource.name}</h5>
          <p className="text-xs text-slate-400">{selectedResource.type} in {selectedResource.region}</p>
        </div>
      )}
    </div>
  );
}
