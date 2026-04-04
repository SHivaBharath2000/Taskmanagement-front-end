
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Filter, 
  LogOut, 
  CheckCircle2, 
  LayoutList, 
  LayoutGrid,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { TaskItem } from "@/components/dashboard/task-item";
import { TaskDialog } from "@/components/dashboard/task-dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchTasks } from "@/lib/features/tasks/tasks-slice";
import { logout, checkAuth } from "@/lib/features/auth/auth-slice";
import { Task } from "@/lib/api-client";

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items: tasks, isLoading } = useAppSelector((state) => state.tasks);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login");
    } else if (mounted && isAuthenticated) {
      dispatch(fetchTasks());
    }
  }, [isAuthenticated, router, dispatch, mounted]);

  const handleLogout = async () => {
    await dispatch(logout());
    router.push("/login");
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingTask(null);
    setIsDialogOpen(true);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            task.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, filterPriority]);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      highPriority: tasks.filter(t => t.priority === "high" && t.status === 'pending').length,
    };
  }, [tasks]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-sm">
              <CheckCircle2 size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary hidden sm:inline-block">Nexus Tasks</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground mr-4">
               <TrendingUp className="h-4 w-4 text-accent" />
               <span>Welcome back, {user?.name || 'User'}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           <div className="bg-card p-4 rounded-xl border shadow-sm flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <LayoutList size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
           </div>
           <div className="bg-card p-4 rounded-xl border shadow-sm flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <CheckCircle size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Done</p>
                <p className="text-xl font-bold">{stats.completed}</p>
              </div>
           </div>
           <div className="bg-card p-4 rounded-xl border shadow-sm flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Pending</p>
                <p className="text-xl font-bold">{stats.pending}</p>
              </div>
           </div>
           <div className="bg-card p-4 rounded-xl border shadow-sm flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <AlertCircle size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Urgent</p>
                <p className="text-xl font-bold">{stats.highPriority}</p>
              </div>
           </div>
        </section>

        <section className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search tasks, descriptions, or categories..." 
              className="pl-10 h-10 bg-card"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-1 md:flex-none">
                  <Filter className="mr-2 h-4 w-4" /> 
                  Filter {filterPriority !== "all" && `: ${filterPriority}`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>By Priority</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={filterPriority} onValueChange={setFilterPriority}>
                  <DropdownMenuRadioItem value="all">All Priorities</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="high">High Priority</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="medium">Medium Priority</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="low">Low Priority</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden sm:flex border rounded-md p-1 bg-muted/20">
              <Button 
                variant={viewMode === "list" ? "secondary" : "ghost"} 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setViewMode("list")}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === "grid" ? "secondary" : "ghost"} 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>

            <Button onClick={handleCreate} className="flex-1 md:flex-none bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="mr-2 h-4 w-4" /> New Task
            </Button>
          </div>
        </section>

        <Separator />

        <section className="min-h-[400px]">
          {isLoading ? (
            <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse">Synchronizing your tasks...</p>
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className={cn(
              "grid gap-4 transition-all",
              viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}>
              {filteredTasks.map((task) => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onEdit={handleEdit}
                />
              ))}
            </div>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground/30 mb-2">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-xl font-semibold">All caught up!</h3>
              <p className="text-muted-foreground max-w-xs">
                {searchQuery || filterPriority !== "all" 
                  ? "No tasks match your current filters. Try clearing them to see more." 
                  : "You've finished all your tasks for today. Time to relax or create a new one!"}
              </p>
              {(searchQuery || filterPriority !== "all") && (
                <Button variant="link" onClick={() => { setSearchQuery(""); setFilterPriority("all"); }}>
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </section>
      </main>

      <TaskDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        task={editingTask} 
      />
      
      <footer className="py-6 border-t mt-auto">
        <div className="container max-w-7xl mx-auto px-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Nexus Tasks. Built for professionals.
        </div>
      </footer>
    </div>
  );
}
