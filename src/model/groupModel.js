const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const groupSchema = new mongoose.Schema(
  {
    createdTime: {
      type: Date,
      default: Date.now,
      expires: "30m",
    },
    tableId: {
      type: String,
    },
    updatedPlayers: [
      {
        _id:false,
        UserId: String,
        userName: String,
        run: {
          type: Number,
          default: 0,
        },

        wicket: {
          type: Boolean,
          default: false,
        },
        hit: {
          type: Boolean,
          default: false,
        },
      },
    ],
    ball: {
      type: Number,
      default: 0,
    },
    start: {
      type: Boolean,
      default: false,
    },
    currentBallTime: {
      type: Date,
      default: Date.now(),
    },
    nextBallTime: {
      type: Date,
      default: Date.now(),
    },
    ballSpeed: {
      type: Number,
      default: 0,
    },
    // hitted:{
    //   type:Boolean,
    //   default:false
    // }
  },
  { strict: false }
);

module.exports = mongoose.model("Group", groupSchema);