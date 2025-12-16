import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    googleBooksId: {
      type: String,
      required: true,
      index: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: (v) => Number.isInteger(v * 2),
        message: "Ratings must be in 0.5 increments"
      }
    },
    text: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

ReviewSchema.index({userId: 1, googleBooksId: 1}, {unique: true});

export default mongoose.models.Review ||
  mongoose.model("Review", ReviewSchema);
