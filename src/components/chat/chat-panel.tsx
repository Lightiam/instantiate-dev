
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ChatPanel() {
  return (
    <Card className="w-80 bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">AI Assistant</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-400 text-sm">
          Chat functionality will be available soon.
        </p>
      </CardContent>
    </Card>
  );
}
