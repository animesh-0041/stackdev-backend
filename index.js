const express = require("express");
const cors = require("cors");
const { connection } = require("./config/db");
const { userRouter } = require("./routes/blog/user.route");
const { postRouter } = require("./routes/blog/appPost.route");
const { commentRouter } = require("./routes/blog/comment.route");
const { likeRouter } = require("./routes/blog/likes.route");
const { chatRouter } = require("./routes/blogChat/chat.route");
const http = require("http");
const { initializeSocketServer } = require("./sockets");
const { booksRouter } = require("./routes/Books/book.router.js");
const {
  notificationRouter,
} = require("./routes/notification/notification.route.js");

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("API is working good to go 😍");
});

app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/post", likeRouter);
app.use("/api/blog", commentRouter);
app.use("/api/chat", chatRouter);
app.use("/api/books", booksRouter);
app.use("/api/me", notificationRouter);

// socket server
const server = http.createServer(app);
initializeSocketServer(server);

server.listen(5000, async () => {
  try {
    await connection;
    console.log("Connected to DB!!");
  } catch (error) {
    console.error("Error while connecting to DB:", error);
  }
  console.log(`http://localhost:${5000}`);
});
