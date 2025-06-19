
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Play, Zap } from 'lucide-react';

interface GeneratedCode {
  terraform: string;
  description: string;
  resourceType: string;
  detectedProvider?: string;
}

interface CodeDisplayProps {
  generatedCode: GeneratedCode;
  isDeploying: boolean;
  onDeploy: () => void;
  onDownload: () => void;
}

export function CodeDisplay({ generatedCode, isDeploying, onDeploy, onDownload }: CodeDisplayProps) {
  return (
    <Card className="bg-slate-900 border-slate-700 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <span>Generated Infrastructure Code</span>
          <div className="flex space-x-2">
            {generatedCode.detectedProvider && (
              <Badge variant="secondary" className="mr-2">
                {generatedCode.detectedProvider.toUpperCase()}
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button 
              size="sm" 
              onClick={onDeploy}
              disabled={isDeploying}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isDeploying ? (
                <>
                  <Zap className="h-4 w-4 mr-1 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Deploy to {generatedCode.detectedProvider?.toUpperCase() || 'Cloud'}
                </>
              )}
            </Button>
          </div>
        </CardTitle>
        <CardDescription className="text-slate-400">{generatedCode.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="bg-slate-950 p-4 rounded-md overflow-x-auto text-sm border border-slate-700">
          <code className="text-slate-200">{generatedCode.terraform}</code>
        </pre>
      </CardContent>
    </Card>
  );
}
