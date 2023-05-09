const mongoose = require("mongoose");
const snkTournamentSchema = new mongoose.Schema(
  {
    UserId: {
      type: String,
      trim: true,
    },
    userName: {
      type: String,
      trim: true,
    },
    entryFee: {
      type: Number,
      trim: true,
    },

    prizeAmount: {
      type: Number,
      trim: true,
    },

    players: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["upcoming", "in_progress", "full"],
      default: "in_progress",
    },
    maxTime: {
      type: Number,
    },
    Users: [],
    createdTime: {
      type: Date,
      default: Date.now,
      expires: "30m",
    },
    endTime: {
      type: Date,
    },
  },

  { timestamps: true }
);
module.exports = mongoose.model("snkTournament", snkTournamentSchema);
