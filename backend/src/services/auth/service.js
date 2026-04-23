const userRepository = require("./repository");
const profileRepository = require("../profile/repository");

class AuthService {
  async syncUserWithClerk(clerkData) {
    const { id: clerkId, emailAddresses, firstName, lastName } = clerkData;
    const email = emailAddresses[0]?.emailAddress;
    const name = `${firstName || ""} ${lastName || ""}`.trim();

    let user = await userRepository.findByClerkId(clerkId);

    if (!user) {
      user = await userRepository.create({
        clerkId,
        email,
        name: name || null,
      });
    } else {
      user = await userRepository.update(user.id, {
        email,
        name: name || null,
        updatedAt: new Date(),
      });
    }

    return user;
  }

  async getUserByClerkId(clerkId) {
    return await userRepository.findByClerkId(clerkId);
  }

  async getUserWithProfile(clerkId) {
    const user = await userRepository.findByClerkId(clerkId);
    if (!user) return null;

    const profile = await profileRepository.findByUserId(user.id);
    return { user, profile };
  }

  async createOrUpdateProfile(userId, profileData) {
    return await profileRepository.upsert({
      userId,
      ...profileData,
    });
  }
}

module.exports = new AuthService();
