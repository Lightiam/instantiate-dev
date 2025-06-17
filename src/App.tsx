
import { Route, Switch } from "wouter";
import Landing from "@/pages/landing";
import { Auth } from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import { AuthGuard } from "@/components/AuthGuard";
import { Header } from "@/components/layout/header";
import { NotFound } from "@/pages/not-found";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/auth" component={Auth} />
        <Route path="/dashboard">
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        </Route>
        <Route path="/chat-workspace">
          <AuthGuard>
            <div>Chat Workspace (Protected)</div>
          </AuthGuard>
        </Route>
        <Route path="/iac-workspace">
          <AuthGuard>
            <div>IaC Workspace (Protected)</div>
          </AuthGuard>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

export default App;
