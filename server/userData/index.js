//will be using redis here
const connectedUsers = {};

//used for admin panel
const getAllOnline = () => {
  return Object.keys(connectedUsers);
};

const getUserIds = (users) => {
  let onlineUsers = [];
  users.forEach((user) => {
    //--implement a better way to use connectedUsers[user]
    if (connectedUsers[user]) onlineUsers.push({ user: connectedUsers[user] });
  });
  return onlineUsers;
};

const userConected = (user) => (connectedUsers[user] ? true : false);

const addUser = ({ userName, socketId }) => {
  if (userConected(userName)) {
    //already connected to a socket
    throw new Error("User already connected to scoket.");
  } else {
    console.log(connectedUsers);
    connectedUsers[userName] = socketId;
  }
  return true;
};

//this will send user the online friends from the list of friends
const getOnline = (friendList) =>
  friendList.filter((friend) => userConected(friend));

const getSocketID = (userName) => connectedUsers[userName];

const removeUser = (user) => delete connectedUsers[user];
module.exports = {
  getUserIds,
  addUser,
  removeUser,
  userConected,
  getOnline,
  getSocketID,
  getAllOnline,
};
