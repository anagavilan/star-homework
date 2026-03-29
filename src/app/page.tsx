"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle,
  LayoutGrid,
  List
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

import { useSession, signIn, signOut } from "next-auth/react";
import { TaskModal } from "@/components/TaskModal";

// Mock Data for Phase 1
const INITIAL_TASKS: Task[] = [
  {
    id: "1",
    origin: "CLASSROOM",
    subject: "Confecció industrial",
    title: "Práctica 14. Cremallera texana",
    dueDate: addDays(new Date(), -2),
    status: "Sin entregar",
    info: "Penja un document pdf o video del procés...",
    userId: "user_1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // ... more tasks
];

export default function HomePage() {
  const { data: session, status: authStatus } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Initial Fetch & Sync
  useEffect(() => {
    async function init() {
      if (session) {
        setLoading(true);
        try {
          // Trigger sync on login
          await fetch("/api/sync", { method: "POST" });
          
          // Fetch tasks from DB
          const res = await fetch("/api/tasks");
          const data = await res.json();
          setTasks(data);
        } catch (error) {
          console.error("Initialization failed:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    init();
  }, [session]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         task.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (editingTask) {
      // Edit
      const res = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      const updated = await res.json();
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    } else {
      // Add
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      const newTask = await res.json();
      setTasks(prev => [...prev, newTask]);
    }
  };

  const handleDeleteTask = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  if (authStatus === "loading" || (session && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-primary font-bold text-2xl"
        >
          StarHomeWork
        </motion.div>
      </div>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 rotate-12">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Organiza tus deberes con <span className="gradient-text">StarHomeWork</span></h1>
          <p className="text-muted-foreground mb-10 text-lg leading-relaxed">
            Unifica tus tareas de Google Classroom y las tuyas propias en una sola lista inteligente.
          </p>
          <button 
            onClick={() => signIn("google")}
            className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center gap-3 text-lg"
          >
            <img src="https://authjs.dev/img/providers/google.svg" className="w-6 h-6" alt="Google" />
            Empieza con Google
          </button>
          <p className="mt-6 text-sm text-muted-foreground">
            Sincronización instantánea con tus clases.
          </p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold gradient-text">StarHomeWork</h1>
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input 
                type="text"
                placeholder="Buscar tareas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-muted/50 border border-transparent focus:border-primary/30 focus:bg-background rounded-full outline-none transition-all w-64"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setEditingTask(null);
                setIsModalOpen(true);
              }}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-full flex items-center gap-2 font-medium shadow-lg shadow-primary/20 hover:scale-105 transition-transform active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Nueva Tarea</span>
            </button>
            <div className="h-8 w-[1px] bg-border mx-1" />
            <button 
              onClick={() => signOut()}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary transition-colors"
              title="Cerrar sesión"
            >
              <img src={session.user?.image || ""} alt={session.user?.name || ""} className="w-full h-full object-cover" />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 pt-6">
        {/* Mobile Search */}
        <div className="relative sm:hidden mb-6">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Buscar tareas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-transparent focus:border-primary/30 focus:bg-background rounded-2xl outline-none transition-all"
          />
        </div>

        {/* Quick Filters */}
        <section className="mb-8 overflow-x-auto pb-2 flex gap-2 no-scrollbar">
          {["All", "Asignada", "Sin entregar", "Entregada", "Revisada"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                filterStatus === status 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {status === "All" ? "Todas" : status}
            </button>
          ))}
        </section>

        {/* Task List Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Tareas Pendientes
            </h2>
            <div className="flex bg-muted p-1 rounded-lg">
              <button 
                onClick={() => setViewMode("list")}
                className={cn("p-1.5 rounded-md", viewMode === "list" && "bg-background shadow-sm")}
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode("grid")}
                className={cn("p-1.5 rounded-md", viewMode === "grid" && "bg-background shadow-sm")}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className={cn(
            "grid gap-4",
            viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}>
            <AnimatePresence mode="popLayout">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    viewMode={viewMode} 
                    onClick={() => {
                      setEditingTask(task);
                      setIsModalOpen(true);
                    }}
                  />
                ))
              ) : (
                <EmptyState />
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>

      {/* Task Modal */}
      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={editingTask}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />

      {/* Floating Bottom Nav for Mobile Experience */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-lg border-t flex items-center justify-around px-6 sm:hidden">
        <button className="flex flex-col items-center gap-1 text-primary">
          <List className="w-6 h-6" />
          <span className="text-[10px] font-medium">Tareas</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-muted-foreground">
          <Calendar className="w-6 h-6" />
          <span className="text-[10px] font-medium">Calendario</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-muted-foreground">
          <BookOpen className="w-6 h-6" />
          <span className="text-[10px] font-medium">Clases</span>
        </button>
      </nav>
    </main>
  );
}

function TaskCard({ task, viewMode, onClick }: { task: Task; viewMode: "list" | "grid"; onClick: () => void }) {
  const isOverdue = task.dueDate && task.dueDate < new Date() && task.status !== "Entregada" && task.status !== "Revisada";
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={cn(
        "group relative p-4 rounded-2xl glass border card-hover cursor-pointer",
        isOverdue ? "border-destructive/30" : "border-border"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {task.subject}
          </span>
          <span className={cn(
            "text-[10px] px-2 py-0.5 rounded-full font-semibold",
            task.origin === "CLASSROOM" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          )}>
            {task.origin}
          </span>
        </div>
        
        <h3 className="font-bold text-lg mb-1 line-clamp-2 uppercase">{task.title}</h3>
        
        {task.info && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {task.info}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <span className={cn(
              "flex items-center gap-1",
              isOverdue ? "text-destructive" : "text-muted-foreground"
            )}>
              {isOverdue ? <AlertCircle className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
              {task.dueDate ? format(task.dueDate, "d MMM", { locale: es }) : "Sin fecha"}
            </span>
          </div>

          <div className={cn(
            "flex items-center gap-1.5 text-sm font-bold",
            task.status === "Sin entregar" ? "text-destructive" :
            task.status === "Entregada" ? "text-green-600 dark:text-green-400" :
            task.status === "Revisada" ? "text-primary" : "text-muted-foreground"
          )}>
            {task.status === "Entregada" && <CheckCircle2 className="w-4 h-4" />}
            {task.status}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="col-span-full py-20 flex flex-col items-center justify-center text-center px-4"
    >
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
        <BookOpen className="w-10 h-10 text-muted-foreground/50" />
      </div>
      <h3 className="text-xl font-bold mb-2">¡Todo al día!</h3>
      <p className="text-muted-foreground max-w-xs">
        No tienes tareas pendientes que coincidan con tus filtros. Descansa o añade una nueva.
      </p>
    </motion.div>
  );
}
