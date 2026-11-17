import questions from "./questions.js";

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

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

function sendQuestion(pin) {
  const room = rooms[pin];
  const currentQ = questions[room.currentQuestionIndex];

  if (!room) return;

  if (!currentQ) {
    room.state = "GAME_OVER";
    return io.to(pin).emit("game_over", { message: "Jogo terminado!" });
  }

  const questionToSend = {
    questionIndex: room.currentQuestionIndex,
    totalQuestions: questions.length,
    question: currentQ.question,
    answers: currentQ.answers,
    correctAnswerIndex: currentQ.correctIndex,
  };

  io.to(pin).emit("new_question", questionToSend);
}

function nextQuestion(pin) {
  const room = rooms[pin];
  if (!room) return;

  for (let player of room.players) {
    player.hasAlreadyAnswered = false;
  }

  room.currentQuestionIndex++;
  sendQuestion(pin);
}

function checkIfAllPlayersAnswered(pin) {
  const room = rooms[pin];
  if (!room) return;

  let playersAlreadyAnswered = room.players.filter(
    (player) => player.hasAlreadyAnswered,
  );

  let isLastQuestion = room.currentQuestionIndex === questions.length - 1;

  if (playersAlreadyAnswered.length === room.players.length) {
    console.log("Ja todos resopodenream", playersAlreadyAnswered);

    io.to(pin).emit(
      "show_feedback",
      room.players,
      isLastQuestion,
      questions[room.currentQuestionIndex],
    ); //show_feedback -- round_finished

    setTimeout(() => {
      io.to(pin).emit("round_finished", room.players, isLastQuestion);
    }, 5000);
  }
}

io.on("connection", (socket) => {
  console.log(`Novo cliente conectado! ID: ${socket.id}`);

  socket.on("create_room", (data) => {
    const pin = generatePIN();

    rooms[pin] = {
      hostId: socket.id,
      players: [
        {
          id: socket.id,
          nickname: data.nickname,
          role: "HOST",
          hasAlreadyAnswered: false,
          points: 0,
        },
      ],
      state: "LOBBY_HOST",
    };

    socket.join(pin);
    socket.pin = pin;

    console.log(`Sala criada com o PIN: ${pin} pelo host: ${socket.id}`);

    socket.emit("room_created", { pin, players: rooms[pin].players });
  });

  socket.on("join_room", (data) => {
    console.log("Entrou", data, data.pin, data.nickname);
    if (!rooms[data.pin]) {
      return socket.emit("error", "Sala nao existe");
    }

    socket.pin = data.pin;
    rooms[data.pin].players.push({
      id: socket.id,
      nickname: data.nickname,
      role: "PLAYER",
      hasAlreadyAnswered: false,
      points: 0,
    });
    socket.join(data.pin);

    console.log(
      `Cliente ${socket.id} entrou na sala com PIN: ${data.pin} e Nickname: ${data.nickname}`,
    );
    io.to(data.pin).emit("update_players", rooms[data.pin].players);
  });

  socket.on("start_game", (data) => {
    console.log("Started gmae", data);

    if (!rooms[data.pin]) {
      return socket.emit("error", "Room doesn't exist");
    }

    if (socket.id !== rooms[data.pin].hostId) {
      return socket.emit("error", "Id from host is not the same for this room");
    }

    if (rooms[data.pin].players.length <= 0) {
      return socket.emit("error", "No players enough to start");
    }

    rooms[data.pin].state = "IN_GAME";
    rooms[data.pin].currentQuestionIndex = 0;

    sendQuestion(data.pin);
  });

  socket.on("submit_answer", (data) => {
    if (!rooms[data.pin]) {
      console.log("Wrong room");
      return;
    }
    console.log("SUBMITE _ASNE", data);

    let room = rooms[data.pin];

    let myPlayer = room.players.find((player) => player.id == socket.id);

    if (!myPlayer) {
      console.log("VAIDAS Ddwasdaw");
      return;
    }

    if (myPlayer.hasAlreadyAnswered) {
      console.log("YOU ALREADY SUBMITED YOU ANSWERS ASSHOLE");
      return;
    }

    const currentQ = questions[room.currentQuestionIndex];

    myPlayer.lastAnswerIndex = data.answerIndex;

    if (currentQ.correctIndex == data.answerIndex) {
      console.log("CARLADHWA");
      myPlayer.points += 100;
      console.log("MY_POINTS", myPlayer.points);
    }

    myPlayer.hasAlreadyAnswered = true;

    checkIfAllPlayersAnswered(data.pin);
  });

  socket.on("next_question_in_game", (data) => {
    console.log("NEXT QUESTION", data);
    nextQuestion(data.pin);
  });

  socket.on("restart_game", (data) => {
    console.log("RESTART GAME", data);

    for (let player of rooms[data.pin].players) {
      player.points = 0;
      player.hasAlreadyAnswered = false;
    }

    rooms[data.pin].currentQuestionIndex = 0;

    io.to(data.pin).emit("game_restarted", rooms[data.pin].players);
  });

  socket.on("end_game", (data) => {
    console.log("END GAME", data);

    if (!rooms[data.pin]) {
      return socket.emit("error", "Room doesn't exist");
    }

    if (socket.id !== rooms[data.pin].hostId) {
      return socket.emit("error", "Id from host is not the same for this room");
    }

    delete rooms[data.pin];

    io.to(data.pin).emit("game_ended");
  });

  socket.on("disconnect", () => {
    console.log(`Cliente desconectado: ${socket.id}`);

    const pin = socket.pin;

    if (!pin || !rooms[pin]) {
      console.log("Nao existe nada");
      return;
    }

    const room = rooms[pin];

    const leavingPlayer = room.players.find((p) => p.id === socket.id);

    if (!leavingPlayer) {
      return;
    }

    if (leavingPlayer.role === "HOST") {
      console.log(`O host da sala ${pin} saiu. A sala será encerrada.`);
      delete rooms[pin];
      io.to(pin).emit("game_ended");
      return;
    }

    room.players = room.players.filter((p) => p.id !== socket.id);

    console.log(
      `Jogador saiu da sala ${pin}. Restam ${room.players.length} jogadores.`,
    );

    io.to(pin).emit("update_players", room.players);
    checkIfAllPlayersAnswered(pin);
  });
});

server.listen(3000, () => {
  console.log("Servidor Socket.io a correr na porta 3000");
});
