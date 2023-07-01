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
          turn:{
            type:Boolean,
            default:false
          },
          dicePoints:{
            type:Number,
            default:0
          },
          currentPoints:{
            type: Number,
            default:0
          },
          movement:{
            type: String,
            default:''
          }
      },
    ],
    start: {
      type: Boolean,
      default: false,
    },
    lastHitTime:{
      type:Date,
      default:new Date()
    },
    currentUserId:{
      type:String,
      default:''
    },
    nextTurnTime:{
      type:Date,
      default:new Date()
    },
    isGameOver: {
      type: Boolean,
      default: false,
    },
    isGameStart: {
      type: Number,
      default: 0,
    },
    gameEndTime: {
      type: Date,
    },
  },
  { strict: false }
);

module.exports = mongoose.model("SnakeLadderGroup", SnakeLadderGroupSchema);
