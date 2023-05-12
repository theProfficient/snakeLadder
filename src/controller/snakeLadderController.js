const mongoose = require("mongoose");
const userModel = require("../model/userModel");
const snkTournamentModel = require("../model/snkTournamentModel");
const groupModelForSnakeLadder = require("../model/groupModelForSnakeLadder");
const snakeLadderModel = require("../model/snakeLadderModel");

const {
  startMatch,
  createGroupForSnakeLadder,
} = require("../reusableCodes/reusablecode");
//_________________________________________________createSnakeLadder tournaments____________________________________

const createSnakeLadderTables = async function (req, res) {
  try {
    let data = req.query;
    let UserId = req.query.UserId;

    let data1 = {
      entryFee: 1,
      prizeAmount: 1 * 2, //___win amount will be entry fee multiply with 4 players(5-1 = 4)
      maxTime: 1,
    };

    let data2 = {
      entryFee: 10,
      prizeAmount: 10 * 2,
      maxTime: 4,
    };

    let data3 = {
      entryFee: 20,
      prizeAmount: 20 * 2,
      maxTime: 5,
    };

    let data4 = {
      entryFee: 50,
      prizeAmount: 50 * 2,
      maxTime: 10,
    };

    let data5 = {
      entryFee: 100,
      prizeAmount: 100 * 2,
      maxTime: 15,
    };

    let tournamentTable1;
    let tournamentTable2;
    let tournamentTable3;
    let tournamentTable4;
    let tournamentTable5;

    //_______________________create table1 with setinterval an end time___________
    let tableId1;
    async function createTournament1() {
      if (tableId1 != undefined) {
        createGroupForSnakeLadder(tableId1);
      }

      endTime = Date.now() + 1 * 60 * 1000;
      data1.endTime = req.query.endTime = endTime;

      tournamentTable1 = await snkTournamentModel.create(data1);
      tableId1 = tournamentTable1._id;
      console.log(tournamentTable1);
    }

    setInterval(createTournament1, 60000);

    createTournament1();

    //_______________________create table2 with setinterval an end time________________
    let tableId2;

    async function createTournament2() {
      if (tableId2 != undefined) {
        createGroupForSnakeLadder(tableId2);
      }

      endTime = Date.now() + 4 * 60 * 1000;
      data2.endTime = req.query.endTime = endTime;

      tournamentTable2 = await snkTournamentModel.create(data2);
      tableId2 = tournamentTable2._id;
      console.log(tournamentTable2);
    }

    setInterval(createTournament2, 240000);
    createTournament2();

    //_______________________create table3 with setinterval an end time________________
    let tableId3;

    async function createTournament3() {
      if (tableId3 != undefined) {
        createGroupForSnakeLadder(tableId3);
      }

      let endTime = Date.now() + 5 * 60 * 1000;
      data3.endTime = req.query.endTime = endTime;
      tournamentTable3 = await snkTournamentModel.create(data3);
      tableId3 = tournamentTable3._id;
      console.log(tournamentTable3);
    }
    setInterval(createTournament3, 300000);
    createTournament3();

    //  // _______________________create table4 with setinterval an end time________________
    let tableId4;

    async function createTournament4() {
      if (tableId4 != undefined) {
        createGroupForSnakeLadder(tableId4);
      }
      endTime = Date.now() + 10 * 60 * 1000;
      data4.endTime = req.query.endTime = endTime;
      tournamentTable4 = await snkTournamentModel.create(data4);
      tableId4 = tournamentTable4._id;
      console.log(tournamentTable4);
    }
    setInterval(createTournament4, 600000);
    createTournament4();

    //_____________________________create table5 with setinterval an end time____
    let tableId5;

    async function createTournament5() {
      if (tableId5 != undefined) {
        createGroupForSnakeLadder(tableId5);
      }
      endTime = Date.now() + 15 * 60 * 1000;
      data5.endTime = req.query.endTime = endTime;
      tournamentTable5 = await snkTournamentModel.create(data5);
      tableId5 = tournamentTable5._id;
      console.log(tournamentTable5);
    }
    setInterval(createTournament5, 900000);
    createTournament5();

    return res.status(201).send({
      status: true,
      message: "Success",
      data: tournamentTable1,
    });
  } catch (err) {
    return res.status(500).send({
      status: false,
      error: err.message,
    });
  }
};

//______________________________________________get all data of SnakeLadder tournaments______________________________

const getAllSnak = async function (req, res) {
  try {
    let UserId = req.query.UserId;
    let currentTime = new Date();

    //______________only fetch that table which timing is running

    const data = await snkTournamentModel
      .find({ endTime: { $gt: new Date() } })
      .select({
        display: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
        Users: 0,
        createdTime: 0,
      })
      .sort({ maxTime: 1 });

    //__________fetch dataas per user id (it shows user joined in this table now)

    let userData = await snkTournamentModel.aggregate([
      {
        $match: {
          Users: {
            $elemMatch: {
              UserId: UserId,
            },
          },
        },
      },
    ]);

    if (userData.length > 0) {
      let tableId = userData.map((items) => items._id);
      console.log(tableId, "------------");
      let endTime = userData.map((items) => items.endTime);

      //______________________________check the match is started or not

      let gameStatus = [];

      for (let id = 0; id < tableId.length; id++) {
        let status = await groupModelForSnakeLadder.findOne({
          tableId: tableId[id],
        });
        if (status) {
          //check match is running or finshed.
          if (status.isGameOver === false) {
            gameStatus.push({
              tableId: status.tableId,
              start: status.start,
            });
          }
        } else {
          // push data if group is not created
          gameStatus.push({ tableId: tableId[id], start: false });
        }
      }
      if (gameStatus.length !== 0) {
        return res.status(200).send({
          status: true,
          message: "Success",
          gameStatus: gameStatus,
          endTime: endTime,
          joined: true,
          currentTime: currentTime,
          data: data,
        });
      }
    }
    return res.status(200).send({
      status: true,
      message: "Success",
      currentTime: currentTime,
      data: data,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//___________________________________________________update snakeLaddertournament_______________________________

const updateSnakLdrTournaments = async function (req, res) {
  try {
    let tableId = req.query.tableId;
    let UserId = req.query.UserId;
    let updateData = req.query;
    let { status } = updateData;

    if (Object.keys(updateData).length == 0) {
      return res.status(400).send({
        status: false,
        message: "For updating please enter atleast one key",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(tableId)) {
      return res
        .status(400)
        .send({ status: false, message: "invalid tableId" });
    }

    let existTable = await snkTournamentModel.findById({ _id: tableId });
    if (!existTable) {
      return res.status(404).send({
        status: false,
        message: " This table is not present ",
      });
    }
    let ExistPlayers = existTable.players;
    let entryFee = existTable.entryFee;

    let maxPlayes = 100;

    if (ExistPlayers < maxPlayes) {
      status = "in_progress";
    }
    if (ExistPlayers === maxPlayes - 1) {
      status = "full";
    }
    if (ExistPlayers > maxPlayes - 1) {
      return res.status(400).send({ status: false, message: " Full " });
    }

    //________________________________find user,s Name _____________________________________

    let userExist = await userModel.findOne({ UserId: UserId });
    if (!userExist) {
      return res.status(404).send({
        status: false,
        message: " user not found",
      });
    }
    const { userName, isBot, credits } = userExist;

    if (credits < entryFee) {
      return res.status(404).send({
        status: false,
        message: " insufficient balance to play",
      });
    }

    //_______update table with userId and tableId (if user joined perticular table players incereses by 1 automatically)

    let userData = await snkTournamentModel.aggregate([
      {
        $match: {
          Users: {
            $elemMatch: {
              UserId: UserId,
            },
          },
        },
      },
    ]);

    if (userData.length !== 0) {
      for (let i = 0; i < userData.length; i++) {
        let time = userData[i].endTime;
        console.log(time.getMinutes(), "time___________");
        console.log(
          existTable.endTime.getMinutes(),
          "time which he want to join___________"
        );
        if (Math.abs(time.getMinutes() - existTable.endTime.getMinutes()) < 5) {
          return res.status(400).send({
            status: false,
            message: " You can not join",
          });
        }
      }
    }
    //_________________deduct the entryFee from the users credit when user want to join the table

    const tableUpdate = await snkTournamentModel
      .findByIdAndUpdate(
        { _id: tableId },
        {
          $inc: { players: 1 },
          $push: {
            Users: {
              UserId: UserId,
              userName: userName,
              isBot: isBot,
              joined: true,
              endTime: existTable.endTime,
            },
          },
          $set: { status: status },
        },

        { new: true }
      )
      .select({ players: 1, _id: 0 });

    //_______store user's tournament history in user profile

    let time = existTable.createdAt;
    let userHistory = await userModel.findOneAndUpdate(
      { UserId: UserId },
      {
        $push: { history: { tableId: tableId, time: time } },
        $inc: {
          credits: -entryFee,
        },
      },
      { new: true }
    );
    // console.log("users data after deduct the credit >>>>>>>>>>>>>",userHistory)
    return res.status(200).send({
      status: true,
      message: "Success",
      data: tableUpdate,
    });
  } catch (err) {
    return res.status(500).send({
      status: false,
      error: err.message,
    });
  }
};

const getCricByGroupId = async function (req, res) {
  try {
    let groupId = req.query.groupId;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res
        .status(400)
        .send({ status: false, message: "invalid groupId" });
    }
    let snakeLadder = await groupModelForSnakeLadder
      .findById({ _id: groupId })
      .lean();
    if (!snakeLadder) {
      return res
        .status(404)
        .send({ status: false, message: "this groupId not found" });
    }

    let tableId = snakeLadder.tableId;

    const checkTable = await snkTournamentModel
      .findById({ _id: tableId })
      .lean();
    if (!checkTable) {
      return res.status(404).send({
        status: false,
        message: "this table is not present in DB",
      });
    }

    //________________________update table

    //  let updateTable = await snakeLadderModel.findByIdAndUpdate({_id:tableId},{isMatchOverForTable:true},{new:true});
    let result = {
      _id: snakeLadder._id,
      createdTime: snakeLadder.createdTime,
      tableId: snakeLadder.tableId,
      updatedPlayers: snakeLadder.updatedPlayers,
      start: snakeLadder.start,
      currentBallTime: new Date(),
    };

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).send({
      status: false,
      error: err.message,
    });
  }
};

const updatePointOfUser = async function (req, res) {
  try {
    let UserId = req.query.UserId;
    let groupId = req.query.groupId;
    if (!UserId && !groupId) {
      return res
        .status(400)
        .send({ status: false, message: "please provide both groupId and UserId" });
    }
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res
        .status(400)
        .send({ status: false, message: "invalid groupId" });
    }
    let grpIdIsExixt = await groupModelForSnakeLadder.findById({
      _id: groupId,
    });
    if (!grpIdIsExixt) {
      return res
        .status(404)
        .send({ status: false, message: "groupId is not present" });
    }
    let updatedPlayers = grpIdIsExixt.updatedPlayers.find(
      (players) => players.UserId === UserId
    );
    if (!updatedPlayers) {
      return res
        .status(404)
        .send({
          status: false,
          message: "this user is not present in this group",
        });
    }
    let turn = updatedPlayers.turn;
    if (turn === false) {
      return res.status(400).send({ status: false, message: "not your turn" });
    }

    const possibleValues = [1, 2, 3, 4, 5, 6];

    const randomIndex = Math.floor(Math.random() * possibleValues.length);

    const randomValue = possibleValues[randomIndex];
    updatedPlayers.points += randomValue;
    updatedPlayers.turn = false;
    let updatedPointsFstPlayer =
      await groupModelForSnakeLadder.findOneAndUpdate(
        { _id: groupId, updatedPlayers: { $elemMatch: { UserId: UserId } } },
        { $set: { "updatedPlayers.$": updatedPlayers } },
        { new: true }
      );
    let updatedTurn = updatedPointsFstPlayer.updatedPlayers.find(
      (players) => players.UserId === UserId
    );
    let anotherUser = grpIdIsExixt.updatedPlayers.find(
      (players) => players.UserId !== UserId
    );

    if (updatedTurn.turn === false) {
      let userIdOfSecUser = anotherUser.UserId;
      anotherUser.turn = true;

      setTimeout(async function () {
        let updatedPointSecPlayer =
          await groupModelForSnakeLadder.findOneAndUpdate(
            {
              _id: groupId,
              updatedPlayers: { $elemMatch: { UserId: userIdOfSecUser } },
            },
            { $set: { "updatedPlayers.$": anotherUser } },
            { new: true }
          );
      }, randomValue * 1000);
    }
    // if (updatedTurn.turn === false) {
    //   setTimeout(async function () {
    //     let updatedPointSecPlayer =
    //       await groupModelForSnakeLadder.findOneAndUpdate(
    //         {
    //           _id: groupId,
    //           updatedPlayers: { $elemMatch: { UserId: userIdOfSecUser } },
    //         },
    //         { $set: { "updatedPlayers.$": anotherUser } },
    //         { new: true }
    //       );
    //   }, 8000);

    let result ={
    currentPoints: randomValue,
    nextTurn: anotherUser.UserId,
    UserId: updatedTurn.UserId,
    userName: updatedTurn.userName,
    prize: updatedTurn.prize,
    isBot: updatedTurn.isBot,
    totalPoints: updatedTurn.points,
    turn: updatedTurn.turn
    }
    // }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).send({
      status: false,
      error: err.message,
    });
  }
};
module.exports = {
  updateSnakLdrTournaments,
  getAllSnak,
  createSnakeLadderTables,
  getCricByGroupId,
  updatePointOfUser,
};
