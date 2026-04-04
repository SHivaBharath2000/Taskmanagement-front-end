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
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuLabel, 
  DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { loadTasks } from "@/lib/features/tasks/tasks-slice";
import { logout, syncAuth } from "@/lib/features/auth/auth-slice";
import { Task, TaskStatus } from "@/lib/api-client";

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items: tasks, loading } = useAppSelector(s => s.tasks);
  const { isAuthenticated, user } = useAppSelector(s => s.auth);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [view, setView] = useState<"list" | "grid">("grid");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    dispatch(syncAuth());
  }, [dispatch]);

  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated) {
        router.push("/login");
      } else {
        dispatch(loadTasks());
      }
    }
  }, [mounted, isAuthenticated, router, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const openEditor = (task?: Task) => {
    setActiveTask(task || null);
    setDialogOpen(true);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchText = t.title.toLowerCase().includes(search.toLowerCase()) || 
                       (t.description?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchStatus = filter === "all" || t.status === filter;
      return matchText && matchStatus;
    });
  }, [tasks, search, filter]);

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    progress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: tasks.filter(t => t.status === 'DONE').length,
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-body">
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container max-w-7xl mx-auto h-16 flex items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-primary rounded-lg shadow-sm">
              <CheckCircle2 className="text-white w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Task System</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-500 hidden md:inline">
              Hi, {user?.name || 'there'}
            </span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5 text-slate-400" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total', val: stats.total, icon: LayoutList, color: 'text-primary' },
            { label: 'To Do', val: stats.todo, icon: Clock, color: 'text-slate-500' },
            { label: 'Active', val: stats.progress, icon: TrendingUp, color: 'text-blue-500' },
            { label: 'Done', val: stats.done, icon: CheckCircle, color: 'text-green-500' }
          ].map((s, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
              <div className={cn("p-2.5 rounded-full bg-slate-50", s.color)}>
                <s.icon size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
                <p className="text-xl font-bold text-slate-900">{s.val}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="flex flex-col md:flex-row items-center gap-4 justify-between bg-white p-4 rounded-xl border shadow-sm">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search your tasks..." 
              className="pl-10 bg-slate-50 border-none focus-visible:ring-1"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-1 md:w-40 justify-between">
                  <span className="flex items-center gap-2"><Filter size={14} /> {filter === 'all' ? 'Status' : filter}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={filter} onValueChange={(v) => setFilter(v as any)}>
                  <DropdownMenuRadioItem value="all">All Tasks</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="TODO">To Do</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="IN_PROGRESS">In Progress</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="DONE">Done</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <Button size="icon" variant={view === 'list' ? 'white' : 'ghost'} className="h-8 w-8" onClick={() => setView('list')}>
                <LayoutList size={16} />
              </Button>
              <Button size="icon" variant={view === 'grid' ? 'white' : 'ghost'} className="h-8 w-8" onClick={() => setView('grid')}>
                <LayoutGrid size={16} />
              </Button>
            </div>

            <Button onClick={() => openEditor()} className="flex-1 md:flex-none">
              <Plus size={18} className="mr-1" /> New Task
            </Button>
          </div>
        </section>

        <section className="min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
              <Loader2 className="animate-spin" size={32} />
              <p className="text-sm font-medium">Updating list...</p>
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className={cn(
              "grid gap-5",
              view === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
            )}>
              {filteredTasks.map(t => (
                <TaskItem key={t.id} task={t} onEdit={() => openEditor(t)} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 text-center space-y-3 bg-white border border-dashed rounded-2xl">
              <div className="bg-slate-50 p-4 rounded-full text-slate-300"><CheckCircle2 size={40} /></div>
              <h3 className="font-semibold text-slate-900">No tasks found</h3>
              <p className="text-sm text-slate-500 max-w-[240px]">
                {search || filter !== 'all' ? "Try adjusting your filters to find what you need." : "Time to start something new. Create your first task!"}
              </p>
            </div>
          )}
        </section>
      </main>

      <TaskDialog open={dialogOpen} onOpenChange={setDialogOpen} task={activeTask} />
    </div>
  );
}
