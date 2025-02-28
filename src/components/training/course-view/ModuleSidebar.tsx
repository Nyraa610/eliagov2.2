
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { Module, ContentItem } from "@/types/training";

interface ModuleSidebarProps {
  modules: Module[];
  contentItems: ContentItem[];
  currentModule: Module | null;
  currentContent: ContentItem | null;
  completedModuleIds: string[];
  completedContentIds: string[];
  onModuleSelect: (module: Module) => void;
  onContentSelect: (content: ContentItem) => void;
  getContentTypeIcon: (type: string) => JSX.Element;
}

export const ModuleSidebar = ({
  modules,
  contentItems,
  currentModule,
  currentContent,
  completedModuleIds,
  completedContentIds,
  onModuleSelect,
  onContentSelect,
  getContentTypeIcon
}: ModuleSidebarProps) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Course Modules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {modules.map((module, index) => (
              <div 
                key={module.id}
                className={`flex items-center p-2 border rounded-md cursor-pointer ${
                  currentModule?.id === module.id ? 'bg-primary/10 border-primary' : ''
                }`}
                onClick={() => onModuleSelect(module)}
              >
                <div className="mr-3 bg-muted w-8 h-8 rounded-full flex items-center justify-center">
                  {completedModuleIds.includes(module.id) ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{module.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {currentModule && (
        <Card>
          <CardHeader>
            <CardTitle>Module Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {contentItems.map((content) => (
                <div 
                  key={content.id}
                  className={`flex items-center p-2 border rounded-md cursor-pointer ${
                    currentContent?.id === content.id ? 'bg-primary/10 border-primary' : ''
                  }`}
                  onClick={() => onContentSelect(content)}
                >
                  <div className="mr-3 flex items-center justify-center">
                    {completedContentIds.includes(content.id) ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      getContentTypeIcon(content.content_type)
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{content.title}</h3>
                    <p className="text-xs text-muted-foreground capitalize">
                      {content.content_type}
                    </p>
                  </div>
                </div>
              ))}

              {contentItems.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No content available for this module.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
