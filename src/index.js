require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const route = require("./route/routes");

app.use(express.json());
app.use("/", route);

mongoose.set("strictQuery", false);

//____________________for development____________________________________

// mongoose
//   .connect(
//     "mongodb+srv://theproficienttech333:gzYGYI5pD4oAUvim@cluster0.gp7jlnb.mongodb.net/game",
//     {
//       useNewUrlParser: true,
//     }
//   )
//   .then(() => {
//     console.log("MongoDB is connected for development");
//   })
//   .catch((error) => {
//     console.log("Not connected");
//   });
// app.listen(process.env.PORT || 8000, function () {
//   console.log("Express app running on port" + " " +(process.env.port || 8000));
// });

  //_________________________for local________________________

  mongoose
  .connect(
    "mongodb+srv://nikita1:7CSKh9nBmgBm27YC@cluster0.suzof1p.mongodb.net/nikita",
    {
      useNewUrlParser: true,
    }
  )
  .then(() => {
    console.log("MongoDB is connected for local");
  })
  .catch((error) => {
    console.log("Not connected");
  });


app.listen(process.env.PORT || 5000, function () {
  console.log("Express app running on port" + " " +(process.env.port || 5000));
});

