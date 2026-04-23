const authService = require("./service");

class AuthController {
  async syncUser(req, res) {
    try {
      const { clerkId, email, name } = req.body;

      const user = await authService.syncUserWithClerk({
        id: clerkId,
        emailAddresses: [{ emailAddress: email }],
        firstName: name?.split(" ")[0] || "",
        lastName: name?.split(" ").slice(1).join(" ") || "",
      });

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      console.error("Sync user error:", error);
      return res.status(500).json({
        error: "Failed to sync user",
        message: error.message,
      });
    }
  }

  async getUser(req, res) {
    try {
      const { clerkId } = req.params;

      const userData = await authService.getUserWithProfile(clerkId);

      if (!userData || !userData.user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({
        success: true,
        data: userData,
      });
    } catch (error) {
      console.error("Get user error:", error);
      return res.status(500).json({
        error: "Failed to fetch user",
        message: error.message,
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const { clerkId } = req.params;
      const profileData = req.body;

      const user = await authService.getUserByClerkId(clerkId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const profile = await authService.createOrUpdateProfile(user.id, profileData);

      return res.status(200).json({
        success: true,
        profile,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      return res.status(500).json({
        error: "Failed to update profile",
        message: error.message,
      });
    }
  }

  async getProfile(req, res) {
    try {
      const { clerkId } = req.params;

      const userData = await authService.getUserWithProfile(clerkId);

      if (!userData || !userData.user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({
        success: true,
        profile: userData.profile,
      });
    } catch (error) {
      console.error("Get profile error:", error);
      return res.status(500).json({
        error: "Failed to fetch profile",
        message: error.message,
      });
    }
  }
}

module.exports = new AuthController();
