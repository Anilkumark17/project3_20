const courseRepository = require("./repositories/course");

class CourseService {
  async getAllCourses() {
    const courses = await courseRepository.findAll();
    return courses;
  }

  async getCourseById(id) {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new Error("Course not found");
    }
    return course;
  }

  async getCourseByCode(code) {
    const course = await courseRepository.findByCode(code);
    if (!course) {
      throw new Error("Course not found");
    }
    return course;
  }

  async searchCourses(filters, pagination = {}) {
    const { page = 1, pageSize = 12 } = pagination;
    const [courses, total] = await Promise.all([
      courseRepository.search(filters, { page, pageSize }),
      courseRepository.count(filters),
    ]);
    const totalPages = Math.ceil(total / pageSize);

    return {
      courses,
      total,
      page,
      pageSize,
      totalPages,
      filters,
    };
  }

  async getCoursesByProgram(program) {
    const courses = await courseRepository.findByProgram(program);
    return courses;
  }

  async getCoursesBySemester(semester) {
    const courses = await courseRepository.findBySemester(semester);
    return courses;
  }

  async createCourse(courseData) {
    // Check if course code already exists
    const existing = await courseRepository.findByCode(courseData.code);
    if (existing) {
      throw new Error("Course code already exists");
    }

    const course = await courseRepository.create(courseData);
    return course;
  }

  async updateCourse(id, courseData) {
    const existing = await courseRepository.findById(id);
    if (!existing) {
      throw new Error("Course not found");
    }

    // If updating code, check for duplicates
    if (courseData.code && courseData.code !== existing.code) {
      const duplicate = await courseRepository.findByCode(courseData.code);
      if (duplicate) {
        throw new Error("Course code already exists");
      }
    }

    const course = await courseRepository.update(id, courseData);
    return course;
  }

  async deleteCourse(id) {
    const existing = await courseRepository.findById(id);
    if (!existing) {
      throw new Error("Course not found");
    }

    await courseRepository.delete(id);
    return true;
  }

  async getCourseCatalog(filters = {}, pagination = {}) {
    const { program, semester, keyword, difficulty } = filters;

    const searchFilters = {};
    if (program) searchFilters.program = program;
    if (semester) searchFilters.semester = semester;
    if (keyword) searchFilters.keyword = keyword;
    if (difficulty) {
      searchFilters.minDifficulty = difficulty.min;
      searchFilters.maxDifficulty = difficulty.max;
    }

    return await this.searchCourses(searchFilters, pagination);
  }
}

module.exports = new CourseService();
