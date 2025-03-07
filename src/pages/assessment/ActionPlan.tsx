
import { useState } from "react";
import { UserLayout } from "@/components/user/UserLayout";
import { AssessmentBase } from "@/components/assessment/AssessmentBase";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Trash, CalendarIcon, ArrowRight, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ActionItem {
  id: string;
  category: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  targetDate: Date | null;
  status: 'not-started' | 'in-progress' | 'completed';
  responsible: string;
}

export default function ActionPlan() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Sample categories
  const categories = [
    "Environmental", "Social", "Governance", "Carbon Reduction", "Resource Efficiency", "Stakeholder Engagement"
  ];
  
  // Initial actions
  const [actions, setActions] = useState<ActionItem[]>([
    {
      id: '1',
      category: 'Carbon Reduction',
      title: 'Reduce energy consumption by 15%',
      description: 'Implement energy efficiency measures across all facilities',
      priority: 'high',
      targetDate: new Date(2023, 11, 31),
      status: 'in-progress',
      responsible: 'Operations Team'
    },
    {
      id: '2',
      category: 'Social',
      title: 'Implement diversity training program',
      description: 'Develop and roll out diversity and inclusion training for all staff',
      priority: 'medium',
      targetDate: new Date(2023, 9, 15),
      status: 'not-started',
      responsible: 'HR Department'
    },
    {
      id: '3',
      category: 'Governance',
      title: 'Update ESG reporting procedures',
      description: 'Align reporting with latest sustainability standards',
      priority: 'high',
      targetDate: new Date(2023, 10, 30),
      status: 'not-started',
      responsible: 'Compliance Team'
    }
  ]);
  
  // New action form state
  const [newAction, setNewAction] = useState<Omit<ActionItem, 'id'>>({
    category: '',
    title: '',
    description: '',
    priority: 'medium',
    targetDate: null,
    status: 'not-started',
    responsible: ''
  });
  
  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewAction(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setNewAction(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (date: Date | undefined) => {
    setNewAction(prev => ({ ...prev, targetDate: date || null }));
  };
  
  const handleAddAction = () => {
    if (!newAction.title || !newAction.category) return;
    
    const newId = (actions.length + 1).toString();
    setActions(prev => [...prev, { ...newAction, id: newId }]);
    
    // Reset form
    setNewAction({
      category: '',
      title: '',
      description: '',
      priority: 'medium',
      targetDate: null,
      status: 'not-started',
      responsible: ''
    });
  };
  
  const handleDeleteAction = (id: string) => {
    setActions(prev => prev.filter(action => action.id !== id));
  };
  
  const handleUpdateStatus = (id: string, status: ActionItem['status']) => {
    setActions(prev => prev.map(action => 
      action.id === id ? { ...action, status } : action
    ));
  };
  
  // Get counts by status
  const statusCounts = actions.reduce((acc, action) => {
    acc[action.status] = (acc[action.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const totalActions = actions.length;
  const completedActions = statusCounts['completed'] || 0;
  const inProgressActions = statusCounts['in-progress'] || 0;
  const notStartedActions = statusCounts['not-started'] || 0;
  
  const progressPercentage = totalActions === 0 ? 0 : Math.round((completedActions / totalActions) * 100);
  
  // Filter actions for current view
  const [filterStatus, setFilterStatus] = useState<ActionItem['status'] | 'all'>('all');
  
  const filteredActions = filterStatus === 'all' 
    ? actions 
    : actions.filter(action => action.status === filterStatus);
  
  return (
    <UserLayout title={t("assessment.actionPlan.title")}>
      <div className="mb-6">
        <Link to="/assessment" className="text-primary hover:underline flex items-center mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Assessment
        </Link>
        <p className="text-gray-600">
          {t("assessment.actionPlan.description")}
        </p>
      </div>
      
      <AssessmentBase 
        title={t("assessment.actionPlan.title")} 
        description={t("assessment.actionPlan.description")}
        status="in-progress"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="actions">Action Items</TabsTrigger>
            <TabsTrigger value="add">Add New Action</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Total Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{totalActions}</div>
                  <p className="text-sm text-muted-foreground">Action items planned</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Overall Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{progressPercentage}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed</span>
                      <span className="text-sm font-medium">{completedActions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">In Progress</span>
                      <span className="text-sm font-medium">{inProgressActions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Not Started</span>
                      <span className="text-sm font-medium">{notStartedActions}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Actions</CardTitle>
                <CardDescription>Your most recently added action items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {actions.slice(0, 3).map(action => (
                    <div key={action.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{action.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                        </div>
                        <div className={`text-xs rounded-full px-2 py-1 ${
                          action.priority === 'high' ? 'bg-red-100 text-red-800' : 
                          action.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {action.priority}
                        </div>
                      </div>
                      <div className="flex items-center mt-4 text-xs text-muted-foreground">
                        <div className="mr-4">
                          <span className="font-medium">Category:</span> {action.category}
                        </div>
                        <div className="mr-4">
                          <span className="font-medium">Status:</span> {action.status.replace('-', ' ')}
                        </div>
                        {action.targetDate && (
                          <div>
                            <span className="font-medium">Target:</span> {format(action.targetDate, 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab("actions")}>
                  View All Actions
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="actions" className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <Button 
                variant={filterStatus === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All
              </Button>
              <Button 
                variant={filterStatus === 'not-started' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilterStatus('not-started')}
              >
                Not Started
              </Button>
              <Button 
                variant={filterStatus === 'in-progress' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilterStatus('in-progress')}
              >
                In Progress
              </Button>
              <Button 
                variant={filterStatus === 'completed' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilterStatus('completed')}
              >
                Completed
              </Button>
            </div>
            
            <div className="space-y-4">
              {filteredActions.map(action => (
                <Card key={action.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <div className={`text-xs rounded-full px-2 py-1 ${
                        action.priority === 'high' ? 'bg-red-100 text-red-800' : 
                        action.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {action.priority}
                      </div>
                    </div>
                    <CardDescription>{action.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{action.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Responsible:</p>
                        <p className="text-muted-foreground">{action.responsible}</p>
                      </div>
                      <div>
                        <p className="font-medium">Target Date:</p>
                        <p className="text-muted-foreground">
                          {action.targetDate ? format(action.targetDate, 'MMM d, yyyy') : 'Not set'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm">Status:</p>
                      <Select 
                        value={action.status} 
                        onValueChange={(value) => handleUpdateStatus(action.id, value as ActionItem['status'])}
                      >
                        <SelectTrigger className="w-[140px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not-started">Not Started</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteAction(action.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              
              {filteredActions.length === 0 && (
                <div className="text-center py-12 border rounded-lg">
                  <p className="text-muted-foreground">No actions found</p>
                  <Button className="mt-4" onClick={() => setActiveTab("add")}>
                    Add New Action
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="add" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add New Action Item</CardTitle>
                <CardDescription>Create a new sustainability action item for your plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title</label>
                      <Input 
                        name="title"
                        value={newAction.title}
                        onChange={handleInputChange}
                        placeholder="Action title"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <Select
                        value={newAction.category}
                        onValueChange={(value) => handleSelectChange('category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea 
                      name="description"
                      value={newAction.description}
                      onChange={handleInputChange}
                      placeholder="Detailed description of the action"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Priority</label>
                      <Select
                        value={newAction.priority}
                        onValueChange={(value) => handleSelectChange('priority', value as ActionItem['priority'])}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Target Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !newAction.targetDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newAction.targetDate ? format(newAction.targetDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newAction.targetDate || undefined}
                            onSelect={handleDateChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Responsible Party</label>
                      <Input 
                        name="responsible"
                        value={newAction.responsible}
                        onChange={handleInputChange}
                        placeholder="Person or team responsible"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("actions")}>
                  Cancel
                </Button>
                <Button onClick={handleAddAction}>
                  <Plus className="h-4 w-4 mr-2" /> Add Action
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </AssessmentBase>
    </UserLayout>
  );
}
