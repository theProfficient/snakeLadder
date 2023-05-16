/** @format */

const mongoose = require("mongoose");
const userModel = require("../model/userModel");
const cricketModel = require("../model/cricketModel");
const hockyModel = require("../model/hockyModel");
const snakeLadderModel = require("../model/snakeLadderModel");
const ticTacToeModel = require("../model/ticTacToeModel");

const createUsers = async function (req, res) {
  try {
    let queryData = req.query;

    let {
      UserId,
      userName,
      email,
      phone,
      status,
      credits,
      referralCode,
      isBot,
    } = queryData;

    if (Object.keys(queryData).length == 0) {
      return res.status(400).send({
        status: false,
        message:
          "Body should  not be Empty please enter some data to create user",
      });
    }
    console.log("queryData>>>>>>>>>>>>>>>",queryData)

    let checkUserId = await userModel.findOne({ UserId: UserId });
    console.log("checkUserId>>>>>>>>>>>>>>>",checkUserId)
    if (checkUserId != null && checkUserId != undefined) {

    //   const userData = await userModel
    //   .findOne({ UserId: UserId })
    //   .populate("cricket")
    //   .populate("hocky")
    //   .populate("snakeLadder")
    //   .populate("ticTacToe"
    // );
    
      // const CricTable = await cricketModel.findOne({ UserId: UserId });
      // const HocTable = await hockyModel.findOne({ UserId: UserId });
      // const SnakeTable = await snakeLadderModel.findOne({ UserId: UserId });
      // const TicTable = await ticTacToeModel.findOne({ UserId: UserId });

      console.log("userData>>>>>>>>>>>>>>>",checkUserId)
      return res.status(200).send({
        status: true,
        message: "UserId already exists",
        data: checkUserId,
      });

    }
    // Generate a unique referral code for the new user
    const referral_Code = Math.random().toString(36).substring(2);
    queryData.referralCode = referral_Code;

    if (referralCode) {
      // Find the referrer by their referral code
      const referrer = await userModel.findOne({ referralCode: referralCode });

      // If the referrer is found, add credits to the referrer's accounts
      if (referrer) {
        referrer.credits += 10;
        await referrer.save();
      } else {
        return res.status(400).json({ error: "Invalid referral code" });
      }
    }

    const userCreated = await userModel.create(queryData);
    const CricTable = await cricketModel.create(queryData);
    const HocTable = await hockyModel.create(queryData);
    const SnakeTable = await snakeLadderModel.create(queryData);
    const TicTable = await ticTacToeModel.create(queryData);

    return res.status(201).send({
      status: true,
      message: "success",
      data: userCreated,
      CricTable,
      HocTable,
      SnakeTable,
      TicTable,
    });
    
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};


// _______find by query params

const getUser = async function (req, res) {
  try {
    let UserId = req.query.UserId;

    const getNewUser = await userModel.findOne({ UserId: UserId }).select({history:0});
    let cricket = await cricketModel.findOne({ UserId: UserId });
    let hocky = await hockyModel.findOne({ UserId: UserId });
    let snakeLadder = await snakeLadderModel.findOne({ UserId: UserId });
    let ticTacToe = await ticTacToeModel.findOne({ UserId: UserId });

    if (getNewUser.length == 0) {
      return res.status(404).send({
        status: false,
        message: "user not found",
      });
    }

    return res.status(200).send({
      status: true,
      message: "user already exist",
      data: getNewUser,
      cricket,
      hocky,
      snakeLadder,
      ticTacToe,
    });
  } catch (err) {
    return res.status(500).send({
      status: false,
      error: err.message,
    });
  }
};

// ___update user

const updateUser = async function (req, res) {
  try {
    let UserId = req.query.UserId;
    let updateData = req.query;

    let { userName, email, phone, credits, status } = updateData;

    if (Object.keys(updateData).length == 0) {
      return res.status(400).send({
        status: false,
        message: "For updating please enter atleast one key",
      });
    }

    let data = {};
    data.userName = userName;
    data.email = email;
    data.phone = phone;
    data.credits = credits;
    data.status = status;

    const userUpdate = await userModel.findOneAndUpdate(
      { UserId: UserId },
      { $set: data },
      { new: true }
    );

    if (userUpdate.length == 0) {
      return res.status(404).send({
        status: false,
        message: "user not found",
      });
    }

    if (userUpdate.length == UserId) {
      return res.status(404).send({
        status: false,
        message: "you can't update UserId",
      });
    }

    return res.status(200).send({
      status: true,
      message: "Success",
      data: userUpdate,
    });
  } catch (err) {
    return res.status(500).send({
      status: false,
      error: err.message,
    });
  }
};

module.exports = { createUsers, getUser, updateUser };