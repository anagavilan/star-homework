import { google } from "googleapis";

export const getGoogleClassroom = (accessToken: string) => {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  
  return google.classroom({ version: "v1", auth });
};

export const fetchUserCourses = async (accessToken: string) => {
  const classroom = getGoogleClassroom(accessToken);
  const response = await classroom.courses.list();
  return response.data.courses || [];
};

export const fetchCourseTasks = async (accessToken: string, courseId: string) => {
  const classroom = getGoogleClassroom(accessToken);
  const response = await classroom.courses.courseWork.list({ courseId });
  return response.data.courseWork || [];
};
