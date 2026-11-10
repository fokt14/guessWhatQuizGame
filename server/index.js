const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const rooms = {};

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

function generatePIN() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

io.on("connection", (socket) => {
  console.log(`Novo cliente conectado! ID: ${socket.id}`);

  socket.on("create_room", (data) => {
    const pin = generatePIN();

    rooms[pin] = {
      hostId: socket.id,
      players: [{ id: socket.id, nickname: data.nickname, state: "HOST" }],
      status: "LOBBY",
    };

    socket.join(pin);

    console.log(`Sala criada com o PIN: ${pin} pelo host: ${socket.id}`);

    socket.emit("room_created", { pin, players: rooms[pin].players });
  });

  socket.on("join_room", (data) => {
    console.log("Entrou", data, data.pin, data.nickname);
    if (!rooms[data.pin]) {
      return socket.emit("error", "Sala nao existe");
    }

    socket.data.pin = data.pin;
    rooms[data.pin].players.push({
      id: socket.id,
      nickname: data.nickname,
      state: "PLAYER",
    });
    socket.join(data.pin);

    console.log(
      `Cliente ${socket.id} entrou na sala com PIN: ${data.pin} e Nickname: ${data.nickname}`,
    );
    io.to(data.pin).emit("update_players", rooms[data.pin].players);
  });

  socket.on("disconnect", () => {
    console.log(`Cliente desconectado: ${socket.id}`);

    const pin = socket.data.pin;

    if (!pin || !rooms[pin]) {
      console.log("Nao existe nada");
      return;
    }

    const room = rooms[pin];

    room.players = room.players.filter((p) => p.id !== socket.id);

    console.log(
      `Jogador saiu da sala ${pin}. Restam ${room.players.length} jogadores.`,
    );

    io.to(pin).emit("update_players", room.players);
  });
});

server.listen(3000, () => {
  console.log("🚀 Servidor Socket.io a correr na porta 3000");
});
