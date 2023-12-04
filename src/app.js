const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
mongoose.plugin(require("./diff-pluggin"));
const { createMetric, updateMetric, deleteMetric } = require("./handleMetrics");

const Metric = require("../dbModels/metricModel");
const app = express();
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

app.get("/", (req, res) => {
  res.send("healtz");
});

app.get("/metrics", async (req, res) => {
  try {
    const metrics = await Metric.find({});
    res.status(200).json(metrics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/metric/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const metric = await Metric.findById(id);
    res.status(200).json(metric);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/metric/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const metric = await updateMetric(id, req.body, next);
    res.status(200).json(metric);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

app.delete("/metric/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    await deleteMetric(id, next);
    res.status(200).json({ message: `metric with id ${id} deleted` });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

app.post("/metric", async (req, res, next) => {
  try {
    const metric = await createMetric(req.body, next);
    res.status(200).json(metric);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

mongoose
  .connect(
    "mongodb+srv://admin:2310322492Ftw@stock-dashboard.gosbm36.mongodb.net/stock-dash?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("connected to mongo");
    io.on("connection", (socket) => {
      console.log("a user connected");
      socket.on("disconnect", () => {
        console.log("user disconnected");
      });
    });
    server.listen(3001, () => {
      console.log("app is running on port 3001");
    });
  })
  .catch((error) => {
    console.log(error);
  });
const socketIoObject = io;
module.exports.ioObject = socketIoObject;
