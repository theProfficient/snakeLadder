const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const SnakeLadderGroupSchema = new mongoose.Schema(
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
        _id: false,
        UserId: String,
        userName: String,
        prize: {
          type: Number,
          default: 0,
        },
        isBot: {
          type: Boolean,
          default: false,
        },
        points: {
            type: Number,
            default:0,
          },
      },
    ],
    start: {
      type: Boolean,
      default: false,
    },
    isGameOver: {
      type: Boolean,
      default: false,
    },
  },
  { strict: false }
);

module.exports = mongoose.model("SnakeLadderGroup", SnakeLadderGroupSchema);
