const socket = io("http://localhost:3000");
const users = document.getElementById("users");
const chatInput = document.getElementById("chatInput");
const chat = document.getElementById("chat");
const send = document.getElementById("send");
const availibleRooms = document.getElementById("availibleRooms");
const roomInfo = document.getElementById("roomInfo");
const roomInput = document.getElementById("roomInput");
const enterRoom = document.getElementById("enterRoom");

let currentRoom;
let username;

const onUserConnect = () => {
  username = `user${Math.round(Math.random() * 1000000)}`;
  socket.emit("save username", username);
};

const addNewUser = (user) => {
  if (currentRoom) return;
  if (document.querySelector(`.${user}-userlist`)) return;
  const userElement = `
    <div class="${user}-userlist">
      <p>
         ${user}
      </p>    
    </div>
    `;
  users.innerHTML += userElement;
};

socket.on("new user connected", (data) => {
  console.log(data);
  data.map((user) => addNewUser(user));
});

socket.on("user disconnected", (user) => {
  document.querySelector(`.${user}-userlist`).remove();
});

window.onload = () => {
  onUserConnect();
  socket.emit("get rooms");
};

socket.on("get rooms", (data) => {
  availibleRooms.innerHTML = "<p>Availible rooms</p>";
  data.map((roomNum) => {
    availibleRooms.innerHTML += `<p>${roomNum}</p>`;
  });
});

send.onclick = () => {
  socket.emit("chat", `${username}: ${chatInput.value}`);
  chatInput.value = "";
};

socket.on("chat", (data) => {
  chat.innerHTML += `<p>${data}</p>`;
});

enterRoom.onclick = () => {
  socket.emit("join room", {
    roomNum: roomInput.value,
  });
  roomInput.value = "";
};
socket.on("join room", (data) => {
  if (data.status === 1) {
    roomInfo.innerHTML = `<p>Room: ${data.message}: ${data.roomNum}</p>`;
    chat.innerHTML = ``;
    chatInput.innerHTML = ``;
    return (currentRoom = data.roomNum);
  }
  roomInfo.innerHTML = data.message;
  chat.innerHTML = ``;
  chatInput.value = ``;
});

socket.on("update room users", (data) => {
  users.innerHTML = ``;
  data.map((user) => {
    users.innerHTML += `<p>${user}<p>`;
  });
});
