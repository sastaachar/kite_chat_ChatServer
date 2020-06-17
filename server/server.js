//basic setting up
if (process.env.NODE_ENV !== "production") require("dotenv").config();
const PORT = process.env.PORT || 2500;

//importing packages
const express = require("express");
const os = require("os");
const cors = require("cors");
const http = require("http");
const socketio = require("socket.io");
const jwt = require("jsonwebtoken");

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

const checkToken = (token, key) => {
  try {
    let payload = jwt.verify(token, key);
    return payload;
  } catch (err) {
    return false;
  }
};

io.use((socket, next) => {
  try {
    let jwtToken = socket.handshake.headers.authorization;
    jwtToken = jwtToken.split(" ")[1];
    let payload = checkToken(jwtToken, process.env.JWT_KEY);
    if (payload) {
      console.log(`User ${payload.userName} allowed.`);
      next();
    } else {
      throw new Error("Auth fail");
    }
  } catch (err) {
    console.log(err);
    console.log(`User is NOT allowed`);
    next(err);
  }
});
io.on("connection", (socket) => {
  socket.emit("connected", "User authorized and connected");
  console.log("New connection");
  console.log(socket.connected);
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
