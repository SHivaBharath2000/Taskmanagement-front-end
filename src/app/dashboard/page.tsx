"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, Search, Filter, LogOut, CheckCircle2, 
  LayoutList, LayoutGrid, TrendingUp, Clock, CheckCircle, Loader2 
} from "lucide-react";

import { TaskItem } from "@/components/dashboard/task-item";
import { TaskDialog } from "@/components/dashboard/task-dialog";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { loadTasks } from "@/lib/features/tasks/tasks-slice";
import { logout, syncAuth } from "@/lib/features/auth/auth-slice";
import { Task } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Get tasks and user data from Redux store
  const { items: tasks, loading, error: tasksError } = useAppSelector((state) => state.tasks);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Local state for UI (search, filters, and modals)
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); 
  const [view, setView] = useState("grid");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Use toast for errors
  const { toast } = useToast();

  // Run once when component loads to sync auth
  useEffect(() => {
    setIsMounted(true);
    dispatch(syncAuth());
  }, [dispatch]);

  // If not logged in, send user to login page. Otherwise, load tasks.
  useEffect(() => {
    if (isMounted) {
      if (!isAuthenticated) {
        router.push("/login");
      } else {
        dispatch(loadTasks());
      }
    }
  }, [isMounted, isAuthenticated, router, dispatch]);

  // Show toast if tasks fail to load
  useEffect(() => {
    if (tasksError) {
      toast({
        title: "Error loading tasks",
        description: tasksError,
        variant: "destructive",
      });
    }
  }, [tasksError, toast]);

  // Log out the user and redirect
  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  // Open the popup for creating or editing a task
  const openTaskEditor = (task: Task | null = null) => {
    setActiveTask(task);
    setIsDialogOpen(true);
  };

  // Logic to filter tasks based on search text and status
  const filteredTasks = useMemo(() => {
    // Safety check: ensure tasks is an array to avoid errors
    const tasksArray = Array.isArray(tasks) ? tasks : [];

    return tasksArray.filter((task) => {
      const searchText = search.toLowerCase();
      const taskTitle = task.title.toLowerCase();
      const taskDesc = (task.description || "").toLowerCase();

      // Check if search text matches title or description
      const isMatch = taskTitle.includes(searchText) || taskDesc.includes(searchText);
      
      // Check if status matches the selected filter
      const isStatusMatch = filter === "all" || task.status === filter;

      return isMatch && isStatusMatch;
    });
  }, [tasks, search, filter]);

  // Calculate stats for the dashboard cards
  const stats = {
    total: Array.isArray(tasks) ? tasks.length : 0,
    todo: Array.isArray(tasks) ? tasks.filter(t => t.status === 'TODO').length : 0,
    progress: Array.isArray(tasks) ? tasks.filter(t => t.status === 'IN_PROGRESS').length : 0,
    done: Array.isArray(tasks) ? tasks.filter(t => t.status === 'DONE').length : 0,
  };

  // Prevent server-side errors during initial render
  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b bg-white p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-blue-600" />
            <h1 className="font-bold text-xl">Task Manager</h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">Hi, {user?.name || 'User'}</p>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut size={20} className="text-gray-400" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 space-y-6">
        {/* Quick Stats Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-bold">Total Tasks</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-bold text-green-600">Completed</p>
            <p className="text-2xl font-bold">{stats.done}</p>
          </div>
        </section>
        
        {/* Search bar and Filters */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border shadow-sm items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <Input 
              placeholder="Search tasks..." 
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 border rounded-lg p-1 bg-slate-50 w-full md:w-auto overflow-x-auto">
            {['all', 'TODO', 'IN_PROGRESS', 'DONE'].map((f) => (
              <Button 
                key={f}
                variant={filter === f ? "default" : "ghost"} 
                size="sm" 
                className="h-8 text-xs whitespace-nowrap"
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f.replace('_', ' ')}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2 border rounded-lg p-1 bg-slate-50">
            <Button 
              variant={view === "grid" ? "default" : "ghost"} 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setView("grid")}
            >
              <LayoutGrid size={16} />
            </Button>
            <Button 
              variant={view === "list" ? "default" : "ghost"} 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setView("list")}
            >
              <LayoutList size={16} />
            </Button>
          </div>
          
          <Button onClick={() => openTaskEditor()} className="w-full md:w-auto">
            <Plus size={18} className="mr-2" /> New Task
          </Button>
        </div>

        {/* Task List Section */}
        <section>
          {loading ? (
            <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-blue-500" /></div>
          ) : filteredTasks.length > 0 ? (
            <div className={view === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
              {filteredTasks.map((task) => (
                <TaskItem key={task.id} task={task} onEdit={() => openTaskEditor(task)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed rounded-xl text-gray-400 bg-white">
              <p>No tasks found.</p>
            </div>
          )}
        </section>
      </main>

      {/* Popup Dialog for Adding/Editing Tasks */}
      <TaskDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        task={activeTask} 
      />
    </div>
  );
}