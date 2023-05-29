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
          isGameOverForTable: false,
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
          matchStatus: gameStatus,
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
          isGameOverForTable: false,
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
      data: {
        tableUpdate,
        balance: userHistory.credits,
      },
    });
  } catch (err) {
    return res.status(500).send({
      status: false,
      error: err.message,
    });
  }
};

//__________________________________get groups per players and tableId ____________________________________________
const getGroupsByUser = async function (req, res) {
  try {
    let tableId = req.query.tableId;
    let UserId = req.query.UserId;

    if (Object.keys(req.query).length <= 1) {
      return res.status(400).send({
        status: false,
        message: " Please provide both tableId and UserId ",
      });
    }
    let userExist = await userModel.findOne({ UserId: UserId });

    if (userExist == null) {
      return res.status(404).send({
        status: false,
        message: " User not found ",
      });
    }
    let userName = userExist.userName;

    const table = await groupModelForSnakeLadder.find({ tableId: tableId });
    console.log(table);

    if (table.length === 0) {
      return res.status(404).send({
        status: false,
        message: " This table is not present ",
      });
    }
    let groups = table.map((items) => items.group);
    console.log(groups, "groups>>>>>>>>>>>");

    let user, groupId, users;
    for (let group = 0; group < groups.length; group++) {
      console.log(groups[group], "================================");

      let findUser = groups[group].find((user) => user.userName === userName);

      if (findUser != null) {
        user = findUser;
        groupId = table[group]._id;
        users = groups[group];
        break;
      }
    }

    if (!user) {
      return res.status(404).send({
        status: true,
        message: "this user is not present in any group",
      });
    }

    console.log(user, ">>>>>>>>>>>>>");
    users = users.map((items) => items.userName);
    let usersNameInStr = users.join(" ");

    return res.status(200).send({
      status: true,
      message: "Success",
      groupId,
      usersNameInStr,
    });
  } catch (err) {
    return res.status(500).send({
      status: false,
      error: err.message,
    });
  }
};

//______________________________________get group by groupId_______________________________

const getSnkByGroupId = async function (req, res) {
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
    let createdTime = snakeLadder.createdTime;
    const updatedPlayers = snakeLadder.updatedPlayers;
    let timeDiff = Math.abs(createdTime.getMinutes() - new Date().getMinutes());
    let nxtPlayer = updatedPlayers.find((players) => players.turn === true);
    const checkTable = await snkTournamentModel
      .findById({ _id: tableId })
      .lean();

    if (!checkTable) {
      return res.status(404).send({
        status: false,
        message: "this table is not present in DB",
      });
    }

    //_________________________winner declare_____________

    let reachTheDestination = updatedPlayers.find(
      (players) => players.points === 100
    );

    if (timeDiff >= 4 || reachTheDestination) {
      // checkTable.isGameOverForTable = true;
      // await snkTournamentModel.save();
      let overTheGame = await snkTournamentModel.updateOne(
        { _id: checkTable._id },
        { isGameOverForTable: true },
        { new: true }
      );

      let entryFee = checkTable.entryFee;

      if (updatedPlayers[0].points === updatedPlayers[1].points) {
        updatedPlayers[0].prize = entryFee * 0.75;
        updatedPlayers[0].turn = false;
        updatedPlayers[1].prize = entryFee * 0.75;
        updatedPlayers[1].turn = false;
        let overGame = await groupModelForSnakeLadder.findByIdAndUpdate(
          { _id: groupId },
          { $set: { updatedPlayers: updatedPlayers }, isGameOver: true },
          { new: true }
        );
        let result = {
          _id: snakeLadder._id,
          createdTime: snakeLadder.createdTime,
          currentPoints: 0,
          currentTurn: "game is over",
          currentTime: new Date(),
          nextTurnTime: new Date(),
          tableId: snakeLadder.tableId,
          updatedPlayers: overGame.updatedPlayers,
          start: overGame.start,
          isGameOver: overGame.isGameOver,
          gameEndTime:overGame.gameEndTime
        };
        return res.status(200).json(result);
      }

      let winner =
        updatedPlayers[0].points < updatedPlayers[1].points
          ? updatedPlayers[1]
          : updatedPlayers[0];

      let winnerId = winner.UserId;
      winner.prize = entryFee * 1.5;
      let runner = updatedPlayers.find(
        (players) => players.UserId !== winnerId
      );
      // winner.turn = false;
      // runner.turn = false;

      let playersUpdate = [
        {
          UserId: winner.UserId,
          userName: winner.userName,
          prize: winner.prize,
          isBot: winner.isBot,
          points: winner.points,
          turn: false,
        },
        {
          UserId: runner.UserId,
          userName: runner.userName,
          prize: runner.prize,
          isBot: runner.isBot,
          points: runner.points,
          turn: false,
        },
      ];

      let overGame = await groupModelForSnakeLadder.findOneAndUpdate(
        {
          _id: groupId,
          "updatedPlayers.UserId": { $in: [winnerId, runner.UserId] },
        },
        {
          $set: {
            updatedPlayers: playersUpdate,
            isGameOver: true,
          },
        },
        { new: true }
      );

      if (!overGame) {
        return { status: false, error: "Game not found" };
      }

      // continue with the rest of the code here...

      let result = {
        _id: snakeLadder._id,
        createdTime: snakeLadder.createdTime,
        currentPoints: 0,
        currentTurn: "game is over",
        currentTime: new Date(),
        nextTurnTime: new Date(),
        tableId: snakeLadder.tableId,
        updatedPlayers: overGame.updatedPlayers,
        start: overGame.start,
        isGameOver: overGame.isGameOver,
        gameEndTime:overGame.gameEndTime
      };
      console.log(result.updatedPlayers, "when winner is declared");
      return res.status(200).json(result);
    }

    //_________________update points for bot User________________________________

    let botPlayer = updatedPlayers.find(
      (players) => players.isBot && players.turn
    );

    if (botPlayer) {
      let botPlayerId = botPlayer.UserId;
      const currentUserIndex = updatedPlayers.findIndex(
        (player) => player.UserId === botPlayerId
      );
      const nextUserIndex = (currentUserIndex + 1) % updatedPlayers.length;
      const nextUserId = updatedPlayers[nextUserIndex].UserId;
      const possibleValues = [1, 2, 3, 4, 5, 6];

      const randomIndex = Math.floor(Math.random() * possibleValues.length);

      const randomValue = possibleValues[randomIndex];

      // check for snakes and ladders and tunnel
      const currentPosition = botPlayer.points + randomValue;
      const snakeLadderAndTunnel = {
        5: 12,
        7: 42,
        14: 8,
        15: 48,
        23: 31,
        25: 17,
        26: 57,
        33: 62,
        37: 4,
        38: 50,
        46: 71,
        54: 77,
        61: 67,
        73: 49,
        80: 57,
        88: 69,
        96: 32,
      };
      if (currentPosition in snakeLadderAndTunnel) {
        snakeLadder.updatedPlayers[currentUserIndex].points =
          snakeLadderAndTunnel[currentPosition];
        hit = true;
      } else {
        snakeLadder.updatedPlayers[currentUserIndex].points = currentPosition;
      }

      snakeLadder.updatedPlayers[currentUserIndex].turn = false;
      snakeLadder.updatedPlayers[nextUserIndex].turn = true;
      snakeLadder.lastHitTime = new Date();
      snakeLadder.nextTurnTime = new Date(Date.now() + randomValue * 1000);

      let updatedData = await groupModelForSnakeLadder.findOneAndUpdate(
        { _id: groupId },
        { $set: snakeLadder },
        { new: true }
      );
      let result = {
        _id: snakeLadder._id,
        createdTime: snakeLadder.createdTime,
        currentPoints: randomValue,
        currentTurn: nextUserId,
        currentTime: new Date(),
        nextTurnTime: updatedData.nextTurnTime,
        tableId: snakeLadder.tableId,
        updatedPlayers: snakeLadder.updatedPlayers,
        start: snakeLadder.start,
        isGameOver: snakeLadder.isGameOver,
        gameEndTime:snakeLadder.gameEndTime
      };
      console.log(result.updatedPlayers, "botplayer condition cerisfied");
      return res.status(200).json(result);
    }

    //___________Check if it's time to switch turn to next user

    const timeSinceLastHit =
      Math.abs(snakeLadder.lastHitTime.getTime() - new Date().getTime()) / 1000;
    if (timeSinceLastHit >= 8) {
      //__________Switch turn to next user

      const currentUserIndex = updatedPlayers.findIndex(
        (player) => player.UserId === snakeLadder.currentUserId
      );

      const nextUserIndex = (currentUserIndex + 1) % updatedPlayers.length;
      const nextUserId = updatedPlayers[nextUserIndex].UserId;
      snakeLadder.currentUserId = nextUserId;
      snakeLadder.lastHitTime = new Date();
      snakeLadder.updatedPlayers[nextUserIndex].turn = true;
      snakeLadder.updatedPlayers[currentUserIndex].turn = false;
      snakeLadder.nextTurnTime = new Date(Date.now() + 1 * 1000);

      //___________Save updated snakeLadder to database

      let updateTurn = await groupModelForSnakeLadder.findByIdAndUpdate(
        { _id: groupId },
        { $set: snakeLadder },
        { new: true }
      );

      let result = {
        _id: updateTurn._id,
        createdTime: updateTurn.createdTime,
        currentPoints: 0,
        currentTurn: updateTurn.updatedPlayers[nextUserIndex].UserId,
        currentTime: new Date(),
        nextTurnTime: updateTurn.nextTurnTime,
        tableId: updateTurn.tableId,
        updatedPlayers: snakeLadder.updatedPlayers,
        start: updateTurn.start,
        isGameOver: updateTurn.isGameOver,
        gameEndTime:updateTurn.gameEndTime
      };
      console.log(result.updatedPlayers, "after 8 sec condition satisfied");
      return res.status(200).json(result);
    }
    //________________________update table

    //  let updateTable = await snakeLadderModel.findByIdAndUpdate({_id:tableId},{isMatchOverForTable:true},{new:true});
    let result = {
      _id: snakeLadder._id,
      createdTime: snakeLadder.createdTime,
      currentPoints: 0,
      currentTurn: nxtPlayer.UserId,
      currentTime: new Date(),
      nextTurnTime: snakeLadder.nextTurnTime,
      tableId: snakeLadder.tableId,
      updatedPlayers: snakeLadder.updatedPlayers,
      start: snakeLadder.start,
      isGameOver: snakeLadder.isGameOver,
      gameEndTime:snakeLadder.gameEndTime
    };
    console.log(result.updatedPlayers, "no condition satisfied");
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).send({
      status: false,
      error: err.message,
    });
  }
};

//_____________________________________update points of user________________________________________

const updatePointOfUser = async function (req, res) {
  try {
    let UserId = req.query.UserId;
    let groupId = req.query.groupId;
    let hit = false;
    if (!UserId && !groupId) {
      return res.status(400).send({
        status: false,
        message: "please provide both groupId and UserId",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res
        .status(400)
        .send({ status: false, message: "invalid groupId" });
    }

    let groupExist = await groupModelForSnakeLadder.findById({
      _id: groupId,
    });
    if (!groupExist) {
      return res
        .status(404)
        .send({ status: false, message: "groupId is not present" });
    }
    let updatedPlayers = groupExist.updatedPlayers;
    let isUserExist = groupExist.updatedPlayers.find(
      (players) => players.UserId === UserId
    );

    if (!isUserExist) {
      return res.status(404).send({
        status: false,
        message: "this user is not present in this group",
      });
    }
    let turn = isUserExist.turn;

    if (turn === false) {
      return res.status(400).send({ status: false, message: "not your turn" });
    }
    const currentUserIndex = updatedPlayers.findIndex(
      (player) => player.UserId === UserId
    );
    const nextUserIndex = (currentUserIndex + 1) % updatedPlayers.length;
    const nextUserId = updatedPlayers[nextUserIndex].UserId;
    const possibleValues = [1, 2, 3, 4, 5, 6];

    const randomIndex = Math.floor(Math.random() * possibleValues.length);

    const randomValue = possibleValues[randomIndex];

    // check for snakes, ladders and tunnel
    const currentPosition =
      updatedPlayers[currentUserIndex].points + randomValue;
    const snakeLadderAndTunnel = {
      5: 12,
      7: 42,
      14: 8,
      15: 48,
      23: 31,
      25: 17,
      26: 57,
      33: 62,
      37: 4,
      38: 50,
      46: 71,
      54: 77,
      61: 67,
      73: 49,
      80: 57,
      88: 69,
      96: 32,
    };
    if (currentPosition in snakeLadderAndTunnel) {
      groupExist.updatedPlayers[currentUserIndex].points =
        snakeLadderAndTunnel[currentPosition];
      hit = true;
    } else {
      groupExist.updatedPlayers[currentUserIndex].points = currentPosition;
    }

    groupExist.updatedPlayers[currentUserIndex].turn = false;
    groupExist.updatedPlayers[nextUserIndex].turn = true;
    groupExist.lastHitTime = new Date();
    groupExist.nextTurnTime = new Date(Date.now() + randomValue * 1000);
    let updatedData = await groupModelForSnakeLadder.findOneAndUpdate(
      { _id: groupId },
      { $set: groupExist },
      { new: true }
    );
    let updatedUser = updatedData.updatedPlayers[currentUserIndex];
    let result = {
      currentPoints: randomValue,
      nextTurn: nextUserId,
      currentTime: new Date(),
      nextTurnTime: updatedData.nextTurnTime,
      userName: updatedUser.userName,
      UserId: updatedUser.UserId,
      prize: updatedUser.prize,
      isBot: updatedUser.isBot,
      totalPoints: updatedUser.points,
      turn: updatedUser.turn,
    };
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).send({
      status: false,
      error: err.message,
    });
  }
};

//___________________micro api for getting players__________________

const getPlayersOfSnkLadder = async function (req, res) {
  try {
    let players = await snkTournamentModel
      .find({ endTime: { $gt: new Date() } })
      .sort({ maxTime: 1 })
      .select({ _id: 1, players: 1 });

    if (players.length === 0) {
      return res.status(404).send({
        status: false,
        message: " Data not present",
      });
    }

    return res.status(200).send({
      status: true,
      message: "Success",
      data: players,
    });
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
  getGroupsByUser,
  getSnkByGroupId,
  updatePointOfUser,
  getPlayersOfSnkLadder,
};
