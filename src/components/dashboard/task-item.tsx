
"use client";

import { Task } from "@/lib/api-client";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit2, Trash2, Clock, CheckCircle, Loader2 } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useAppDispatch } from "@/lib/hooks";
import { toggleTask, deleteTask } from "@/lib/features/tasks/tasks-slice";

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export function TaskItem({ task, onEdit }: TaskItemProps) {
  const dispatch = useAppDispatch();
  const [isUpdating, setIsUpdating] = useState(false);

  const isCompleted = task.status === 'DONE';

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      const result = await dispatch(toggleTask(task.id));
      if (toggleTask.fulfilled.match(result)) {
        toast({ title: isCompleted ? "Task set to pending" : "Task completed!" });
      } else {
        throw new Error("Failed to toggle");
      }
    } catch (error) {
      toast({ title: "Failed to update task", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      const result = await dispatch(deleteTask(task.id));
      if (deleteTask.fulfilled.match(result)) {
        toast({ title: "Task deleted successfully" });
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      toast({ title: "Failed to delete task", variant: "destructive" });
    }
  };

  const statusColors = {
    TODO: "bg-gray-100 text-gray-700 hover:bg-gray-100",
    IN_PROGRESS: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    DONE: "bg-green-100 text-green-700 hover:bg-green-100",
  };

  const StatusIcon = {
    TODO: Clock,
    IN_PROGRESS: Clock,
    DONE: CheckCircle,
  }[task.status];

  return (
    <Card className={cn(
      "group flex items-start gap-4 p-4 transition-all hover:shadow-md border-l-4",
      isCompleted ? "opacity-70 border-l-muted" : "border-l-primary"
    )}>
      <div className="pt-1">
        {isUpdating ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <Checkbox 
            checked={isCompleted} 
            onCheckedChange={handleToggle}
            disabled={isUpdating}
            className="h-5 w-5 rounded-full"
          />
        )}
      </div>
      
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className={cn(
            "font-semibold text-lg transition-all",
            isCompleted && "line-through text-muted-foreground"
          )}>
            {task.title}
          </h3>
          <Badge className={cn("capitalize text-[10px] px-2 py-0", statusColors[task.status])}>
            {task.status.replace('_', ' ')}
          </Badge>
        </div>
        
        {task.description && (
          <p className={cn(
            "text-sm text-muted-foreground line-clamp-2",
            isCompleted && "opacity-60"
          )}>
            {task.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-4 pt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <StatusIcon className="h-3 w-3" />
            <span>Last updated: {new Date(task.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(task)}>
            <Edit2 className="h-4 w-4 mr-2" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  );
}
