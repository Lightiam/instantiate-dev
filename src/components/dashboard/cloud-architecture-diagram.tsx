
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CloudArchitectureDiagram() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cloud Architecture Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-6xl mb-4">🏗️</div>
            <p className="text-muted-foreground">
              Architecture diagram will be displayed here
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
