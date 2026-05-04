const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
    },

    role: {
      type: String,
      enum: ["buyer", "seller"],
      required: true,
    },
    authProvider: {
      type: String,
      enum: ["local", "firebase"],
      default: "local",
    },

    firebaseUid: {
      type: String,
    },
  },

  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
