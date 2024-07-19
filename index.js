const express = require("express");
const cors = require("cors");
const { connection } = require("./config/db");
const { auth } = require("./middlewares/auth.middlewares");
const {userRouter} =require("./routes/blog/user.route")
const {postRouter} =require("./routes/blog/appPost.route")
const {commentRouter} =require("./routes/blog/comment.route")
const {likeRouter} =require("./routes/blog/likes.route")
const app = express();
app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.send("Api is working good to go 😍");
});
app.get("/test", auth, (req, res) => {
  res.send("test");
});

app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/post", likeRouter);
app.use("/api/blog", commentRouter);

app.listen(5000, async () => {
  try {
    await connection;
    console.log("connected to DB!!");
  } catch (error) {
    console.error("Error while connecting to DB:", error);
  }
  console.log(`http://localhost:${5000}`);
});
