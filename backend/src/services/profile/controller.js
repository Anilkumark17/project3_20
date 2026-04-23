const profileService = require("./service");

class ProfileController {
  async getProfile(req, res) {
    try {
      const { clerkId } = req.params;

      const profile = await profileService.getProfileByClerkId(clerkId);

      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      return res.status(200).json({
        success: true,
        profile,
      });
    } catch (error) {
      console.error("Get profile error:", error);
      return res.status(500).json({
        error: "Failed to fetch profile",
        message: error.message,
      });
    }
  }

  async getFullProfile(req, res) {
    try {
      const { clerkId } = req.params;

      const profileData = await profileService.getFullProfile(clerkId);

      return res.status(200).json({
        success: true,
        data: profileData,
      });
    } catch (error) {
      console.error("Get full profile error:", error);
      return res.status(500).json({
        error: "Failed to fetch full profile",
        message: error.message,
      });
    }
  }

  async createOrUpdateProfile(req, res) {
    try {
      const { clerkId } = req.params;
      const profileData = req.body;

      const profile = await profileService.createOrUpdateProfile(clerkId, profileData);

      return res.status(200).json({
        success: true,
        profile,
      });
    } catch (error) {
      console.error("Create/Update profile error:", error);
      return res.status(500).json({
        error: "Failed to save profile",
        message: error.message,
      });
    }
  }

  async updateProfileField(req, res) {
    try {
      const { clerkId, field } = req.params;
      const { value } = req.body;

      const profile = await profileService.updateProfileField(clerkId, field, value);

      return res.status(200).json({
        success: true,
        profile,
      });
    } catch (error) {
      console.error("Update profile field error:", error);
      return res.status(500).json({
        error: "Failed to update profile field",
        message: error.message,
      });
    }
  }

  async getCompletedCourses(req, res) {
    try {
      const { clerkId } = req.params;

      const completedCourses = await profileService.getCompletedCourses(clerkId);

      return res.status(200).json({
        success: true,
        completedCourses,
      });
    } catch (error) {
      console.error("Get completed courses error:", error);
      return res.status(500).json({
        error: "Failed to fetch completed courses",
        message: error.message,
      });
    }
  }

  async addCompletedCourse(req, res) {
    try {
      const { clerkId } = req.params;
      const courseData = req.body;

      const completedCourse = await profileService.addCompletedCourse(clerkId, courseData);

      return res.status(201).json({
        success: true,
        completedCourse,
      });
    } catch (error) {
      console.error("Add completed course error:", error);
      return res.status(500).json({
        error: "Failed to add completed course",
        message: error.message,
      });
    }
  }

  async removeCompletedCourse(req, res) {
    try {
      const { clerkId, courseId } = req.params;

      await profileService.removeCompletedCourse(clerkId, parseInt(courseId));

      return res.status(200).json({
        success: true,
        message: "Course removed successfully",
      });
    } catch (error) {
      console.error("Remove completed course error:", error);
      return res.status(500).json({
        error: "Failed to remove completed course",
        message: error.message,
      });
    }
  }
}

module.exports = new ProfileController();
