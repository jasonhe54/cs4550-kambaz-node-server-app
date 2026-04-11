import { v4 as uuidv4 } from "uuid";
import model from "./model.js";
import enrollmentsModel from "../enrollments/model.js";

export default function CoursesDao() {
  function findAllCourses() {
    return model.find({}, { name: 1, description: 1 });
  }

  function findCourseById(courseId) {
    return model.findById(courseId);
  }

  async function findCoursesForEnrolledUser(userId) {
    const enrollments = await enrollmentsModel.find({ user: userId }).populate("course");
    return enrollments.map((enrollment) => enrollment.course);
  }

  function createCourse(course) {
    return model.create({ ...course, _id: uuidv4() });
  }

  function deleteCourse(courseId) {
    return model.deleteOne({ _id: courseId });
  }

  function updateCourse(courseId, courseUpdates) {
    return model.updateOne({ _id: courseId }, { $set: courseUpdates });
  }

  return {
    findAllCourses,
    findCourseById,
    findCoursesForEnrolledUser,
    createCourse,
    deleteCourse,
    updateCourse,
  };
}
