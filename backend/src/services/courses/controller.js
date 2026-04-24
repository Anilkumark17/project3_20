const courseService = require("./service");

class CourseController {
  async getAllCourses(req, res) {
    try {
      const courses = await courseService.getAllCourses();

      return res.status(200).json({
        success: true,
        courses,
        total: courses.length,
      });
    } catch (error) {
      console.error("Get all courses error:", error);
      return res.status(500).json({
        error: "Failed to fetch courses",
        message: error.message,
      });
    }
  }

  async getCourseById(req, res) {
    try {
      const { id } = req.params;
      const course = await courseService.getCourseById(parseInt(id));

      return res.status(200).json({
        success: true,
        course,
      });
    } catch (error) {
      console.error("Get course by ID error:", error);
      return res.status(404).json({
        error: "Course not found",
        message: error.message,
      });
    }
  }

  async getCourseByCode(req, res) {
    try {
      const { code } = req.params;
      const course = await courseService.getCourseByCode(code);

      return res.status(200).json({
        success: true,
        course,
      });
    } catch (error) {
      console.error("Get course by code error:", error);
      return res.status(404).json({
        error: "Course not found",
        message: error.message,
      });
    }
  }

  async searchCourses(req, res) {
    try {
      const filters = {
        keyword: req.query.keyword,
        program: req.query.program,
        semester: req.query.semester,
        minDifficulty: req.query.minDifficulty,
        maxDifficulty: req.query.maxDifficulty,
        credits: req.query.credits,
      };
      const pagination = {
        page: Math.max(1, parseInt(req.query.page) || 1),
        pageSize: Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 12)),
      };

      const result = await courseService.searchCourses(filters, pagination);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Search courses error:", error);
      return res.status(500).json({
        error: "Failed to search courses",
        message: error.message,
      });
    }
  }

  async getCoursesByProgram(req, res) {
    try {
      const { program } = req.params;
      const courses = await courseService.getCoursesByProgram(program);

      return res.status(200).json({
        success: true,
        courses,
        total: courses.length,
      });
    } catch (error) {
      console.error("Get courses by program error:", error);
      return res.status(500).json({
        error: "Failed to fetch courses",
        message: error.message,
      });
    }
  }

  async getCoursesBySemester(req, res) {
    try {
      const { semester } = req.params;
      const courses = await courseService.getCoursesBySemester(parseInt(semester));

      return res.status(200).json({
        success: true,
        courses,
        total: courses.length,
      });
    } catch (error) {
      console.error("Get courses by semester error:", error);
      return res.status(500).json({
        error: "Failed to fetch courses",
        message: error.message,
      });
    }
  }

  async createCourse(req, res) {
    try {
      const courseData = req.body;
      const course = await courseService.createCourse(courseData);

      return res.status(201).json({
        success: true,
        course,
      });
    } catch (error) {
      console.error("Create course error:", error);
      return res.status(400).json({
        error: "Failed to create course",
        message: error.message,
      });
    }
  }

  async updateCourse(req, res) {
    try {
      const { id } = req.params;
      const courseData = req.body;
      const course = await courseService.updateCourse(parseInt(id), courseData);

      return res.status(200).json({
        success: true,
        course,
      });
    } catch (error) {
      console.error("Update course error:", error);
      return res.status(400).json({
        error: "Failed to update course",
        message: error.message,
      });
    }
  }

  async deleteCourse(req, res) {
    try {
      const { id } = req.params;
      await courseService.deleteCourse(parseInt(id));

      return res.status(200).json({
        success: true,
        message: "Course deleted successfully",
      });
    } catch (error) {
      console.error("Delete course error:", error);
      return res.status(400).json({
        error: "Failed to delete course",
        message: error.message,
      });
    }
  }

  async getCourseCatalog(req, res) {
    try {
      const filters = {
        program: req.query.program,
        semester: req.query.semester,
        keyword: req.query.keyword,
        difficulty: req.query.difficulty ? JSON.parse(req.query.difficulty) : undefined,
      };
      const pagination = {
        page: Math.max(1, parseInt(req.query.page) || 1),
        pageSize: Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 12)),
      };

      const result = await courseService.getCourseCatalog(filters, pagination);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Get course catalog error:", error);
      return res.status(500).json({
        error: "Failed to fetch course catalog",
        message: error.message,
      });
    }
  }
}

module.exports = new CourseController();
