import CoursesDao from "./dao.js";
import EnrollmentsDao from "../enrollments/dao.js";

export default function CourseRoutes(app) {
  const dao = CoursesDao();
  const enrollmentsDao = EnrollmentsDao();

  const isPrivilegedUser = (user) => Boolean(user && user.role !== "STUDENT");

  const requireSignedIn = (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.sendStatus(401);
      return null;
    }
    return currentUser;
  };

  const ensureCourseAccess = async (req, res, courseId) => {
    const currentUser = requireSignedIn(req, res);
    if (!currentUser) return null;

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

  const findAllCourses = async (req, res) => {
    if (!requireSignedIn(req, res)) return;
    const courses = await dao.findAllCourses();
    res.send(courses);
  };

  const findCoursesForEnrolledUser = async (req, res) => {
    const currentUser = requireSignedIn(req, res);
    if (!currentUser) return;

    let { userId } = req.params;
    if (userId === "current") {
      userId = currentUser._id;
    }

    if (userId !== currentUser._id && !isPrivilegedUser(currentUser)) {
      res.status(403).json({ message: "You can only view your own courses." });
      return;
    }

    const courses = await enrollmentsDao.findCoursesForUser(userId);
    res.json(courses);
  };

  const findUsersForCourse = async (req, res) => {
    const { cid } = req.params;
    const currentUser = await ensureCourseAccess(req, res, cid);
    if (!currentUser) return;

    const users = await enrollmentsDao.findUsersForCourse(cid);
    res.json(users);
  };

  const createCourse = async (req, res) => {
    const currentUser = requireSignedIn(req, res);
    if (!currentUser) return;

    if (!isPrivilegedUser(currentUser)) {
      res.status(403).json({ message: "Only faculty users can create courses." });
      return;
    }

    const newCourse = await dao.createCourse(req.body);
    await enrollmentsDao.enrollUserInCourse(currentUser._id, newCourse._id);
    res.json(newCourse);
  };

  const deleteCourse = async (req, res) => {
    const { courseId } = req.params;
    const currentUser = await ensureCourseAccess(req, res, courseId);
    if (!currentUser) return;

    if (!isPrivilegedUser(currentUser)) {
      res.status(403).json({ message: "Only faculty users can delete courses." });
      return;
    }

    await enrollmentsDao.unenrollAllUsersFromCourse(courseId);
    const status = await dao.deleteCourse(courseId);
    res.send(status);
  };

  const updateCourse = async (req, res) => {
    const { courseId } = req.params;
    const courseUpdates = req.body;
    const currentUser = await ensureCourseAccess(req, res, courseId);
    if (!currentUser) return;

    if (!isPrivilegedUser(currentUser)) {
      res.status(403).json({ message: "Only faculty users can update courses." });
      return;
    }

    const status = await dao.updateCourse(courseId, courseUpdates);
    res.send(status);
  };

  const enrollUserInCourse = async (req, res) => {
    const currentUser = requireSignedIn(req, res);
    if (!currentUser) return;

    let { uid, cid } = req.params;
    if (uid === "current") {
      uid = currentUser._id;
    }

    if (uid !== currentUser._id && !isPrivilegedUser(currentUser)) {
      res.status(403).json({ message: "You can only manage your own enrollments." });
      return;
    }

    const status = await enrollmentsDao.enrollUserInCourse(uid, cid);
    res.send(status);
  };

  const unenrollUserFromCourse = async (req, res) => {
    const currentUser = requireSignedIn(req, res);
    if (!currentUser) return;

    let { uid, cid } = req.params;
    if (uid === "current") {
      uid = currentUser._id;
    }

    if (uid !== currentUser._id && !isPrivilegedUser(currentUser)) {
      res.status(403).json({ message: "You can only manage your own enrollments." });
      return;
    }

    const status = await enrollmentsDao.unenrollUserFromCourse(uid, cid);
    res.send(status);
  };

  app.post("/api/courses", createCourse);
  app.get("/api/courses/:cid/users", findUsersForCourse);
  app.post("/api/users/:uid/courses/:cid", enrollUserInCourse);
  app.get("/api/users/:userId/courses", findCoursesForEnrolledUser);
  app.delete("/api/users/:uid/courses/:cid", unenrollUserFromCourse);
  app.delete("/api/courses/:courseId", deleteCourse);
  app.put("/api/courses/:courseId", updateCourse);
  app.get("/api/courses", findAllCourses);
}
