import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET() {
  const session = await getServerSession();
  
  // For Phase 1 (MVP) if no session, return empty or mock if needed
  // In a real app, we'd check session.user.id
  
  try {
    const tasks = await prisma.task.findMany({
      orderBy: {
        dueDate: "asc",
      },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession();
  const body = await request.json();

  try {
    const task = await prisma.task.create({
      data: {
        ...body,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        userId: "user_1", // Placeholder for MVP
      },
    });
    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
