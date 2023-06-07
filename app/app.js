if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const cors = require("cors");
const express = require("express");
const app = express();
const router = require("./routers");
const { errorHandler } = require("./middlewares");
const examScheduler = require("./controllers/cronController");

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(router);
app.use(errorHandler);
examScheduler();

module.exports = app;
