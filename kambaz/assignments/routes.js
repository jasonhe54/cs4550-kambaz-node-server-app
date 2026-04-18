import AssignmentsDao from "./dao.js";
import EnrollmentsDao from "../enrollments/dao.js";

export default function AssignmentRoutes(app) {
  const dao = AssignmentsDao();
  const enrollmentsDao = EnrollmentsDao();

  const isPrivilegedUser = (user) => Boolean(user && user.role !== "STUDENT");

  const ensureCourseAccess = async (req, res, courseId) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.sendStatus(401);
      return null;
    }

    const courses = await enrollmentsDao.findCoursesForUser(currentUser._id);
    const isEnrolledInCourse = courses.some(
      (course) => course && `${course._id}` === `${courseId}`
    );

    if (!isEnrolledInCourse) {
      res.status(403).json({ message: "You do not have access to this course." });
      return null;
    }

    return currentUser;
  };

  const findAssignmentById = async (req, res) => {
    const { assignmentId } = req.params;
    const assignment = await dao.findAssignmentById(assignmentId);
    if (!assignment) {
      res.status(404).json({ message: `Unable to find assignment with ID ${assignmentId}` });
      return;
    }

    const currentUser = await ensureCourseAccess(req, res, assignment.course);
    if (!currentUser) return;

    res.json(assignment);
  };

  const findAssignmentsForCourse = async (req, res) => {
    const { courseId } = req.params;
    const currentUser = await ensureCourseAccess(req, res, courseId);
    if (!currentUser) return;

    const assignments = await dao.findAssignmentsForCourse(courseId);
    res.json(assignments);
  };

  const createAssignmentForCourse = async (req, res) => {
    const { courseId } = req.params;
    const currentUser = await ensureCourseAccess(req, res, courseId);
    if (!currentUser) return;

    if (!isPrivilegedUser(currentUser)) {
      res.status(403).json({ message: "Only faculty users can create assignments." });
      return;
    }

    const assignment = {
      ...req.body,
      course: courseId,
    };
    const newAssignment = await dao.createAssignment(assignment);
    res.send(newAssignment);
  };

  const deleteAssignment = async (req, res) => {
    const { assignmentId } = req.params;
    const assignment = await dao.findAssignmentById(assignmentId);
    if (!assignment) {
      res.status(404).json({ message: `Unable to find assignment with ID ${assignmentId}` });
      return;
    }

    const currentUser = await ensureCourseAccess(req, res, assignment.course);
    if (!currentUser) return;

    if (!isPrivilegedUser(currentUser)) {
      res.status(403).json({ message: "Only faculty users can delete assignments." });
      return;
    }

    const status = await dao.deleteAssignment(assignmentId);
    res.send(status);
  };

  const updateAssignment = async (req, res) => {
    const { assignmentId } = req.params;
    const assignment = await dao.findAssignmentById(assignmentId);
    if (!assignment) {
      res.status(404).json({ message: `Unable to find assignment with ID ${assignmentId}` });
      return;
    }

    const currentUser = await ensureCourseAccess(req, res, assignment.course);
    if (!currentUser) return;

    if (!isPrivilegedUser(currentUser)) {
      res.status(403).json({ message: "Only faculty users can update assignments." });
      return;
    }

    const assignmentUpdates = req.body;
    const status = await dao.updateAssignment(assignmentId, assignmentUpdates);
    res.send(status);
  };

  app.post("/api/courses/:courseId/assignments", createAssignmentForCourse);
  app.get("/api/assignments/:assignmentId", findAssignmentById);
  app.get("/api/courses/:courseId/assignments", findAssignmentsForCourse);
  app.delete("/api/assignments/:assignmentId", deleteAssignment);
  app.put("/api/assignments/:assignmentId", updateAssignment);
}
