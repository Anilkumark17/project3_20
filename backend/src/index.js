// Backend entry point
const express = require("express");
const app = express();

app.use(express.json());

// Routes
// const profileRoutes = require("./routes/profileRoutes");
// const courseRoutes = require("./routes/courseRoutes");
// const dashboardRoutes = require("./routes/dashboardRoutes");
// const recommendationRoutes = require("./routes/recommendationRoutes");

// app.use("/api/profile", profileRoutes);
// app.use("/api/courses", courseRoutes);
// app.use("/api/dashboard", dashboardRoutes);
// app.use("/api/recommendations", recommendationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
