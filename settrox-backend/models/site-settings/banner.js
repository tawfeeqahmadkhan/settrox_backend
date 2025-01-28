const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    image: { type: String, required: true },
    url: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }, 
  },
  { timestamps: true } 
);


module.exports = mongoose.model('Banner', bannerSchema);
