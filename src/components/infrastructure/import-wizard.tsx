import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  ArrowRight, 
  Upload, 
  Scan, 
  Settings, 
  Download,
  AlertTriangle,
  Info
} from "lucide-react";

interface ImportStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  details?: string[];
}

export function ImportWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importType] = useState('terraform');

  const [steps, setSteps] = useState<ImportStep[]>([
    {
      id: 'scan',
      title: 'Scan Infrastructure',
      description: 'Analyzing existing configuration and resources',
      status: 'active',
      details: [
        'Scanning Terraform state files',
        'Identifying resource dependencies',
        'Analyzing provider configurations'
      ]
    },
    {
      id: 'validate',
      title: 'Validate Configuration',
      description: 'Checking compatibility and potential issues',
      status: 'pending',
      details: [
        'Validating resource types',
        'Checking naming conventions',
        'Identifying unsupported features'
      ]
    },
    {
      id: 'convert',
      title: 'Convert & Optimize',
      description: 'Converting to Instantiate format and optimizing',
      status: 'pending',
      details: [
        'Converting to universal format',
        'Optimizing resource allocation',
        'Adding monitoring capabilities'
      ]
    },
    {
      id: 'review',
      title: 'Review Changes',
      description: 'Review converted configuration before deployment',
      status: 'pending',
      details: [
        'Configuration diff review',
        'Security policy validation',
        'Cost impact analysis'
      ]
    },
    {
      id: 'deploy',
      title: 'Deploy Infrastructure',
      description: 'Deploy the converted infrastructure',
      status: 'pending',
      details: [
        'Creating deployment plan',
        'Applying infrastructure changes',
        'Verifying deployment status'
      ]
    }
  ]);

  const handleNextStep = async () => {
    if (currentStep < steps.length - 1) {
      setIsProcessing(true);
      
      const newSteps = [...steps];
      newSteps[currentStep].status = 'completed';
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const nextStep = currentStep + 1;
      newSteps[nextStep].status = 'active';
      
      setSteps(newSteps);
      setCurrentStep(nextStep);
      setIsProcessing(false);
    }
  };

  const getStepIcon = (step: ImportStep, index: number) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'active':
        return (
          <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {index + 1}
          </div>
        );
      case 'error':
        return <AlertTriangle className="w-6 h-6 text-red-400" />;
      default:
        return (
          <div className="w-6 h-6 bg-blue-700 rounded-full flex items-center justify-center text-cyan-300 text-sm">
            {index + 1}
          </div>
        );
    }
  };

  const getProgressPercentage = () => {
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    return (completedSteps / steps.length) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cyan-400">Infrastructure Import Wizard</h2>
          <p className="text-cyan-300">Step-by-step infrastructure import and conversion</p>
        </div>
        <Badge variant="outline" className="text-cyan-400 border-cyan-400 capitalize">
          {importType} Import
        </Badge>
      </div>

      <Card className="bg-blue-950 border-blue-800">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Import Progress</span>
              <span className="text-cyan-400">{Math.round(getProgressPercentage())}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="bg-blue-950 border-blue-800">
            <CardHeader>
              <CardTitle className="text-cyan-400">Import Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-start space-x-3">
                    {getStepIcon(step, index)}
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        step.status === 'active' ? 'text-cyan-400' : 
                        step.status === 'completed' ? 'text-green-400' : 
                        step.status === 'error' ? 'text-red-400' : 'text-white'
                      }`}>
                        {step.title}
                      </h4>
                      <p className="text-sm text-cyan-300">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="bg-blue-950 border-blue-800">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center space-x-2">
                {getStepIcon(steps[currentStep], currentStep)}
                <span>{steps[currentStep].title}</span>
              </CardTitle>
              <CardDescription className="text-cyan-300">
                {steps[currentStep].description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h4 className="font-medium text-white">Current Operations</h4>
                <div className="space-y-2">
                  {steps[currentStep].details?.map((detail, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      {steps[currentStep].status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : steps[currentStep].status === 'active' ? (
                        <div className="w-4 h-4 bg-cyan-500 rounded-full animate-pulse" />
                      ) : (
                        <div className="w-4 h-4 bg-blue-700 rounded-full" />
                      )}
                      <span className="text-sm text-cyan-300">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-blue-800" />

              {currentStep === 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-900 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Scan className="w-5 h-5 text-cyan-400" />
                        <span className="font-medium text-white">Resources Found</span>
                      </div>
                      <div className="text-2xl font-bold text-cyan-400">47</div>
                      <div className="text-xs text-cyan-300">Across 3 providers</div>
                    </div>
                    <div className="bg-blue-900 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Settings className="w-5 h-5 text-cyan-400" />
                        <span className="font-medium text-white">Dependencies</span>
                      </div>
                      <div className="text-2xl font-bold text-cyan-400">12</div>
                      <div className="text-xs text-cyan-300">Resource dependencies</div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-800 rounded-lg">
                      <span className="text-green-300">Compatible Resources</span>
                      <Badge className="bg-green-600">45/47</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg">
                      <span className="text-yellow-300">Requires Review</span>
                      <Badge className="bg-yellow-600">2/47</Badge>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="bg-blue-900 p-4 rounded-lg space-y-3">
                    <h5 className="font-medium text-white">Conversion Summary</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-cyan-300">Format:</span>
                        <span className="text-white ml-2">Universal IaC</span>
                      </div>
                      <div>
                        <span className="text-cyan-300">Optimization:</span>
                        <span className="text-white ml-2">15% cost reduction</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-blue-900 rounded-lg">
                    <Info className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-white font-medium">Ready for Review</p>
                      <p className="text-sm text-cyan-300">Configuration has been converted and optimized</p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="bg-blue-900 p-4 rounded-lg">
                    <h5 className="font-medium text-white mb-3">Deployment Plan</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-cyan-300">Resources to create:</span>
                        <span className="text-white">47</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cyan-300">Estimated time:</span>
                        <span className="text-white">8-12 minutes</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  disabled={currentStep === 0}
                  className="border-blue-500 text-blue-400"
                >
                  Previous
                </Button>
                
                <div className="flex items-center space-x-2">
                  {currentStep === steps.length - 1 ? (
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Upload className="w-4 h-4 mr-2" />
                      Deploy Infrastructure
                    </Button>
                  ) : currentStep === 3 ? (
                    <Button 
                      onClick={handleNextStep}
                      disabled={isProcessing}
                      className="bg-cyan-600 hover:bg-cyan-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isProcessing ? 'Processing...' : 'Download Config'}
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleNextStep}
                      disabled={isProcessing}
                      className="bg-cyan-600 hover:bg-cyan-700"
                    >
                      {isProcessing ? 'Processing...' : 'Continue'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}