const mongoose = require("mongoose");
mongoose.plugin(require("./diff-pluggin"));
const { getDiff } = require("./utils");
const socket = require("./app");

const Metric = require("../dbModels/metricModel");

const createMetric = async (body, next) => {
  const createdBody = { ...body, maxValue: body.value, minValue: body.value };
  return Metric.create(createdBody)
    .then((metric) => {
      if (!metric) {
        throw new Error("Target metric was not created. Failed to create.");
      }

      return metric;
    })
    .then((result) => {
      socket.ioObject.sockets.emit("metricCreate", result);
      return result;
    })
    .catch(next)
    .then((metric) => {
      if (metric && typeof metric.log === "function") {
        const data = {
          action: "create-metric",
          category: "metrics",
          message: "Created metric",
        };
        return metric.log(data);
      }
    })
    .catch((err) => {
      console.log("Caught error while logging: ", err);
    });
};

const updateMetric = async (id, body, next) => {
  return Metric.findById(id)
    .then((metric) => {
      if (!metric) {
        throw new Error("Target metric does not exist. Failed to update.");
      }
      const diff = getDiff(body, metric);
      for (const [key, value] of Object.entries(diff)) {
        metric[key] = body[key];
      }

      if (body.value > metric.maxValue) {
        metric.maxValue = body.value;
      }

      if (body.value < metric.minValue) {
        metric.minValue = body.value;
      }

      return metric.save();
    })
    .then((result) => {
      socket.ioObject.sockets.emit("metricUpdate", result);
      return result;
    })
    .catch(next)
    .then((metric) => {
      if (metric && typeof metric.log === "function") {
        const data = {
          action: "update-metric",
          category: "metrics",
          message: "Updated metric",
        };
        return metric.log(data);
      }
    })
    .catch((err) => {
      console.log("Caught error while logging: ", err);
    });
};

const deleteMetric = async (id, next) => {
  return Metric.deleteOne({ _id: id })
    .then((metric) => {
      if (!metric) {
        throw new Error("Target metric does not exist. Failed to update.");
      }

      return metric;
    })
    .then((result) => {
      socket.ioObject.sockets.emit("metricDelete", id);
      return result;
    })
    .catch(next)
    .then((metric) => {
      if (metric && typeof metric.log === "function") {
        const data = {
          action: "delete-metric",
          category: "metrics",
          message: "Deleted metric",
        };
        return metric.log(data);
      }
    })
    .catch((err) => {
      console.log("Caught error while logging: ", err);
    });
};

module.exports = {
  createMetric,
  updateMetric,
  deleteMetric,
};
