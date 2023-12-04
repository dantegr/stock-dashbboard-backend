const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const metricSchema = Schema(
  {
    name: {
      type: String,
      required: [true, "Metric name is missing"],
    },
    value: {
      type: Number,
      required: true,
      default: 0,
    },
    minValue: {
      type: Number,
      required: true,
      default: 0,
    },
    maxValue: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Metric = mongoose.model("Metric", metricSchema);
module.exports = Metric;
