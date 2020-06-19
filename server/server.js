//basic setting up
if (process.env.NODE_ENV !== "production") require("dotenv").config();
const PORT = process.env.PORT || 2500;

//importing packages
const express = require("express");
const os = require("os");
const cors = require("cors");
const http = require("http");
const socketio = require("socket.io");
const { authCheck } = require("./socketioUtils");
const { addUser, removeUser } = require("./userData");

//remove all this stupidity from here and port these to the new server
//crearte server using http
//we need to use http here for socket.io
const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  handlePreflightRequest: (req, res) => {
    const headers = {
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Origin":
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000"
          : "https://kite-chat.herokuapp.com", //or the specific origin you want to give access to,
      "Access-Control-Allow-Credentials": true,
    };
    res.writeHead(200, headers);
    res.end();
  },
});

io.use(authCheck).on("connection", (socket) => {
  const { userName } = socket.handshake.headers;
  //if user is not already connected
  try {
    addUser({ userName, socketId: socket.id });
    socket.emit("connected", "User authorized and connected");
  } catch (err) {
    socket.emit("disconnected", err.message);
    socket.disconnect();
  }

  socket.on("disconnect", (socket) => {
    removeUser(userName);
  });
});

var whitelist = ["http://localhost:3000", "https://kite-chat.herokuapp.com"];
var corsOptions = {
  origin: function (origin, callback) {
    //the !origin is for services like postman

    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      //i dont like this it prints the shit
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

//redirect to https
//does'nt make much sense on a server FOR NOW
// if (process.env.NODE_ENV === "production") {
//   app.use((req, res, next) => {
//     if (req.header("x-forwarded-proto") !== "https")
//       res.redirect(`https://${req.header("host")}${req.url}`);
//     else next();
//   });
// }

//Routes
app.use("/", require("./routes/main"));

//start listening
server.listen(PORT, () => {
  console.log(`Server running at - ${os.hostname()} on PORT : ${PORT}`);
});

module.exports = {
  server,
};
