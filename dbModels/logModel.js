const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = Schema;

const LogSchema = new Schema(
  {
    action: { type: String, required: true },
    category: { type: String, required: true },
    message: { type: String, required: true },
    diff: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

LogSchema.index({ action: 1, category: 1 });

module.exports = mongoose.model("Log", LogSchema);
