const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
dotenv.config();
const app = express();
connectDB();
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowed = [
      "http://localhost:5173",
      "http://localhost:5174",
      process.env.CLIENT_URL,
    ].filter(Boolean);
    if (allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/", (req, res) => {
  res.json({ message: "CampusConnect API is running" });
});
app.use("/api/auth",     require("./routes/authRoutes"));
app.use("/api/users",    require("./routes/userRoutes"));
app.use("/api/posts",    require("./routes/postRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/pages",    require("./routes/pageRoutes"));
app.use("/api/notices",  require("./routes/noticeRoutes"));
app.use("/api/academic", require("./routes/academicRoutes"));
app.use("/api/admin",    require("./routes/adminRoutes"));
app.use(require("./middleware/errorMiddleware"));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});