
import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Settings, Play, Download, Copy, X } from "lucide-react"

interface TerraformVariable {
  name: string
  type: 'string' | 'number' | 'list(string)'
  value: string | number
  required: boolean
}

interface CostEstimate {
  name: string
  monthlyQty: number
  unit: string
  monthlyCost: number
}

export function DeploymentConfig() {
  const [selectedModule, setSelectedModule] = React.useState("infralight/well-architected-env")
  const [subModule, setSubModule] = React.useState("modules/ha_secured_instances")
  const [variables, setVariables] = React.useState<TerraformVariable[]>([
    { name: 'cluster_size', type: 'number', value: 15, required: true },
    { name: 'instance_name', type: 'string', value: 'pro-prod', required: true },
    { name: 'instance_type', type: 'string', value: 'XLARGE', required: true },
    { name: 'ssh_allowed_keys', type: 'list(string)', value: '', required: false },
    { name: 'cpu_core_count', type: 'number', value: 2, required: false }
  ])
  
  const [costEstimates] = React.useState<CostEstimate[]>([
    { name: 'aws_ebs_volume.this', monthlyQty: 1, unit: 'GB', monthlyCost: 0.11 },
    { name: 'aws_ebs_volume.this', monthlyQty: 730, unit: 'hours', monthlyCost: 70.08 }
  ])

  const [generatedConfig, setGeneratedConfig] = React.useState("")

  React.useEffect(() => {
    generateTerraformConfig()
  }, [variables, selectedModule, subModule])

  const generateTerraformConfig = () => {
    const config = `module "ha_secured_instances" {
  source = "github.com/infralight/well-architected-env/modules/ha_secured_instances"
  
${variables.map(v => `  ${v.name} = ${v.type === 'string' ? `"${v.value}"` : v.value}`).join('\n')}
}`
    setGeneratedConfig(config)
  }

  const updateVariable = (index: number, value: string | number) => {
    const updatedVariables = [...variables]
    updatedVariables[index].value = value
    setVariables(updatedVariables)
  }

  const totalMonthlyCost = costEstimates.reduce((sum, item) => sum + item.monthlyCost, 0)

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(generatedConfig)
  }

  const handleExportConfig = () => {
    const blob = new Blob([generatedConfig], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'terraform-config.tf'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Generate new configuration</h1>
          </div>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
                    <span className="text-xs font-bold">#</span>
                  </div>
                  <span>Select module</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Select value={selectedModule} onValueChange={setSelectedModule}>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="infralight/well-architected-env">infralight/well-architected-env</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={subModule} onValueChange={setSubModule}>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="modules/ha_secured_instances">modules/ha_secured_instances</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
                    <span className="text-xs font-bold">⚙</span>
                  </div>
                  <span>Terraform variables</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {variables.map((variable, index) => (
                  <div key={variable.name} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full ${variable.required ? 'bg-blue-500' : 'bg-gray-500'}`}>
                        <div className="w-2 h-2 bg-white rounded-full m-1"></div>
                      </div>
                      <Badge variant="secondary" className="bg-purple-600 text-white">
                        {variable.type}
                      </Badge>
                      <Label className="text-white">{variable.name}</Label>
                    </div>
                    {variable.type === 'list(string)' ? (
                      <Textarea
                        value={variable.value}
                        onChange={(e) => updateVariable(index, e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="[]"
                      />
                    ) : variable.name === 'instance_type' ? (
                      <Select 
                        value={variable.value as string} 
                        onValueChange={(value) => updateVariable(index, value)}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="SMALL">SMALL</SelectItem>
                          <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                          <SelectItem value="LARGE">LARGE</SelectItem>
                          <SelectItem value="XLARGE">XLARGE</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={variable.type === 'number' ? 'number' : 'text'}
                        value={variable.value}
                        onChange={(e) => updateVariable(index, variable.type === 'number' ? Number(e.target.value) : e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Generated Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm">
                  <pre className="text-gray-300 whitespace-pre-wrap">{generatedConfig}</pre>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Cost Estimation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-400 border-b border-slate-600 pb-2">
                    <span>Name</span>
                    <span>Monthly Qty</span>
                    <span>Unit</span>
                    <span>Monthly cost</span>
                  </div>
                  {costEstimates.map((estimate, index) => (
                    <div key={index} className="grid grid-cols-4 gap-4 text-sm text-gray-300">
                      <span className="font-mono">{estimate.name}</span>
                      <span>{estimate.monthlyQty}</span>
                      <span>{estimate.unit}</span>
                      <span>${estimate.monthlyCost.toFixed(2)}</span>
                    </div>
                  ))}
                  <Separator className="bg-slate-600" />
                  <div className="flex justify-between items-center">
                    <span className="text-purple-400 font-medium">Overall Total</span>
                    <div className="border border-green-500 rounded px-3 py-1">
                      <span className="text-green-400 font-bold">${totalMonthlyCost.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                onClick={handleCopyConfig}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button 
                variant="outline"
                onClick={handleExportConfig}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Play className="w-4 h-4 mr-2" />
                Pull request
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
