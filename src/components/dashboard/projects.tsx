
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, GitBranch, Clock } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
}

export function Projects() {
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Projects</h2>
          <p className="text-slate-400">Manage your infrastructure projects</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="bg-slate-900 border-slate-700 hover:border-slate-600 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">{project.name}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {project.status}
                </Badge>
              </div>
              {project.description && (
                <CardDescription className="text-slate-400">
                  {project.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-slate-400">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <GitBranch className="w-4 h-4" />
                  <span>main</span>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View
                </Button>
                <Button size="sm" className="flex-1">
                  Deploy
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {projects.length === 0 && (
          <Card className="bg-slate-900 border-slate-700 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Plus className="w-12 h-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No projects yet</h3>
              <p className="text-slate-400 text-center mb-4">
                Create your first project to get started with infrastructure deployment
              </p>
              <Button>Create Project</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
