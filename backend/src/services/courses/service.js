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

  async searchCourses(filters) {
    const courses = await courseRepository.search(filters);
    const total = await courseRepository.count(filters);
    
    return {
      courses,
      total,
      filters: filters,
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

  async getCourseCatalog(filters = {}) {
    const { program, semester, keyword, difficulty } = filters;
    
    const searchFilters = {};
    if (program) searchFilters.program = program;
    if (semester) searchFilters.semester = semester;
    if (keyword) searchFilters.keyword = keyword;
    if (difficulty) {
      searchFilters.minDifficulty = difficulty.min;
      searchFilters.maxDifficulty = difficulty.max;
    }

    const result = await this.searchCourses(searchFilters);
    return result;
  }
}

module.exports = new CourseService();
