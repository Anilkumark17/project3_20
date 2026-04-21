// Dashboard Controller

const getDashboard = async (req, res) => {
  try {
    res.json({ message: "getDashboard - not yet implemented" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getDashboard };
