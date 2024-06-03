const express = require("express");
const cors = require("cors");
const { connection } = require("./config/db");
const { userRouter } = require("./routes/users/user.route");
const { auth } = require("./middlewares/auth.middlewares");
const { postRouter } = require("./routes/users/appPost.route");
const { likeRouter } = require("./routes/users/like.route");
const { commentRouter } = require("./routes/users/comment.route");
const app = express();
app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.send("OK");
});
app.get("/test", auth, (req, res) => {
  res.send("test");
});

app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/post", likeRouter);
app.use("/api/post", commentRouter);

app.listen(5000, async () => {
  try {
    await connection;
    console.log("connected to DB!!");
  } catch (error) {
    console.error("Error while connecting to DB:", error);
  }
  console.log(`http://localhost:${5000}`);
});
