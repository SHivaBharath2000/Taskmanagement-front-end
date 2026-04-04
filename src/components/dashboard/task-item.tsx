"use client";

import { useState } from "react";
import { Task } from "@/lib/api-client";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit2, Trash2, Clock, CheckCircle, Loader2 } from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/lib/hooks";
import { toggleTaskStatus, removeTask } from "@/lib/features/tasks/tasks-slice";
import { toast } from "@/hooks/use-toast";

interface TaskItemProps {
  task: Task;
  onEdit: () => void;
}

export function TaskItem({ task, onEdit }: TaskItemProps) {
  const dispatch = useAppDispatch();
  const [toggling, setToggling] = useState(false);

  const isDone = task.status === 'DONE';

  const handleToggle = async () => {
    setToggling(true);
    try {
      await dispatch(toggleTaskStatus(task.id)).unwrap();
      toast({ title: isDone ? "Task moved to Todo" : "Excellent! Task completed" });
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(removeTask(task.id)).unwrap();
      toast({ title: "Task deleted" });
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const styles = {
    TODO: "bg-slate-100 text-slate-600 border-slate-200",
    IN_PROGRESS: "bg-blue-50 text-blue-600 border-blue-100",
    DONE: "bg-green-50 text-green-600 border-green-100",
  }[task.status];

  return (
    <Card className={cn(
      "group relative flex items-start gap-4 p-5 transition-all hover:shadow-lg border-l-4",
      isDone ? "border-l-slate-200 bg-slate-50/50" : "border-l-primary bg-white"
    )}>
      <div className="mt-1">
        {toggling ? (
          <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
        ) : (
          <Checkbox 
            checked={isDone} 
            onCheckedChange={handleToggle}
            className="w-5 h-5 rounded-md"
          />
        )}
      </div>

      <div className="flex-1 space-y-1.5 min-w-0">
        <div className="flex items-center justify-between gap-4">
          <h3 className={cn(
            "font-semibold text-slate-900 truncate transition-all",
            isDone && "line-through text-slate-400"
          )}>
            {task.title}
          </h3>
          <Badge variant="outline" className={cn("text-[10px] font-bold px-2 py-0 h-5", styles)}>
            {task.status.replace('_', ' ')}
          </Badge>
        </div>

        {task.description && (
          <p className={cn("text-sm text-slate-500 line-clamp-2", isDone && "opacity-60")}>
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-1.5 pt-2 text-[10px] font-medium text-slate-400">
          {isDone ? <CheckCircle size={12} className="text-green-500" /> : <Clock size={12} />}
          <span>{new Date(task.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="absolute top-4 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
              <MoreVertical size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={onEdit} className="gap-2">
              <Edit2 size={14} /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive gap-2">
              <Trash2 size={14} /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
