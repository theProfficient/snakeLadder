const express = require("express");

const adminController = require("../controller/adminController")
const userController = require("../controller/userController");
const cricketController = require("../controller/cricketController");
const hockyController = require("../controller/hockyController");
const snakeLadderController = require("../controller/snakeLadderController");
const ticTacToeController = require("../controller/ticTacToeController");
const balanceController = require("../controller/balanceController");
const tournamentController = require("../controller/tournamentController");
const Router = express.Router();

//__________________________Admin_____________________
Router.post("/register", adminController.createAdmin);
Router.post("/login", adminController.adminLoggedin);
//_____________________________________User______________

Router.get("/register", userController.createUsers);

Router.put("/updateUser", userController.updateUser);

Router.get("/profile", userController.getUser);

Router.get("/getAllUser", userController.getAllUser);
//_____________________ Cricket________________________

Router.put("/updateCricket", cricketController.updateCric);

Router.get("/getAllCricketData", cricketController.getAllCric);

Router.get("/getCricGrp", cricketController.getCricByGroupId);

Router.get("/winner", cricketController.winTheGame);
//______Cricket tournaments_________

Router.post("/tournamentsByAdmin", tournamentController.tournamentsByAdmin);

Router.post("/tournaments", tournamentController.createTournaments);

Router.get("/tables", tournamentController.getAllTables);

Router.put("/tournament", tournamentController.updateTournament);

Router.get("/groups", tournamentController.getGroups);

Router.get("/players", tournamentController.getPlayers);



//__________________Hocky___________________

Router.put("/updateHocky", hockyController.updateHoc);

Router.get("/getAllHockyData", hockyController.getAllHoc);

//__________________snakeLadder Tournaments___________________

Router.post("/snktournamentsByAdmin", snakeLadderController.snkTablesCreatedByAdmin);

Router.post("/snktournaments", snakeLadderController.createSnakeLadderTables);

Router.get("/getAllSnakeLadderData", snakeLadderController.getAllSnak);

Router.put("/updateSnakeLadder", snakeLadderController.updateSnakLdrTournaments);

Router.get("/getGroupsByUserId", snakeLadderController.getGroupsByUser);

Router.get("/getGroup", snakeLadderController.getSnkByGroupId);

Router.put("/updateSnakeLadderPerPlayer", snakeLadderController.updatePointOfUser);

Router.get("/playersOfSnkLdr", snakeLadderController.getPlayersOfSnkLadder);

//__________________ticTacToe___________________

Router.put("/updateTicTacToe", ticTacToeController.updateTic);

Router.get("/getAllTicTacToeData", ticTacToeController.getAllTic);

//_________________credits_____________________

Router.put("/updateBalance", balanceController.updatecredits);



//************ checking your end point valid or not */

Router.all("/**", function (req, res) {
  res.status(404).send({
    status: false,
    message: "Make Sure Your Endpoint is Correct or Not!",
  });
});

module.exports = Router;
