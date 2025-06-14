import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder } from "lucide-react";

export function Projects() {
  const { data: projects } = useQuery({
    queryKey: ["/api/projects"],
  });

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Your Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {projects?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project: any) => (
                <Card key={project.id} className="bg-slate-950 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Folder className="text-primary w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white">{project.name}</h3>
                        <p className="text-sm text-slate-400 mt-1">{project.description}</p>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-xs text-slate-500">
                            Created {new Date(project.createdAt).toLocaleDateString()}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            project.status === 'active' 
                              ? 'bg-primary/10 text-primary' 
                              : 'bg-slate-500/10 text-slate-500'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Folder className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2 text-white">No Projects Yet</h3>
              <p className="text-slate-400">Create your first project to get started with deployments</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
