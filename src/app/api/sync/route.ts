import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchUserCourses, fetchCourseTasks } from "@/lib/google-classroom";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  
  if (!session || !(session as any).accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = (session as any).accessToken;
  const userId = (session.user as any).id;

  try {
    const courses = await fetchUserCourses(accessToken);
    
    for (const course of courses) {
      if (!course.id || !course.name) continue;

      // Upsert Course
      const dbCourse = await prisma.course.upsert({
        where: { classroomId: course.id },
        update: {
          name: course.name,
          section: course.section || null,
          description: course.descriptionHeading || null,
        },
        create: {
          classroomId: course.id,
          name: course.name,
          section: course.section || null,
          description: course.descriptionHeading || null,
          userId,
        },
      });

      // Fetch Tasks for this course
      const courseWork = await fetchCourseTasks(accessToken, course.id);
      
      for (const work of courseWork) {
        if (!work.id || !work.title) continue;

        const dueDate = work.dueDate 
          ? new Date(work.dueDate.year || 0, (work.dueDate.month || 1) - 1, work.dueDate.day || 1)
          : null;

        // Upsert Task
        await prisma.task.upsert({
          where: { 
            // In a real app, we might need a unique constraint on classroomId + userId
            // For now, we'll use classtaskId
            id: work.id 
          },
          update: {
            title: work.title,
            dueDate,
            description: work.description || null,
            status: "Asignada", // default, should ideally sync submission status
            syncDate: new Date(),
          },
          create: {
            id: work.id,
            origin: "CLASSROOM",
            subject: course.name,
            title: work.title,
            dueDate,
            description: work.description || null,
            status: "Asignada",
            classtaskId: work.id,
            courseId: dbCourse.id,
            userId,
            syncDate: new Date(),
          },
        });
      }
    }

    return NextResponse.json({ message: "Sync successful" });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Failed to sync with Classroom" }, { status: 500 });
  }
}
