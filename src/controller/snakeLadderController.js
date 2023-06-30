const mongoose = require("mongoose");
const userModel = require("../model/userModel");
const snkTournamentModel = require("../model/snkTournamentModel");
const groupModelForSnakeLadder = require("../model/groupModelForSnakeLadder");
const snakeLadderModel = require("../model/snakeLadderModel");

const {
  startMatch,
  createGroupForSnakeLadder,
} = require("../reusableCodes/reusablecode");
const { log } = require("console");

//____________________________________create snakeladder tournaments by admin___________

const snkTablesCreatedByAdmin = async function (req, res) {
  try {
    let {
      entryFee,
      prizeAmount,
      players,
      status,
      maxTime,
      endTime,
      rank,
      rank1,
      rank2,
      rank3,
      rank4,
      tableByAdmin,
    } = req.body;

    endTime = Date.now() + req.body.maxTime * 60 * 1000;
    req.body.endTime = endTime;
    req.body.tableByAdmin = true;

    let tableByAdmin1I = await snkTournamentModel.create(req.body);
    let tableId1 = tableByAdmin1I._id;
    createGroupForSnakeLadder(tableId1);
    console.log(tableByAdmin1I);

    return res.status(201).send({
      status: true,
      message: "Success",
      data: tableByAdmin1I,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

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

      endTime = Date.now() + 1 * 20 * 1000;
      data1.endTime = req.query.endTime = endTime;

      tournamentTable1 = await snkTournamentModel.create(data1);
      tableId1 = tournamentTable1._id;
      console.log(tournamentTable1);
    }

    setInterval(createTournament1, 20000);

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
      // console.log(tournamentTable2);
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
      // console.log(tournamentTable3);
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
      // console.log(tournamentTable4);
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
      // console.log(tournamentTable5);
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
  //try {
    let UserId = req.query.UserId;
    let currentTime = new Date();

    //______________only fetch that table which timing is running

    const data = await snkTournamentModel
      .find({ endTime: { $gt: new Date() }, isGameOverForTable: false })
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
    console.log(userData, "++++++++++++++++++++");
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
  // } catch (error) {
  //   return res.status(500).send({
  //     status: false,
  //     message: error.message,
  //   });
  // }
};

//___________________________________________________update snakeLaddertournament_______________________________

const updateSnakLdrTournaments = async function (req, res) {
  //try {
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
    let maxPlayers = existTable.maxPlayers;

    // let maxPlayers = 100;

    if (ExistPlayers < maxPlayers) {
      status = "in_progress";
    }
    if (ExistPlayers === maxPlayers - 1) {
      status = "full";
    }
    if (ExistPlayers > maxPlayers - 1) {
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
        $push: {
          history: { gameType: "snakeLadder", tableId: tableId, time: time },
        },
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
  // } catch (err) {
  //   return res.status(500).send({
  //     status: false,
  //     error: err.message,
  //   });
  // }
};

//__________________________________get groups per players and tableId ____________________________________________
const getGroupsByUser = async function (req, res) {
  // try {
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
    console.log("table>>>>>>>>>>>>>>", table);

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
  // } catch (err) {
  //   return res.status(500).send({
  //     status: false,
  //     error: err.message,
  //   });
  // }
};

//______________________________________get group by groupId_______________________________

const getSnkByGroupId = async function (req, res) {
 // try {
    let groupId = req.query.groupId;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res
        .status(400)
        .send({ status: false, message: "invalid groupId" });
    }
    let snakeLadder = await groupModelForSnakeLadder.findById({ _id: groupId });

    if (!snakeLadder) {
      return res
        .status(404)
        .send({ status: false, message: "this groupId not found" });
    }

    let tableId = snakeLadder.tableId;
    let createdTime = snakeLadder.createdTime;
    const updatedPlayers = snakeLadder.updatedPlayers;
    let timeDiff = Math.abs(createdTime.getMinutes() - new Date().getMinutes());
    let crntPlayer = updatedPlayers.find((players) => players.turn === true);
    // const cnrtPlayer = updatedPlayers.find(
    //   (players) => players.dicePoints !== 0
    // );
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
      (players) => players.points === 99
    );

    if (timeDiff >= 4 || reachTheDestination) {
      let overTheGame = await snkTournamentModel.findByIdAndUpdate(
        { _id: tableId },
        { isGameOverForTable: true },
        { new: true }
      );
      console.log(overTheGame, "overTheGame==============");
      let entryFee = checkTable.entryFee;

      if (updatedPlayers[0].points === updatedPlayers[1].points) {
        updatedPlayers[0].prize = entryFee * 0.75;
        updatedPlayers[0].turn = false;
        updatedPlayers[0].dicePoints = 0;
        updatedPlayers[1].prize = entryFee * 0.75;
        updatedPlayers[1].turn = false;
        updatedPlayers[1].dicePoints = 0;
        let overGame = await groupModelForSnakeLadder.findByIdAndUpdate(
          { _id: groupId },
          { $set: { updatedPlayers: updatedPlayers }, isGameOver: true },
          { new: true }
        );
        let result = {
          currentTurn: "game is over",
          currentTime: new Date(),
          nextTurnTime: new Date(),
          tableId: snakeLadder.tableId,
          updatedPlayers: overGame.updatedPlayers,
          isGameOver: overGame.isGameOver,
          gameEndTime: overGame.gameEndTime,
        };
        console.log("dicepoints and position of player", result.updatedPlayers);
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
          dicePoints: 0,
        },
        {
          UserId: runner.UserId,
          userName: runner.userName,
          prize: runner.prize,
          isBot: runner.isBot,
          points: runner.points,
          turn: false,
          dicePoints: 0,
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
        currentTurn: "game is over",
        currentTime: new Date(),
        nextTurnTime: new Date(),
        tableId: snakeLadder.tableId,
        updatedPlayers: overGame.updatedPlayers,
        isGameOver: overGame.isGameOver,
        gameEndTime: overGame.gameEndTime,
      };
      console.log(result.updatedPlayers, "when winner is declared");
      return res.status(200).json(result);
    }

    //_________________update points for bot User________________________________

    let botPlayer = updatedPlayers.find(
      (player) => player.isBot && player.turn
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

      // Calculate current position
      const currentPosition = botPlayer.points + randomValue;

      // Check for snakes, ladders, and tunnels
      const snakeLadderAndTunnel = {
        4: 11, //--------------tunnel
        6: 41, //--------------ladder
        13: 7, //--------------snake
        14: 47, //--------------ladder
        22: 30, //--------------tunnel
        24: 16, //--------------snake
        25: 56, //--------------Ladder
        32: 61, //--------------Ladder
        36: 3, //--------------snake
        37: 49, //--------------tunnel
        45: 70, //--------------Ladder
        53: 76, //--------------Laadder
        60: 66, //--------------tunnel
        72: 48, //--------------snake
        79: 56, //--------------snake
        87: 68, //--------------snake
        95: 31, //--------------snake
      };

      if (currentPosition > 99) {
        // If position exceeds 99, handle game logic
        snakeLadder.updatedPlayers[currentUserIndex].dicePoints = randomValue;
        snakeLadder.updatedPlayers[nextUserIndex].dicePoints = 0;
        snakeLadder.updatedPlayers[currentUserIndex].currentPoints =
          currentPosition;
        snakeLadder.currentUserId = nextUserId;
        snakeLadder.lastHitTime = new Date();
        snakeLadder.updatedPlayers[currentUserIndex].turn = false;
        snakeLadder.updatedPlayers[nextUserIndex].turn = true;
        snakeLadder.nextTurnTime = new Date(Date.now() + 8 * 1000);
        snakeLadder.lastHitTime = new Date();

        let updatedData = await groupModelForSnakeLadder.findOneAndUpdate(
          { _id: groupId },
          {
            $set: snakeLadder,
          },
          { new: true }
        );
        let result = {
          currentTurn: nextUserId,
          currentTime: new Date(),
          nextTurnTime: updatedData.nextTurnTime,
          tableId: snakeLadder.tableId,
          updatedPlayers: updatedData.updatedPlayers,
          isGameOver: snakeLadder.isGameOver,
          gameEndTime: snakeLadder.gameEndTime,
        };
        return res.status(200).json(result);
      }
      
      if (currentPosition in snakeLadderAndTunnel) {
        // Update position based on snakes, ladders, and tunnels
        snakeLadder.updatedPlayers[currentUserIndex].points =
        snakeLadderAndTunnel[currentPosition];
        snakeLadder.updatedPlayers[currentUserIndex].movement =
        currentPosition === 6 ||
        currentPosition === 14 ||
        currentPosition === 25 ||
        currentPosition === 32 ||
        currentPosition === 45 ||
        currentPosition === 53
        ? "Ladder"
        : currentPosition === 4 ||
        currentPosition === 22 ||
        currentPosition === 37 ||
        currentPosition === 60
        ? "Tunnel"
        : "Snake";
      } else {
        snakeLadder.updatedPlayers[currentUserIndex].points = currentPosition;
        snakeLadder.updatedPlayers[currentUserIndex].movement = '';
      }
      
      snakeLadder.updatedPlayers[currentUserIndex].dicePoints = randomValue;
      snakeLadder.updatedPlayers[nextUserIndex].dicePoints = 0;
      snakeLadder.updatedPlayers[currentUserIndex].currentPoints =
      currentPosition;
      snakeLadder.currentUserId = nextUserId;
      snakeLadder.updatedPlayers[currentUserIndex].turn = false;
      snakeLadder.updatedPlayers[nextUserIndex].turn = true;
      snakeLadder.nextTurnTime = new Date(Date.now() + 8 * 1000);
      snakeLadder.lastHitTime = new Date();
      console.log(snakeLadder.nextTurnTime.getSeconds(),"sec befor db call=============")
      let updatedData = await groupModelForSnakeLadder.findOneAndUpdate(
        { _id: groupId },
        {
          $set: snakeLadder,
        },
        { new: true }
        );
        console.log(updatedData.nextTurnTime.getSeconds(),"sec after db call========")
        
        // console.log(
        //   updatedData.updatedPlayers,
        //   "after updating the bot player point"
        //   );
          let result = {
            currentTurn: nextUserId,
            currentTime: new Date(),
            nextTurnTime: updatedData.nextTurnTime,
            tableId: snakeLadder.tableId,
            updatedPlayers: updatedData.updatedPlayers,
            isGameOver: snakeLadder.isGameOver,
            gameEndTime: snakeLadder.gameEndTime,
          };
          
          console.log(updatedData.lastHitTime.getSeconds(),"time of updatedData=================")
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
      //  snakeLadder.lastHitTime = new Date();
      snakeLadder.updatedPlayers[currentUserIndex].dicePoints = 0;
      snakeLadder.updatedPlayers[nextUserIndex].dicePoints = 0;
      snakeLadder.updatedPlayers[nextUserIndex].turn = true;
      snakeLadder.updatedPlayers[currentUserIndex].turn = false;
      snakeLadder.nextTurnTime = new Date(Date.now() + 8 * 1000);
      snakeLadder.lastHitTime = new Date();

      // snakeLadder.nextTurnTime = new Date(Date.now() + 1 * 1000);

      //___________Save updated snakeLadder to database

      let updateTurn = await groupModelForSnakeLadder.findByIdAndUpdate(
        { _id: groupId },
        { $set: snakeLadder },
        { new: true }
      );
      //const remainingTime = ((updateTurn.nextTurnTime - Date.now()) / 1000).toFixed(3);
      let result = {
        message:"turn is paased due to not hit the put api",
        currentTurn: updateTurn.updatedPlayers[nextUserIndex].UserId,
        currentTime: new Date(),
        nextTurnTime: updateTurn.nextTurnTime,
        tableId: updateTurn.tableId,
        updatedPlayers: updateTurn.updatedPlayers,
        isGameOver: updateTurn.isGameOver,
        gameEndTime: updateTurn.gameEndTime,
      };
      return res.status(200).json(result);
    } else {
      // Not enough time has passed for the turn to switch
      // const cnrtPlayer = updatedPlayers.find(
      //   (players) => players.dicePoints !== 0
      // );
      if (crntPlayer === undefined || crntPlayer === null) {
        let result = {
          currentTurn: "wait for the turn",
          currentTime: new Date(),
          nextTurnTime: snakeLadder.nextTurnTime,
          tableId: snakeLadder.tableId,
          updatedPlayers: snakeLadder.updatedPlayers,
          isGameOver: snakeLadder.isGameOver,
          gameEndTime: snakeLadder.gameEndTime,
        };
        console.log("Wait for the turn");
        return res.status(200).json(result);
      } else {
        let result = {
          currentTurn: crntPlayer.UserId,
          currentTime: new Date(),
          nextTurnTime: snakeLadder.nextTurnTime,
          tableId: snakeLadder.tableId,
          updatedPlayers: snakeLadder.updatedPlayers,
          isGameOver: snakeLadder.isGameOver,
          gameEndTime: snakeLadder.gameEndTime,
        };
        console.log("dicepoints and position of player", result.updatedPlayers);
        return res.status(200).json(result);
      }
      
    }
  // } catch (err) {
  //   return res.status(500).send({
  //     status: false,
  //     error: err.message,
  //   });
  // }
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
      return res.status(200).send({ message: "not your turn" });
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
      4: 11, //--------------tunnel
      6: 41, //--------------ladder
      13: 7, //--------------snake
      14: 47, //--------------ladder
      22: 30, //--------------tunnel
      24: 16, //--------------snake
      25: 56, //--------------Ladder
      32: 61, //--------------Ladder
      36: 3, //--------------snake
      37: 49, //--------------tunnel
      45: 70, //--------------Ladder
      53: 76, //--------------Laadder
      60: 66, //--------------tunnel
      72: 48, //--------------snake
      79: 56, //--------------snake
      87: 68, //--------------snake
      95: 31, //--------------snake
    };
    if (currentPosition > 99) {
      updatedPlayers[currentUserIndex].dicePoints = randomValue;
      updatedPlayers[currentUserIndex].currentPoints = currentPosition;
      updatedPlayers[currentUserIndex].turn = false;
      updatedPlayers[currentUserIndex].turn = false;
      // updatedPlayers[nextUserIndex].turn = true;
      groupExist.updatedPlayers = updatedPlayers;
      // groupExist.lastHitTime = new Date();
      // groupExist.currentUserId = nextUserId;
      groupExist.nextTurnTime = new Date(Date.now() + 8 * 1000);

      let updatedData = await groupExist.save();

      let updatedUser = updatedData.updatedPlayers[currentUserIndex];
      let result = {
        nextTurn: nextUserId,
        currentTime: new Date(),
        nextTurnTime: updatedData.nextTurnTime,
        currentPoints: currentPosition,
        dicePoints: randomValue,
        userName: updatedUser.userName,
        UserId: updatedUser.UserId,
        prize: updatedUser.prize,
        isBot: updatedUser.isBot,
        totalPoints: updatedUser.points,
        turn: updatedUser.turn,
      };
      console.log(result, "===========================");
      setTimeout(() => {
        groupExist.lastHitTime = new Date();
        groupExist.currentUserId = nextUserId;
        // groupExist.updatedPlayers[currentUserIndex].turn = false;
        groupExist.updatedPlayers[nextUserIndex].turn = true;
        //groupExist.updatedPlayers[nextUserIndex].diceHitted = false;
        groupExist.save();
        console.log(
          "after 8 sec in get >>>>>>>>>>",
          new Date().getSeconds(),
          groupExist
        );
      }, 2000);

      return res.status(200).json(result);
    }
    if (currentPosition in snakeLadderAndTunnel) {
      updatedPlayers[currentUserIndex].points =
        snakeLadderAndTunnel[currentPosition];
      updatedPlayers[currentUserIndex].movement =
        currentPosition === 6 ||
        currentPosition === 14 ||
        currentPosition === 25 ||
        currentPosition === 32 ||
        currentPosition === 45 ||
        currentPosition === 53
          ? "Ladder"
          : currentPosition === 4 ||
            currentPosition === 22 ||
            currentPosition === 37 ||
            currentPosition === 60
          ? "Tunnel"
          : "Snake";
    } else {
      updatedPlayers[currentUserIndex].points = currentPosition;
      updatedPlayers[currentUserIndex].movement = '';
    }

    updatedPlayers[currentUserIndex].dicePoints = randomValue;
    updatedPlayers[currentUserIndex].currentPoints = currentPosition;
    updatedPlayers[currentUserIndex].turn = false;
    // updatedPlayers[nextUserIndex].turn = true;
    groupExist.updatedPlayers = updatedPlayers;
    // groupExist.lastHitTime = new Date();
    // groupExist.currentUserId = nextUserId;
    groupExist.nextTurnTime = new Date(Date.now() + 8 * 1000);

    let updatedData = await groupExist.save();
    let updatedUser = updatedData.updatedPlayers[currentUserIndex];
    if (
      currentPosition === 6 ||
      currentPosition === 14 ||
      currentPosition === 25 ||
      currentPosition === 32 ||
      currentPosition === 45 ||
      currentPosition === 53
    ) {
      let result = {
        nextTurn: nextUserId,
        currentTime: new Date(),
        nextTurnTime:updatedData.nextTurnTime,
        currentPoints: currentPosition,
        dicePoints: randomValue,
        userName: updatedUser.userName,
        UserId: updatedUser.UserId,
        prize: updatedUser.prize,
        isBot: updatedUser.isBot,
        totalPoints: updatedUser.points,
        turn: updatedUser.turn,
      };
      console.log(result, "==========================");

      setTimeout(() => {
        groupExist.lastHitTime = new Date();
        groupExist.currentUserId = nextUserId;
        //groupExist.updatedPlayers[currentUserIndex].turn = false;
        groupExist.updatedPlayers[nextUserIndex].turn = true;
        //groupExist.updatedPlayers[nextUserIndex].diceHitted = false;
        groupExist.save();
        console.log(
          "after 8 sec in get >>>>>>>>>>",
          new Date().getSeconds(),
          groupExist
        );
      }, 4000);
      return res.status(200).json(result);
    } else {
      let result = {
        nextTurn: nextUserId,
        currentTime: new Date(),
        nextTurnTime: updatedData.nextTurnTime,
        currentPoints: currentPosition,
        dicePoints: randomValue,
        userName: updatedUser.userName,
        UserId: updatedUser.UserId,
        prize: updatedUser.prize,
        isBot: updatedUser.isBot,
        totalPoints: updatedUser.points,
        turn: updatedUser.turn,
      };
      setTimeout(() => {
        groupExist.lastHitTime = new Date();
        groupExist.currentUserId = nextUserId;
       // groupExist.updatedPlayers[currentUserIndex].turn = false;
        groupExist.updatedPlayers[nextUserIndex].turn = true;
        //groupExist.updatedPlayers[nextUserIndex].diceHitted = false;
        groupExist.save();
        console.log(
          "after 8 sec in get >>>>>>>>>>",
          new Date().getSeconds(),
          groupExist
        );
      }, 2000);
      return res.status(200).json(result);
    }
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
  snkTablesCreatedByAdmin,
  updateSnakLdrTournaments,
  getAllSnak,
  createSnakeLadderTables,
  getGroupsByUser,
  getSnkByGroupId,
  updatePointOfUser,
  getPlayersOfSnkLadder,
};
