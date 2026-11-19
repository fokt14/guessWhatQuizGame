import questions from "./questions.js";

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);

const rooms = {};
const QUESTION_DURATION_SECONDS = 15;

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

function generatePIN() {
  let pin = "";
  let i = 0;

  do {
    pin = Math.floor(1000 + Math.random() * 9000).toString();
    i++;
  } while (rooms[pin] && i < 100);

  if (rooms[pin]) {
    return null;
  }
  return pin;
}

function getCleanPlayersList(players) {
  return players.map((player) => ({
    id: player.id,
    nickname: player.nickname,
    role: player.role,
    hasAlreadyAnswered: player.hasAlreadyAnswered,
    points: player.points,
    lastAnswerIndex: player.lastAnswerIndex ?? null,
  }));
}

function sendQuestion(pin) {
  const room = rooms[pin];
  const currentQ = questions[room.currentQuestionIndex];

  if (!room) return;

  if (!currentQ) {
    room.state = "GAME_OVER";
    return io.to(pin).emit("game_over", { message: "Jogo terminado!" });
  }

  room.questionStartTime = Date.now();

  const questionToSend = {
    questionIndex: room.currentQuestionIndex,
    totalQuestions: questions.length,
    question: currentQ.question,
    answers: currentQ.answers,
    correctAnswerIndex: currentQ.correctIndex,
    timeRemainingSeconds: QUESTION_DURATION_SECONDS,
  };

  io.to(pin).emit("new_question", questionToSend);
}

function nextQuestion(pin) {
  const room = rooms[pin];
  if (!room) return;

  for (let player of room.players) {
    player.hasAlreadyAnswered = false;
    player.lastAnswerIndex = null;
  }

  room.currentQuestionIndex++;
  sendQuestion(pin);
}

function checkIfAllPlayersAnswered(pin) {
  const room = rooms[pin];
  if (!room) return;

  let activePlayers = room.players.filter(
    (player) => player.isOnline !== false,
  );

  let playersAlreadyAnswered = activePlayers.filter(
    (player) => player.hasAlreadyAnswered,
  );

  let isLastQuestion = room.currentQuestionIndex === questions.length - 1;

  if (playersAlreadyAnswered.length === activePlayers.length) {
    console.log("Ja todos resopodenream", playersAlreadyAnswered);
    const feedbackQuestion = questions[room.currentQuestionIndex];

    io.to(pin).emit(
      "show_feedback",
      getCleanPlayersList(room.players),
      isLastQuestion,
      {
        questionIndex: room.currentQuestionIndex,
        totalQuestions: questions.length,
        question: feedbackQuestion.question,
        answers: feedbackQuestion.answers,
        correctAnswerIndex: feedbackQuestion.correctIndex,
        timeRemainingSeconds: QUESTION_DURATION_SECONDS,
      },
    ); //show_feedback -- round_finished

    setTimeout(() => {
      io.to(pin).emit(
        "round_finished",
        getCleanPlayersList(room.players),
        isLastQuestion,
      );
    }, 5000);
  }
}

io.on("connection", (socket) => {
  console.log(`Novo cliente conectado! ID: ${socket.id}`);

  socket.on("create_room", (data) => {
    const pin = generatePIN();

    if (!pin) {
      return socket.emit(
        "error",
        "Unable to generate a unique PIN. Please try again.",
      );
    }

    if (rooms[pin]) {
      return socket.emit("error", "Room with this PIN already exists");
    }

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

    socket.emit("room_created", {
      pin,
      players: getCleanPlayersList(rooms[pin].players),
    });
  });

  socket.on("join_room", (data) => {
    console.log("Entrou", data, data.pin, data.nickname);
    if (!rooms[data.pin]) {
      return socket.emit("error", "Room doesn't exist");
    }

    if (rooms[data.pin].state !== "LOBBY_HOST") {
      return socket.emit("error", "Game already started");
    }

    let token = Math.random().toString(36).substring(2, 15); // Generate a random token for the player

    socket.pin = data.pin;

    const isNameTaken = rooms[data.pin].players.some(
      (player) =>
        player.nickname.toLowerCase().trim() ===
        data.nickname.toLowerCase().trim(),
    );

    if (isNameTaken) {
      return socket.emit("error", "Nickname already taken in this room");
    }

    rooms[data.pin].players.push({
      id: socket.id,
      nickname: data.nickname.trim(),
      role: "PLAYER",
      hasAlreadyAnswered: false,
      points: 0,
      token: token,
    });

    const playersInTheRoom = getCleanPlayersList(rooms[data.pin].players);

    socket.emit("joined_room", {
      pin: data.pin,
      players: playersInTheRoom,
      mySecretToken: token,
    });

    socket.join(data.pin);

    console.log(
      `Cliente ${socket.id} entrou na sala com PIN: ${data.pin} e Nickname: ${data.nickname}`,
    );
    io.to(data.pin).emit("update_players", playersInTheRoom);
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
    let answerTime = Date.now();

    if (!rooms[data.pin]) {
      console.log("Wrong room");
      return;
    }
    console.log("SUBMITE _ASNE", data);

    let room = rooms[data.pin];

    let timeTaken = answerTime - room.questionStartTime;
    console.log("TIME TAKEN", timeTaken);

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

      let timeRemaining = Math.max(0, 15000 - timeTaken);
      let percentageOfTimeTaken = timeRemaining / 15000;
      let pointsWon = Math.round(percentageOfTimeTaken * 100);

      myPlayer.points += pointsWon;

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
      player.lastAnswerIndex = null;
    }

    rooms[data.pin].currentQuestionIndex = 0;
    rooms[data.pin].state = "LOBBY_HOST";

    io.to(data.pin).emit(
      "game_restarted",
      getCleanPlayersList(rooms[data.pin].players),
    );
  });

  socket.on("kick_player", (data) => {
    console.log("KICK PLAYER", data);
    let room = rooms[data.pin];

    if (!room) {
      return socket.emit("error", "Room doesn't exist");
    }

    if (socket.id !== room.hostId) {
      return socket.emit("error", "Only the host can kick players");
    }

    if (room.state !== "LOBBY_HOST") {
      return socket.emit(
        "error",
        "Cannot kick players after the game has started",
      );
    }

    let playerId = data.playerId;

    const playerToKick = room.players.find((player) => player.id === playerId);

    if (!playerToKick) {
      return socket.emit("error", "Player not found in the room");
    }

    room.players = room.players.filter((player) => player.id !== playerId);

    io.sockets.sockets.get(playerId)?.leave(data.pin); // Make the kicked player leave the room

    io.to(playerId).emit(
      "kicked_from_room",
      "You have been kicked from the room.",
    );

    io.to(data.pin).emit("update_players", getCleanPlayersList(room.players));
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

  socket.on("reconnect_attempt", (data) => {
    console.log("RECONNECT ATTEMPT", data);

    const { pin, token } = data;

    if (!rooms[pin]) {
      return socket.emit("error", "Room doesn't exist");
    }

    const room = rooms[pin];

    const playerToReconnect = room.players.find(
      (player) => player.token === token,
    );

    if (!playerToReconnect) {
      return socket.emit("error", "Player not found in the room");
    }

    // Update the player's ID to the new socket ID
    playerToReconnect.id = socket.id;
    playerToReconnect.isOnline = true; // Mark the player as online

    socket.join(pin);
    socket.pin = pin;

    io.to(pin).emit("update_players", getCleanPlayersList(room.players));

    const currentQuestion =
      room.state === "IN_GAME" ? questions[room.currentQuestionIndex] : null;
    const elapsedSeconds = room.questionStartTime
      ? Math.floor((Date.now() - room.questionStartTime) / 1000)
      : QUESTION_DURATION_SECONDS;

    const timeRemainingSeconds = Math.max(
      0,
      QUESTION_DURATION_SECONDS - elapsedSeconds,
    );

    socket.emit("reconnected_success", {
      myPlayer: getCleanPlayersList([playerToReconnect])[0],
      roomState: room.state,
      currentQuestion: currentQuestion
        ? {
            questionIndex: room.currentQuestionIndex,
            totalQuestions: questions.length,
            question: currentQuestion.question,
            answers: currentQuestion.answers,
            correctAnswerIndex: currentQuestion.correctIndex,
            timeRemainingSeconds,
          }
        : null,
    });

    console.log(
      `Player with token ${token} reconnected to room ${pin} with new socket ID ${socket.id}`,
    );
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

    leavingPlayer.isOnline = false; // Mark the player as offline instead of removing them

    console.log(
      `Jogador saiu da sala ${pin}. Restam ${room.players.length} jogadores.`,
    );

    io.to(pin).emit("update_players", getCleanPlayersList(room.players));
    checkIfAllPlayersAnswered(pin);
  });
});

server.listen(3000, () => {
  console.log("Servidor Socket.io a correr na porta 3000");
});
