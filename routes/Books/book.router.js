const express = require("express");
const booksRouter = express.Router();
const jwt = require("jsonwebtoken");
const { BooksModel } = require("../../models/books.model.js");
const { auth } = require("../../middlewares/auth.middlewares.js");
const { httpStatus } = require("../../config/lib/statusCode");
const { PagesModel } = require("../../models/pages.model.js");

booksRouter.post("/create", auth, async (req, res) => {
  try {
    const newBook = new BooksModel({ ...req.body, createdBy: req.body.name });
    await newBook.save();

    res
      .status(httpStatus.CREATED)
      .json({ message: "book created", url: newBook?.url });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error });
  }
});

booksRouter.get("/booklist/:username", async (req, res) => {
  try {
    const allBooks = await BooksModel.find({ username: req.params.username });

    res
      .status(httpStatus.OK)
      .json({ data: allBooks, msg: "Data fetch Successfully" });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error });
  }
});

booksRouter.get("/individual/:url", async (req, res) => {
  try {
    const book = await BooksModel.findOne({ url: req.params.url });

    res
      .status(httpStatus.OK)
      .json({ data: book, msg: "Data fetch Successfully" });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error });
  }
});

booksRouter.patch("/update/:url", async (req, res) => {
  try {
    const { url } = req.params;
    const updateResult = await BooksModel.findOneAndUpdate(
      { url: url },
      req.body,
      { new: true }
    );

    if (!updateResult) {
      return res.status(httpStatus.NOT_FOUND).json({ msg: "Book not found" });
    }

    res
      .status(httpStatus.OK)
      .json({ msg: "Data updated successfully", data: updateResult });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
});

booksRouter.patch("/page/update/:url", auth, async (req, res) => {
  const { url } = req.params;
  try {
    const findPage = await PagesModel.findOne({ url: url });

    if (findPage) {
      const updateResult = await PagesModel.findOneAndUpdate(
        { url: url },
        req?.body,
        { new: true }
      );

      res
        .status(httpStatus.CREATED)
        .json({ msg: "Page save successfully", page: updateResult });
    } else {
      const page = new PagesModel({
        ...req.body,
        createdBy: req.body.name,
      });
      await page.save();

      res
        .status(httpStatus.CREATED)
        .json({ msg: "Page save successfully", page: page });
    }
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error });
  }
});

booksRouter.get("/page/individual/:url", async (req, res) => {
  try {
    const book = await PagesModel.findOne({ url: req.params.url });

    res
      .status(httpStatus.OK)
      .json({ data: book, msg: "Data fetch Successfully" });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error });
  }
});

booksRouter.patch("/page/delete", auth, async (req, res) => {
  const { pageurl, bookurl, data } = req.body;

  try {
    await BooksModel.findOneAndUpdate({ url: bookurl }, data, { new: true });
    await PagesModel.findOneAndDelete({ url: pageurl });

    res.status(httpStatus.OK).json({ msg: "Page delete Successfully" });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error });
  }
});

module.exports = { booksRouter };
