import { v4 as uuidv4 } from "uuid";

export default function EnrollmentsDao(db) {
  function enrollUserInCourse(userId, courseId) {
    const { enrollments } = db;
    const enrollment = enrollments.find(
      (enrollment) => enrollment.user === userId && enrollment.course === courseId
    );
    if (enrollment) {
      return enrollment;
    }
    const newEnrollment = { _id: uuidv4(), user: userId, course: courseId };
    db.enrollments = [...enrollments, newEnrollment];
    return newEnrollment;
  }

  function unenrollUserFromCourse(userId, courseId) {
    const { enrollments } = db;
    db.enrollments = enrollments.filter(
      (enrollment) => !(enrollment.user === userId && enrollment.course === courseId)
    );
  }

  return { enrollUserInCourse, unenrollUserFromCourse };
}
