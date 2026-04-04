
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
import { Task, TaskStatus } from "@/lib/api-client";

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items: tasks, isLoading } = useAppSelector((state) => state.tasks);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
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
                            (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesStatus = filterStatus === "all" || task.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchQuery, filterStatus]);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'TODO').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      done: tasks.filter(t => t.status === 'DONE').length,
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
              <div className="h-10 w-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">To Do</p>
                <p className="text-xl font-bold">{stats.todo}</p>
              </div>
           </div>
           <div className="bg-card p-4 rounded-xl border shadow-sm flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">In Progress</p>
                <p className="text-xl font-bold">{stats.inProgress}</p>
              </div>
           </div>
           <div className="bg-card p-4 rounded-xl border shadow-sm flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <CheckCircle size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Done</p>
                <p className="text-xl font-bold">{stats.done}</p>
              </div>
           </div>
        </section>

        <section className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search tasks or descriptions..." 
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
                  Status {filterStatus !== "all" && `: ${filterStatus}`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>By Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={filterStatus} onValueChange={(val) => setFilterStatus(val as TaskStatus | "all")}>
                  <DropdownMenuRadioItem value="all">All Statuses</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="TODO">To Do</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="IN_PROGRESS">In Progress</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="DONE">Done</DropdownMenuRadioItem>
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
              <h3 className="text-xl font-semibold">All clear!</h3>
              <p className="text-muted-foreground max-w-xs">
                {searchQuery || filterStatus !== "all" 
                  ? "No tasks match your current filters." 
                  : "You've finished everything. Start a new chapter today!"}
              </p>
              {(searchQuery || filterStatus !== "all") && (
                <Button variant="link" onClick={() => { setSearchQuery(""); setFilterStatus("all"); }}>
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
