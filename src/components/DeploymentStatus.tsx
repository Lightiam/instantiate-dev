
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface DeploymentResult {
  success: boolean;
  deploymentId?: string;
  error?: string;
  resources?: any[];
}

interface DeploymentStatusProps {
  deploymentResult: DeploymentResult;
}

export function DeploymentStatus({ deploymentResult }: DeploymentStatusProps) {
  return (
    <Card className="bg-slate-900 border-slate-700 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          {deploymentResult.success ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}
          <span>Deployment Status</span>
          <Badge variant={deploymentResult.success ? "default" : "destructive"}>
            {deploymentResult.success ? "Success" : "Failed"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {deploymentResult.success ? (
          <div className="space-y-2">
            <p className="text-green-600">Deployment completed successfully!</p>
            {deploymentResult.deploymentId && (
              <p className="text-sm text-muted-foreground">
                Deployment ID: {deploymentResult.deploymentId}
              </p>
            )}
          </div>
        ) : (
          <div>
            <p className="text-red-600">Deployment failed</p>
            {deploymentResult.error && (
              <p className="text-sm text-muted-foreground mt-2">
                Error: {deploymentResult.error}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
