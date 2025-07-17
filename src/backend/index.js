require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const chatRoutes = require("./routes/chat.routes");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const postRoutes = require("./routes/postRoutes");

app.use("/api/posts", postRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
