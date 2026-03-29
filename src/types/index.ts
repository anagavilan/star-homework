export type TaskOrigin = "CLASSROOM" | "MANUAL";

export interface Task {
  id: string;
  origin: TaskOrigin;
  subject: string;
  title: string;
  dueDate: Date | null;
  status: string;
  info?: string;
  description?: string;
  attachments?: any;
  courseId?: string;
  classtaskId?: string;
  submissionId?: string;
  syncDate?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = "Asignada" | "Sin entregar" | "Entregada" | "Revisada";
