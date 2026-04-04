
"use client";

import { Task, apiClient } from "@/lib/api-client";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit2, Trash2, Calendar, Tag } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface TaskItemProps {
  task: Task;
  onRefresh: () => void;
  onEdit: (task: Task) => void;
}

export function TaskItem({ task, onRefresh, onEdit }: TaskItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      await apiClient.toggleTaskStatus(task.id);
      toast({ title: task.completed ? "Task uncompleted" : "Task completed!" });
      onRefresh();
    } catch (error) {
      toast({ title: "Failed to update task", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.deleteTask(task.id);
      toast({ title: "Task deleted successfully" });
      onRefresh();
    } catch (error) {
      toast({ title: "Failed to delete task", variant: "destructive" });
    }
  };

  const priorityColors = {
    low: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    medium: "bg-orange-100 text-orange-700 hover:bg-orange-100",
    high: "bg-red-100 text-red-700 hover:bg-red-100",
  };

  return (
    <Card className={cn(
      "group flex items-start gap-4 p-4 transition-all hover:shadow-md border-l-4",
      task.completed ? "opacity-70 border-l-muted" : "border-l-primary"
    )}>
      <div className="pt-1">
        <Checkbox 
          checked={task.completed} 
          onCheckedChange={handleToggle}
          disabled={isUpdating}
          className="h-5 w-5 rounded-full"
        />
      </div>
      
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className={cn(
            "font-semibold text-lg transition-all",
            task.completed && "line-through text-muted-foreground"
          )}>
            {task.title}
          </h3>
          <Badge className={cn("capitalize text-[10px] px-2 py-0", priorityColors[task.priority])}>
            {task.priority}
          </Badge>
        </div>
        
        <p className={cn(
          "text-sm text-muted-foreground line-clamp-2",
          task.completed && "opacity-60"
        )}>
          {task.description}
        </p>
        
        <div className="flex flex-wrap gap-4 pt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{task.dueDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            <span>{task.category}</span>
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
