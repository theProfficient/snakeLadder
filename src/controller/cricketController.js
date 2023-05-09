const mongoose = require("mongoose");
const userModel = require("../model/userModel");
const cricketModel = require("../model/cricketModel");
const groupModel = require("../model/groupModel");
const { getPlayers } = require("./tournamentController");
const { log } = require("console");
const tournamentModel = require("../model/tournamentModel");
const { xorBy } = require("lodash");

//_______________________get All data of cricket for leaderBoard

const getAllCric = async function (req, res) {
  try {
    let data = req.query;

    const cricketData = await cricketModel.find(data).sort({ cricWins: -1 });

    if (data.length == 0) {
      return res
        .status(404)
        .send({ status: false, message: " no data is  found " });
    }
    return res.status(200).send({
      status: true,
      message: "Success",
      data: cricketData,
    });
  } catch (err) {
    return res.status(500).send({
      status: false,
      error: err.message,
    });
  }
};

// _______________________get cricket group by id data

const getCricByGroupId = async function (req, res) {
  try {
    let groupId = req.query.groupId;

    let cricket = await groupModel.findById({ _id: groupId });
    if (!cricket) {
      return res
        .status(404)
        .send({ status: false, message: "this groupId not found" });
    }

     let tableId = cricket.tableId;

     const checkTable = await tournamentModel.findById(tableId).lean();
     if (!checkTable) {
       return res.status(404).send({
         status: false,
         message: "this table is not present in DB",
       });
     }
     let ballCount = cricket.ball
     if(ballCount === 0 && isWicketUpdated === false){
      // let  updatedPlayers = cricket.updatedPlayers.map((players)=> {
      //   if (!players.hit && players.isBot === false) {
      //     //___________If the player did not hit the ball, set the wicket to true
      //     players.wicket += 1;
      //     players.isWicketUpdated = true
      //   }
      //   return players;
      // });

      // await groupModel.updateOne({ _id: groupId }, { $set: { updatedPlayers } });
   

    // let players = cricket.updatedPlayers.sort((a,b) => {
    //   if(b.run !== a.run){
    //     return b.run - a.run; //__sort by runs in descending order
    //   }else{
    //     return a.wicket - b.wicket; //___sort by wickets in ascending order for players with the same runs
    //   }
    //  })
    //  console.log(players,"declareWinners_______________");

    //merging code of sort and map function

    let players = cricket.updatedPlayers.map((player) => {
      if (!player.hit && player.isBot === false && isWicketUpdated === false) {
        player.wicket += 1; // If the player did not hit the ball, set the wicket to true
        player.isWicketUpdated = true;
      }
      return player;
    }).sort((a, b) => {
      if (b.run !== a.run) {
        return b.run - a.run; // Sort by runs in descending order
      } else {
        return a.wicket - b.wicket; // Sort by wickets in ascending order for players with the same runs
      }
    });
    
    console.log(players, "declareWinners_______________");
    

    //_________________winner prize as per prize amount
      
    const prizes = checkTable.prizeAmount;
    players[0].prize = prizes * 0.35;
    players[1].prize = prizes * 0.25;
    players[2].prize = prizes * 0.15;
    players[3].prize = prizes * 0.05;

    const result = await groupModel.findByIdAndUpdate(
      {_id:groupId},
      {$set:{updatedPlayers:players},
      isWicketUpdated :true},
      {new:true}
    )
    let users = result.updatedPlayers;
    let tableId = result.tableId ;
    //  let prizes = result.updatedPlayers;
    
    // Create an array of update operations to update the balance of each user
    let userBulkUpdates = users.map((player) => ({
      updateOne: {
        filter: { UserId: player.UserId },
        update: { $inc: { realMoney: player.prize } },
        new: true
      }
    }));
    
    // Execute the update operations in a single database call by bulkWrite() method
    const updatedBalance = await userModel.bulkWrite(userBulkUpdates);
    
    //________________________update table

     let updateTable = await tournamentModel.findByIdAndUpdate({_id:tableId},{isMatchOverForTable:true},{new:true});
    let resForWinners = {
      _id: result._id,
      createdTime: result.createdTime,
      tableId: result.tableId,
      updatedPlayers: result.updatedPlayers,
      ball: result.ball,
      start: result.start,
      currentBallTime: new Date(),
      nextBallTime: result.nextBallTime,
      ballSpeed: result.ballSpeed,
    };
    
    return res.status(200).json(resForWinners);
  }
    
    if (cricket.updatedPlayers.length !== 0) {
      let cricket1 = {
        _id: cricket._id,
        createdTime: cricket.createdTime,
        tableId: cricket.tableId,
        updatedPlayers: cricket.updatedPlayers,
        ball: cricket.ball,
        start: cricket.start,
        currentBallTime: new Date(),
        nextBallTime: cricket.nextBallTime,
        ballSpeed: cricket.ballSpeed,
      };
      return res.status(200).json(cricket1);
      
    }
    return res.status(200).json(cricket);
  } catch (err) {
    return res.status(500).send({
      status: false,
      error: err.message,
    });
  }
};



//____________________________update table__________________________

const updateCric = async function (req, res) {
  try {
    let updateData = req.query;
    let UserId = req.query.UserId;
    let groupId = req.query.groupId;
    let currentTime = Date.now();

    //____________find the document and update the run for the specified user
    const groupExist = await groupModel
      .findOne({ _id: groupId })
      .select({ group: 0 });

    if (!groupExist) {
      console.error("No matching document found");
      return res.status(404).send({
        status: false,
        message: "No matching document found",
        data: null,
      });
    }
    let group = groupExist.updatedPlayers;
    const user = group.find((user) => user.UserId.includes(UserId));
    if (!user) {
      return res.status(404).send({
        status: true,
        message: "this user is not present in this group",
      });
    }
    let storedBallTime = groupExist.currentBallTime;
    let ballSpeed = groupExist.ballSpeed;
    console.log(storedBallTime, "time of ball");

    const index = groupExist.updatedPlayers.findIndex(
      (player) => player.UserId === UserId
    );

    if (index === -1) {
      console.error("User not found in the updatedPlayers array");
      return res.status(404).send({
        status: false,
        message: "User not found in the updatedPlayers array",
        data: null,
      });
    }

    //______________________check the time diff and calculate run per player

    let isRunUpdated = groupExist.updatedPlayers[index].isRunUpdated;
    let updatedRun = groupExist.updatedPlayers[index].run;
    let ballCount = groupExist.ball;
    let timeDiff = Math.abs(Math.floor((currentTime - storedBallTime) / 1000));

    console.log("isRunUpdated>>>>>>>>>>>>>>", isRunUpdated);
    console.log("timeDiff>>>>>>>>>>>>>>>>>>>", timeDiff);
    console.log("ballSpeed++++++++++++++++++", ballSpeed);
    console.log("updatedRun>>>>>>>>>>>>>>>>>>", updatedRun);

    if (isRunUpdated === false) {
      let currentRun = 1;

      switch (ballSpeed) {
        case 11:
        case 12:
          if (timeDiff >= 20) {
            currentRun = 4;
          } else if (timeDiff >= 18) {
            currentRun = 2;
          } else if (timeDiff >= 14) {
            currentRun = 6;
          } else if (timeDiff >= 10) {
            currentRun = 1;
          } else if (timeDiff >= 1) {
            currentRun = 3;
          } else {
            console.log("You just missed the ball");
          }
          break;
        case 13:
        case 14:
          if (timeDiff >= 20) {
            currentRun = 3;
          } else if (timeDiff >= 18) {
            currentRun = 1;
          } else if (timeDiff >= 14) {
            currentRun = 6;
          } else if (timeDiff >= 10) {
            currentRun = 4;
          } else if (timeDiff >= 1) {
            currentRun = 2;
          } else {
            console.log("You just missed the ball");
          }
          break;
        case 15:
        case 16:
          if (timeDiff >= 20) {
            currentRun = 6;
          } else if (timeDiff >= 18) {
            currentRun = 1;
          } else if (timeDiff >= 14) {
            currentRun = 3;
          } else if (timeDiff >= 10) {
            currentRun = 2;
          } else if (timeDiff >= 1) {
            currentRun = 4;
          } else {
            console.log("You just missed the ball");
          }
          break;
        case 17:
        case 18:
          if (timeDiff >= 20) {
            currentRun = 6;
          } else if (timeDiff >= 18) {
            currentRun = 2;
          } else if (timeDiff >= 14) {
            currentRun = 3;
          } else if (timeDiff >= 10) {
            currentRun = 4;
          } else if (timeDiff >= 1) {
            currentRun = 1;
          } else {
            console.log("You just missed the ball");
          }
          break;

        default:
          currentRun = 1
          console.log("Invalid ball speed");
      }

      console.log("run>>>>>>>>>>>>", currentRun);
      let playersUpdate = groupExist.updatedPlayers.find(
        (players) => players.UserId === UserId
      );

      updatedRun = updatedRun + currentRun;
      playersUpdate.hit = true;
      playersUpdate.isRunUpdated = true;
      playersUpdate.run = updatedRun;

      let updatedGroupFstHit = await groupModel.findOneAndUpdate(
        { _id: groupId, updatedPlayers: { $elemMatch: { UserId: UserId } } },
        { $set: { "updatedPlayers.$": playersUpdate } },
        { new: true }
      );

      //let wicket = groupExist.updatedPlayers[index].wicket;

      // if (ball === 0 && isWicketUpdated === true && wicket > 0) {
      //   groupExist.updatedPlayers[index].wicket -= 1;
      //   updatedGroupFstHit = await groupExist.save();
      // }

      let responseForFstHit = {
        _id: updatedGroupFstHit._id,
        createdTime: updatedGroupFstHit.createdTime,
        tableId: updatedGroupFstHit.tableId,
        updatedPlayers: updatedGroupFstHit.updatedPlayers,
        ball: updatedGroupFstHit.ball,
        start: updatedGroupFstHit.start,
        currentBallTime: new Date(),
        nextBallTime: updatedGroupFstHit.nextBallTime,
        ballSpeed: updatedGroupFstHit.ballSpeed,
        CurrentRun: currentRun,
      };

      console.log(
        "updatedRunwhen hit >>>>>>>>>>>>>>>>>>",
        updatedGroupFstHit.updatedPlayers[0].run
      );

      //___________________send the response when hit the api 1st time

      return res.status(200).json(responseForFstHit);
    }
    if (isRunUpdated === true) {
      let response = {
        _id: groupExist._id,
        createdTime: groupExist.createdTime,
        tableId: groupExist.tableId,
        updatedPlayers: groupExist.updatedPlayers,
        ball: groupExist.ball,
        start: groupExist.start,
        currentBallTime: new Date(),
        nextBallTime: groupExist.nextBallTime,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
        ballSpeed: groupExist.ballSpeed,
      };

      return res.status(200).json(response);
    }
    // }
  } catch (err) {
    return res.status(500).send;
  }
};

//__________________________declare the winner_______________________________(not used in this project)

const winTheGame = async function (req, res) {
  try {
    const groupId = req.query.groupId;

    /* lean() method on the groupModel.findById() query to return a plain JavaScript object instead of a Mongoose document.
     This can improve performance by avoiding the overhead of Mongoose document instantiation.*/

    const checkGroup = await groupModel.findById(groupId).lean();

    if (!checkGroup) {
      return res.status(404).send({
        status: false,
        message: "this group is not present in DB",
      });
    }

    let tableId = checkGroup.tableId;

    const checkTable = await tournamentModel.findById(tableId).lean();
    if (!checkTable) {
      return res.status(404).send({
        status: false,
        message: "this table is not present in DB",
      });
    }

    // const players = checkGroup.updatedPlayers.sort((a, b) => b.run - a.run);
    // console.log(players, "players>>>>>>>>>>>>>>>>");
    
    const players = checkGroup.updatedPlayers.sort((a, b) => {
      if (b.run !== a.run) {
          return b.run - a.run; // sort by runs in descending order
      } else {
          return a.wicket - b.wicket; // sort by wickets in ascending order for players with the same runs
      }
  });
  
  console.log(players, "players>>>>>>>>>>>>>>>>");
  
    const winner = players[0];
    //___________filter the players's run if these are equal
    const equalRun = players.filter((a) => a.run === winner.run);

    //__________find the player with the lowest wickets among those with equal runs.
    const winner2 = equalRun.reduce((a, b) => (b.wicket < a.wicket ? b : a));

    const finalWinner = winner2.run > winner.run ? winner2 : winner;
    //console.log(finalWinner);

    //_________________winner prize as per prize amount

    const prizes = checkTable.prizeAmount;
    players[0].prize = prizes * 0.35;
    players[1].prize = prizes * 0.25;
    players[2].prize = prizes * 0.15;
    players[3].prize = prizes * 0.05;

    const result = await groupModel.findByIdAndUpdate(
      { _id: groupId },
      { $set: { updatedPlayers: players } },
      { new: true }
    );

    //console.log(result);

    return res.status(200).json({ updatedPlayers: result.updatedPlayers });
  } catch (err) {
    return res.status(500).send({
      status: false,
      error: err.message,
    });
  }
};

module.exports = {
  updateCric,
  getAllCric,
  getCricByGroupId,
  winTheGame,
};