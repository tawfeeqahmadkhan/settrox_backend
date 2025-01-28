const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    videoUrl: { type: String, required: true },
  },
  { timestamps: true }
);

// Ensure only one document exists
videoSchema.statics.getVideo = function() {
  return this.findOneAndUpdate(
    {},
    {},
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

module.exports = mongoose.model("Video", videoSchema);