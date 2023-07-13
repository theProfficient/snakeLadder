const mongoose = require("mongoose");
const userModel = require("../model/userModel");
const tournamentModel = require("../model/tournamentModel");
const cricketModel = require("../model/cricketModel");
const _ = require("lodash");
const fakeUsers = require("../controller/dummyUsers");
const { find } = require("lodash");
const groupModel = require("../model/groupModel");
const snkTournamentModel = require("../model/snkTournamentModel");
const groupModelForSnakeLadder = require("../model/groupModelForSnakeLadder");

const createGroup = async function (tableId) {
  if (tableId != undefined) {
    let table = await tournamentModel.findOne({ _id: tableId });

    if (table != undefined || table != null) {
      let players = table.players;
      let users = table.Users;

      if (users.length !== 0) {
        users = users.map((user) => {
          return {
            UserId: user.UserId,
            userName: user.userName,
            isBot: user.isBot,
          };
        });
        //________________________________import dummyusers and add as per need to complete groups

        let dummyUsers = fakeUsers.fakeUsers;
        dummyUsers = dummyUsers.map((user) => {
          return {
            UserId: user.UserId,
            userName: user.userName,
            isBot: user.isBot,
          };
        });
        const groups = _.chunk(players, 5);

        let completePlayers = [
          ...users,
          ...dummyUsers.slice(0, 5 - (users.length % 5)),
        ];

        let completeGroups = _.chunk(completePlayers, 5);

        for (let i = 0; i < completeGroups.length; i++) {
          let createGrp = await groupModel.create({
            group: completeGroups[i],
            tableId: tableId,
          });
          let grpId = createGrp._id;
          let group = createGrp.group;
          console.log(createGrp);
          // setTimeout(function () {
          startMatch(grpId, group);
          // }, 120000);

          // runUpdateBalls(grpId);
        }
      }
    }
  }
};
async function startMatch(grpId, group) {
  console.log("grpid>>>>>>>>>>>", grpId);
  console.log("groups>>>>>>>>>>>>>>>>>", group);
  if (grpId !== undefined) {
    const result = group.map((name) => ({
      UserId: name.UserId,
      userName: name.userName,
      isBot: name.isBot,
      run: 0,
      hit: false,
      wicket: 0,
      prize: 0,
      isRunUpdated: name.isRunUpdated,
    }));
    console.log("result", result);
    const matchData = await groupModel.findOneAndUpdate(
      { _id: grpId },
      {
        updatedPlayers: result,
        $set: {
          start: true,
          currentBallTime: Date.now(),
          nextBallTime: Date.now() + 1 * 7 * 1000,
        },
      },
      { new: true, setDefaultsOnInsert: true }
    );
    console.log("this is updated data >>>>>>>>>>", matchData);
    setTimeout(function () {
      runUpdateBalls(grpId);
    }, 7000);
  }
}

// setTimeout(() => {
//   startMatch(grpId, group);
// }, 120000);

async function updateBalls(grpId) {
  let min = 0;
  const minSpeed = 7;
  const maxSpeed = 13;
  if (grpId != undefined) {
    let updateWicket = await groupModel.findByIdAndUpdate({ _id: grpId });
    let ballCountForWicket = updateWicket.ball;
    let tableId = updateWicket.tableId;
    if (ballCountForWicket < 6) {
      let updatedPlayers = updateWicket.updatedPlayers.map((player) => {
        if (!player.hit && player.isBot === false) {
          //___________If the player did not hit the ball, set the wicket to true
          player.wicket += 1;
          player.isRunUpdated = false;
        }
        if (player.hit && ballCountForWicket > 0) {
          //______________If the player did not hit the ball, set the wicket to true
          player.hit = false;
          player.isRunUpdated = false;
        }
        return player;
      });
      await groupModel.updateOne({ _id: grpId }, { $set: { updatedPlayers } });
    }
    if (ballCountForWicket === 0) {
      // let endTheMatch = await groupModel.findByIdAndUpdate(
      //   { _id: grpId },
      //   {
      //     isMatchOver: true,
      //   },
      //   { new: true }
      // );
      let updateTable = await tournamentModel.findByIdAndUpdate(
        { _id: tableId },
        { isMatchOverForTable: true },
        { new: true }
      );
      if (!updateTable) {
        return result.status(404).send({
          status: false,
          message: "table is not updated for isMatchOverForTable to true ",
        });
      }
      let players = updateWicket.updatedPlayers.sort((a, b) => {
        if (b.run !== a.run) {
          return b.run - a.run; //__sort by runs in descending order
        } else {
          return a.wicket - b.wicket; //___sort by wickets in ascending order for players with the same runs
        }
      });
      console.log(players, "declareWinners_______________");
      //_________________winner prize as per prize amount

      const prizes = updateTable.prizeAmount;
      players[0].prize = prizes * 0.35;
      players[1].prize = prizes * 0.25;
      players[2].prize = prizes * 0.15;
      players[3].prize = prizes * 0.05;

      const result = await groupModel.findByIdAndUpdate(
        { _id: grpId },
        {
          $set: { updatedPlayers: players },
          isWicketUpdated: true,
          isMatchOver: true,
          ball: 0,
        },
        { new: true }
      );
      let users = result.updatedPlayers;
      //  let prizes = result.updatedPlayers;

      // Create an array of update operations to update the balance of each user
      let userBulkUpdates = users.map((player) => ({
        updateOne: {
          filter: { UserId: player.UserId },
          update: { $inc: { realMoney: player.prize } },
          new: true,
        },
      }));

      // Execute the update operations in a single database call by bulkWrite() method
      const updatedBalance = await userModel.bulkWrite(userBulkUpdates);
    }
    let ballCount;
    if (ballCountForWicket > 0) {
      let updateBall = await groupModel.findByIdAndUpdate(
        { _id: grpId },
        {
          $inc: { ball: -1 },
          nextBallTime: Date.now() + 1 * 7 * 1000,
          currentBallTime: Date.now(),
          ballSpeed:
            Math.floor(Math.random() * (maxSpeed - minSpeed + 1)) + minSpeed,
          isUpdate: false,
        },
        { new: true }
      );

      ballCount = updateBall.ball;

      console.log(ballCount, "ballCount================");
      console.log(updateBall.nextBallTime, "nextBallTime================");
      console.log(
        updateBall.nextBallTime - updateBall.currentBallTime,
        "++++++++++++++++++"
      );

      const updateRunForBot = updateBall.updatedPlayers.map((botPlayers) => {
        if (botPlayers.isBot === true) {
          //___________Determine if the bot player should be out

          if (botPlayers.run > 1 && Math.random() > 0.5) {
            botPlayers.wicket += 1;
            botPlayers.run += 0;
          } else {
            const possibleValues = [1, 2, 3, 4, 6];

            const randomIndex = Math.floor(
              Math.random() * possibleValues.length
            );

            const randomValue = possibleValues[randomIndex];
            botPlayers.run += randomValue;
          }
        }
        return botPlayers;
      });

      await groupModel.updateOne(
        { _id: grpId },
        { $set: { updatedPlayers: updateRunForBot } }
      );
    }

    // if (ballCount === -1) {
    //   // let endTheMatch = await groupModel.findByIdAndUpdate(
    //   //   { _id: grpId },
    //   //   {
    //   //     isMatchOver: true,
    //   //   },
    //   //   { new: true }
    //   // );
    //   let updateTable = await tournamentModel.findByIdAndUpdate(
    //     { _id: tableId },
    //     { isMatchOverForTable: true },
    //     { new: true }
    //   );
    //   if (!updateTable) {
    //     return result
    //       .status(404)
    //       .send({
    //         status: false,
    //         message: "table is not updated for isMatchOverForTable to true ",
    //       });
    //   }
    //   let players = updateWicket.updatedPlayers.sort((a, b) => {
    //     if (b.run !== a.run) {
    //       return b.run - a.run; //__sort by runs in descending order
    //     } else {
    //       return a.wicket - b.wicket; //___sort by wickets in ascending order for players with the same runs
    //     }
    //   });
    //   console.log(players, "declareWinners_______________");
    //   //_________________winner prize as per prize amount

    //   const prizes = updateTable.prizeAmount;
    //   players[0].prize = prizes * 0.35;
    //   players[1].prize = prizes * 0.25;
    //   players[2].prize = prizes * 0.15;
    //   players[3].prize = prizes * 0.05;

    //   const result = await groupModel.findByIdAndUpdate(
    //     { _id: grpId },
    //     {
    //       $set: { updatedPlayers: players },
    //       isWicketUpdated: true,
    //       isMatchOver: true,
    //       ball: 0,
    //     },
    //     { new: true }
    //   );
    //   let users = result.updatedPlayers;
    //   //  let prizes = result.updatedPlayers;

    //   // Create an array of update operations to update the balance of each user
    //   let userBulkUpdates = users.map((player) => ({
    //     updateOne: {
    //       filter: { UserId: player.UserId },
    //       update: { $inc: { realMoney: player.prize } },
    //       new: true,
    //     },
    //   }));

    //   // Execute the update operations in a single database call by bulkWrite() method
    //   const updatedBalance = await userModel.bulkWrite(userBulkUpdates);
    // }

    if (ballCountForWicket <= min - 1) {
      console.log("Reached minimum ball count!");
      return true;
    }
  }
  return false;
}

function runUpdateBalls(grpId) {
  console.log("call the runUpdateBalls function >>>>>>>>>>>", grpId);
  if (grpId != undefined) {
    let continueRunning = true;
    let executionCount = 0;

    async function updateBallsRecursive() {
      if (continueRunning) {
        const isMaxCountReached = await updateBalls(grpId);
        if (!isMaxCountReached && executionCount < 7) {
          executionCount++;
          setTimeout(async () => {
            //________________update nextBallTime, currentBallTime and  ballSpeed in every 4 seconds
            updateBallsRecursive();
          }, 7000);
        }
      }
    }
    updateBallsRecursive();
  }
}
//________________________________________________for snakeLadder________________________________________________

const createGroupForSnakeLadder = async function (tableId) {
  if (tableId != undefined) {
    let table = await snkTournamentModel.findOne({ _id: tableId });

    if (table != undefined || table != null) {
      let players = table.players;
      let users = table.Users;

      if (users.length !== 0) {
        users = users.map((user) => {
          return {
            UserId: user.UserId,
            userName: user.userName,
            isBot: user.isBot,
          };
        });
        //________________________________import dummyusers and add as per need to complete groups

        let dummyUsers = fakeUsers.fakeUsers;
        dummyUsers = dummyUsers.map((user) => {
          return {
            UserId: user.UserId,
            userName: user.userName,
            isBot: user.isBot,
          };
        });
        const groups = _.chunk(players, 2);

        let completePlayers = [
          ...users,
          ...dummyUsers.slice(0, 2 - (users.length % 2)),
        ];

        let completeGroups = _.chunk(completePlayers, 2);

        for (let i = 0; i < completeGroups.length; i++) {
          let createGrp = await groupModelForSnakeLadder.create({
            group: completeGroups[i],
            tableId: tableId,
          });
          let grpId = createGrp._id;
          let group = createGrp.group;
          console.log(createGrp);
          // setTimeout(function () {
          startMatchForSnkLdr(grpId, group);
          //  }, 5000);
        }
      }
    }
  }
};

async function startMatchForSnkLdr(grpId, group) {
  console.log("grpid>>>>>>>>>>>", grpId);
  console.log("groups>>>>>>>>>>>>>>>>>", group);
  if (grpId !== undefined) {
    const result = group.map((name) => ({
      UserId: name.UserId,
      userName: name.userName,
      isBot: name.isBot,
      points: 0,
      turn: name.turn,
      dicePoints: 0,
      currentPoints: 0,
      movement: "",
    }));
    console.log("result", result);
    const matchData = await groupModelForSnakeLadder.findOneAndUpdate(
      { _id: grpId },
      {
        updatedPlayers: result,
        $set: { start: true, gameEndTime: Date.now() + 3 * 60 * 1000 },
      },
      { new: true, setDefaultsOnInsert: true }
    );

    console.log(
      new Date().getSeconds(),
      "====before 6 sec of starting the game==============",
      matchData.isGameStart
    );

    await new Promise((resolve) => {
      setTimeout(async function () {
        let updatedPlayers = matchData.updatedPlayers;
        let currentPlayerIndex = Math.floor(
          Math.random() * updatedPlayers.length
        );
        matchData.updatedPlayers[currentPlayerIndex].turn = true;
        matchData.lastHitTime = new Date();
        matchData.isGameStart = 1;
        matchData.currentUserId = updatedPlayers[currentPlayerIndex].UserId;

        const updatedGroupFst = await matchData.save();
        console.log(
          new Date().getSeconds(),
          "=====after 6 sec of starting the game===========",
          updatedGroupFst.isGameStart
        );

        resolve(); // Resolve the promise to continue with the rest of the code
      }, 6000);
    });

    // Rest of your code here...
  }
}

async function checkTurn(groupId, snakeLadder) {
  let tableId = snakeLadder.tableId;
  let createdTime = snakeLadder.createdTime;
  const updatedPlayers = snakeLadder.updatedPlayers;
  // let timeDiff = Math.abs(createdTime.getMinutes() - new Date().getMinutes());
  let nxtPlayer = updatedPlayers.find((players) => players.turn === true);
  let botPlayer = updatedPlayers.find((player) => player.isBot && player.turn);

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
      currentPosition = snakeLadder.updatedPlayers[currentUserIndex].points;
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
      snakeLadder.updatedPlayers[currentUserIndex].movement = "";
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
    console.log(
      snakeLadder.nextTurnTime.getSeconds(),
      "sec befor db call============="
    );
    let updatedData = await groupModelForSnakeLadder.findOneAndUpdate(
      { _id: groupId },
      {
        $set: snakeLadder,
      },
      { new: true }
    );
    console.log(
      updatedData.nextTurnTime.getSeconds(),
      "sec after db call========"
    );
  }
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
  }
}

async function overTheGame(groupId, snakeLadder) {
  let createdTime = snakeLadder.createdTime;
  let timeDiff = Math.abs(createdTime.getMinutes() - new Date().getMinutes());
  let nxtPlayer = snakeLadder.updatedPlayers.find(
    (players) => players.turn === true
  );
  let reachTheDestination = snakeLadder.updatedPlayers.find(
    (players) => players.points === 99
  );
  let stopInterval;

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
        {
          $set: { updatedPlayers: updatedPlayers },
          isGameOver: true,
          isGameStart: 2,
        },
        { new: true }
      );
      console.log("dicepoints and position of player", result.updatedPlayers);
      // return res.status(200).json(result);
    }

    let winner =
      updatedPlayers[0].points < updatedPlayers[1].points
        ? updatedPlayers[1]
        : updatedPlayers[0];

    let winnerId = winner.UserId;
    winner.prize = entryFee * 1.5;
    let runner = updatedPlayers.find((players) => players.UserId !== winnerId);
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
          isGameStart: 2,
        },
      },
      { new: true }
    );

    if (!overGame) {
      return { status: false, error: "Game not found" };
    }

    // continue with the rest of the code here...
    console.log(result.updatedPlayers, "when winner is declared");
    // return res.status(200).json(result);
    clearInterval(stopInterval);
  }

  stopInterval = setInterval(() => checkTurn(groupId, snakeLadder), 8000);
}

module.exports = {
  startMatch,
  runUpdateBalls,
  createGroup,
  createGroupForSnakeLadder,
};
