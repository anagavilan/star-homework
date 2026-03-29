"use client";

import { useState, useEffect } from "react";
import { X, Calendar, BookOpen, AlertCircle, CheckCircle2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  onSave: (task: Partial<Task>) => void;
  onDelete?: (id: string) => void;
}

export function TaskModal({ isOpen, onClose, task, onSave, onDelete }: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<TaskStatus>("Asignada");
  const [info, setInfo] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setSubject(task.subject);
      setDueDate(task.dueDate ? format(task.dueDate, "yyyy-MM-dd") : "");
      setStatus(task.status as TaskStatus);
      setInfo(task.info || "");
      setDescription(task.description || "");
    } else {
      setTitle("");
      setSubject("");
      setDueDate("");
      setStatus("Asignada");
      setInfo("");
      setDescription("");
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      subject,
      dueDate: dueDate ? new Date(dueDate) : null,
      status,
      info,
      description,
      origin: "MANUAL",
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg bg-card border rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold">
              {task ? "Editar Tarea" : "Nueva Tarea Manual"}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-muted-foreground">Título</label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Práctica de Matemáticas"
                className="w-full px-4 py-2 bg-muted/50 border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-muted-foreground">Asignatura</label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  <input
                    required
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ej: Historia"
                    className="w-full pl-10 pr-4 py-2 bg-muted/50 border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-muted-foreground">Fecha de Entrega</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-muted/50 border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-muted-foreground">Estado</label>
              <div className="flex flex-wrap gap-2">
                {["Asignada", "Sin entregar", "Entregada", "Revisada"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s as TaskStatus)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
                      status === s 
                        ? "bg-primary border-primary text-primary-foreground" 
                        : "bg-muted border-transparent text-muted-foreground hover:border-muted-foreground/30"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-muted-foreground">Información Breve</label>
              <input
                type="text"
                value={info}
                onChange={(e) => setInfo(e.target.value)}
                placeholder="Ej: Páginas 10 a 15"
                className="w-full px-4 py-2 bg-muted/50 border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-muted-foreground">Descripción Completa</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalles adicionales sobre la tarea..."
                rows={3}
                className="w-full px-4 py-2 bg-muted/50 border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95"
              >
                {task ? "Guardar Cambios" : "Crear Tarea"}
              </button>
              {task && task.origin === "MANUAL" && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(task.id);
                    onClose();
                  }}
                  className="p-3 bg-destructive/10 text-destructive rounded-2xl hover:bg-destructive hover:text-destructive-foreground transition-all"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
