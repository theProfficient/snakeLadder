const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    UserId: {
      type: String,
      required: true,
      trim: true,
    },
    userName: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    referralCode: {
      type: String,
    },
    credits: {
      type: Number,
      default: 10000,
    },
    isBot: {
      type: Boolean,
      default: false,
    },
    realMoney: {
      type: Number,
      default: 0,
    },
    status: {
      type: Boolean,
      default: false,
    },
    history: [],
    cricketData: {
      type: String,
      ref: 'cricket'
    },
    hockeyData: {
      type: String,
      ref: 'hocky'
    },
    snakeLadderData: {
      type: String,
      ref: 'snakeLadder'
    },
    ticTacToeData: {
      type: String,
      ref: 'ticTacToe'
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
