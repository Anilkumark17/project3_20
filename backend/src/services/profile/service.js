const profileRepository = require("./repository");
const completedCoursesRepository = require("../courses/repositories/completed");
const userRepository = require("../auth/repository");

class ProfileService {
  async getProfileByClerkId(clerkId) {
    const user = await userRepository.findByClerkId(clerkId);
    if (!user) {
      throw new Error("User not found");
    }

    const profile = await profileRepository.findByUserId(user.id);
    return profile;
  }

  async createOrUpdateProfile(clerkId, profileData) {
    const user = await userRepository.findByClerkId(clerkId);
    if (!user) {
      throw new Error("User not found");
    }

    const data = {
      userId: user.id,
      program: profileData.program,
      semester: profileData.semester,
      goal: profileData.goal,
      creditsCompleted: profileData.creditsCompleted || 0,
      updatedAt: new Date(),
    };

    const profile = await profileRepository.upsert(data);
    return profile;
  }

  async updateProfileField(clerkId, field, value) {
    const user = await userRepository.findByClerkId(clerkId);
    if (!user) {
      throw new Error("User not found");
    }

    const updateData = {
      [field]: value,
      updatedAt: new Date(),
    };

    const profile = await profileRepository.update(user.id, updateData);
    return profile;
  }

  async getCompletedCourses(clerkId) {
    const user = await userRepository.findByClerkId(clerkId);
    if (!user) {
      throw new Error("User not found");
    }

    const completedCourses = await completedCoursesRepository.findByUserId(user.id);
    return completedCourses;
  }

  async addCompletedCourse(clerkId, courseData) {
    const user = await userRepository.findByClerkId(clerkId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if course already completed
    const exists = await completedCoursesRepository.exists(user.id, courseData.courseId);
    if (exists) {
      throw new Error("Course already marked as completed");
    }

    const data = {
      userId: user.id,
      courseId: courseData.courseId,
      grade: courseData.grade || null,
      completedAt: new Date(),
    };

    const completedCourse = await completedCoursesRepository.create(data);

    // Update credits completed in profile
    const profile = await profileRepository.findByUserId(user.id);
    if (profile && courseData.credits) {
      const newCredits = (profile.creditsCompleted || 0) + courseData.credits;
      await profileRepository.update(user.id, {
        creditsCompleted: newCredits,
        updatedAt: new Date(),
      });
    }

    return completedCourse;
  }

  async removeCompletedCourse(clerkId, completedCourseId) {
    const user = await userRepository.findByClerkId(clerkId);
    if (!user) {
      throw new Error("User not found");
    }

    const completedCourse = await completedCoursesRepository.findById(completedCourseId);
    if (!completedCourse) {
      throw new Error("Completed course not found");
    }

    if (completedCourse.userId !== user.id) {
      throw new Error("Unauthorized to delete this course");
    }

    await completedCoursesRepository.delete(completedCourseId);

    // Update credits completed in profile
    const profile = await profileRepository.findByUserId(user.id);
    if (profile && completedCourse.courseCredits) {
      const newCredits = Math.max(0, (profile.creditsCompleted || 0) - completedCourse.courseCredits);
      await profileRepository.update(user.id, {
        creditsCompleted: newCredits,
        updatedAt: new Date(),
      });
    }

    return true;
  }

  async getFullProfile(clerkId) {
    const user = await userRepository.findByClerkId(clerkId);
    if (!user) {
      throw new Error("User not found");
    }

    const profile = await profileRepository.findByUserId(user.id);
    const completedCourses = await completedCoursesRepository.findByUserId(user.id);

    return {
      profile,
      completedCourses,
      totalCredits: profile?.creditsCompleted || 0,
      coursesCount: completedCourses.length,
    };
  }
}

module.exports = new ProfileService();
