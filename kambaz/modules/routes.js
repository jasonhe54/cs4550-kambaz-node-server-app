import ModulesDao from "./dao.js";
import EnrollmentsDao from "../enrollments/dao.js";

export default function ModulesRoutes(app) {
  const dao = ModulesDao();
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

  const findModulesForCourse = async (req, res) => {
    const { courseId } = req.params;
    const currentUser = await ensureCourseAccess(req, res, courseId);
    if (!currentUser) return;

    const modules = await dao.findModulesForCourse(courseId);
    res.json(modules);
  };

  const createModuleForCourse = async (req, res) => {
    const { courseId } = req.params;
    const currentUser = await ensureCourseAccess(req, res, courseId);
    if (!currentUser) return;

    if (!isPrivilegedUser(currentUser)) {
      res.status(403).json({ message: "Only faculty users can create modules." });
      return;
    }

    const module = {
      ...req.body,
    };
    const newModule = await dao.createModule(courseId, module);
    res.send(newModule);
  };

  const deleteModule = async (req, res) => {
    const { courseId, moduleId } = req.params;
    const currentUser = await ensureCourseAccess(req, res, courseId);
    if (!currentUser) return;

    if (!isPrivilegedUser(currentUser)) {
      res.status(403).json({ message: "Only faculty users can delete modules." });
      return;
    }

    const status = await dao.deleteModule(courseId, moduleId);
    res.send(status);
  };

  const updateModule = async (req, res) => {
    const { courseId, moduleId } = req.params;
    const currentUser = await ensureCourseAccess(req, res, courseId);
    if (!currentUser) return;

    if (!isPrivilegedUser(currentUser)) {
      res.status(403).json({ message: "Only faculty users can update modules." });
      return;
    }

    const moduleUpdates = req.body;
    const status = await dao.updateModule(courseId, moduleId, moduleUpdates);
    res.send(status);
  };

  app.post("/api/courses/:courseId/modules", createModuleForCourse);
  app.get("/api/courses/:courseId/modules", findModulesForCourse);
  app.delete("/api/courses/:courseId/modules/:moduleId", deleteModule);
  app.put("/api/courses/:courseId/modules/:moduleId", updateModule);
}
