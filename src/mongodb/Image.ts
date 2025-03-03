
import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to User model
    ref: "User", // Must match the model name used in mongoose.model('User', userSchema)
    required: true,
    index: true, // Optional: adds an index for faster queries by userId
  },
  publicId: {
    type: String,
    required: true, // Cloudinary's public_id for the image
    unique: true, // Ensures no duplicate publicIds
  },
  url: {
    type: String,
    required: true, // Secure URL from Cloudinary
  },
  format: {
    type: String,
    required: true, // e.g., "jpg", "png"
  },
  width: {
    type: Number,
    required: true, // Image width from Cloudinary
  },
  height: {
    type: Number,
    required: true, // Image height from Cloudinary
  },
  createdAt: {
    type: Date,
    default: Date.now, // Timestamp of image upload
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Timestamp of last update
  },
});

// Optional: Automatically update `updatedAt` on save
imageSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Image = mongoose.model("Image", imageSchema);

export default Image;