const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
    res.send("STAR-C2 WebSocket Server Running");
});

const server = http.createServer(app);

// SOCKET SERVER
const io = new Server(server, {
    cors: {
        origin:"*",
        methods: ["GET", "POST"],
    },
    transports: ["websocket"],
    path: "/socket.io/"
});

// ROOM → USERS MAP
let rooms = {};

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    let currentRoom = "";
    let username = "User" + Math.floor(Math.random() * 10000);

    socket.on("create_room", (roomCode) => {
        if (!rooms[roomCode]) rooms[roomCode] = [];
        currentRoom = roomCode;
        rooms[currentRoom].push(username);
        socket.join(currentRoom);
        io.to(currentRoom).emit("users", rooms[currentRoom]);
    });

    socket.on("join_room", (roomCode) => {
        if (!rooms[roomCode]) rooms[roomCode] = [];
        currentRoom = roomCode;
        rooms[currentRoom].push(username);
        socket.join(currentRoom);
        io.to(currentRoom).emit("users", rooms[currentRoom]);
    });

    socket.on("chat_message", (data) => {
        io.to(data.room).emit("chat_message", {
            user: data.user,
            message: data.message
        });
    });

    socket.on("disconnect", () => {
        if (currentRoom && rooms[currentRoom]) {
            rooms[currentRoom] = rooms[currentRoom].filter(u => u !== username);
            io.to(currentRoom).emit("users", rooms[currentRoom]);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`STAR-C2 Server running on port ${PORT}`);
});
