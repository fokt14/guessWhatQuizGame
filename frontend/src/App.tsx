import { useState, useEffect } from 'react'
import './App.css'
import { io } from 'socket.io-client';
import JoinRoomModal from './components/joinRoomModal';
import GameScreen from './components/GameScreen';
import LeaderBoardScreen from './components/LeaderBoardScreen';
import LandingPageScreen from './components/LandingPageScreen';
import type { Question, Player } from './interfaces/interfaces';
import type { GameState } from './interfaces/enums';
import FeedBackScreen from './components/FeedBackScreen';
import deleteFriendIcon from './assets/delete-friend-svgrepo-com.svg';


const socket = io('http://localhost:3000');

const MAX_PLAYERS_IN_ROOM = 10;

function App() {

  const [pin, setPin] = useState(() => sessionStorage.getItem('lastRoomPin') ?? '')
  const [nickname, setNickname] = useState(() => sessionStorage.getItem('nickname') ?? '');
  const [players, setPlayers] = useState<Player[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [stateOfPlayer, setStateOfPlayer] = useState<GameState>('LANDING'); // MENU, LOBBY_HOST, LOBBY_PLAYER, IN_GAME, GAME_OVER, ROUND_RESULTS, FEEDBACK 
  const [isJoinRoomModalOpen, setIsJoinRoomModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [myRole, setMyRole] = useState<"HOST" | "PLAYER" | null>(null);
  const [myPlayer, setMyPlayer] = useState<Player | null>(null);


  const handleReturnToMenu = (myRole: any) => {
    setStateOfPlayer('MENU');
    setPin('');
    setPlayers([]);
    setMyPlayer(null);
    setMyRole(null);
    sessionStorage.removeItem('lastRoomPin');
    sessionStorage.removeItem('playerToken');

    socket.emit('leave_room', { pin: pin, role: myRole });

  }

  const handleCreateRoom = () => {
    setErrorMessage('');

    if (!nickname) {
      setErrorMessage('Please fill in your Nickname.');
      return;
    }

    socket.emit('create_room', { nickname: nickname });
    sessionStorage.setItem('nickname', nickname);
    setStateOfPlayer('LOBBY_HOST');
  };

  const handleRemovePlayer = (playerId: string) => {
    console.log("Removing player with ID:", playerId);
    socket.emit('kick_player', { pin: pin, playerId: playerId });
  }

  const openJoinRoomModal = () => {
    if (!nickname) {
      setErrorMessage('Please fill in your Nickname.');
      return;
    }
    setIsJoinRoomModalOpen(true);
  };

  const handleJoinRoom = (pinFromModal: string, nickname: string) => {

    setErrorMessage('');


    console.log("oi", nickname, pinFromModal)

    if (!nickname) {
      setErrorMessage('Please fill in both PIN and Nickname.');
      return;
    }

    sessionStorage.setItem('nickname', nickname);
    socket.emit('join_room', { pin: pinFromModal, nickname: nickname });
  }

  const handleStartGame = () => {
    socket.emit('start_game', { pin: pin });
  }

  const handleAnswerSubmitted = (selectedAnswerIndex: number) => {
    console.log("Answer submitted:", selectedAnswerIndex);
    socket.emit('submit_answer', { pin: pin, answerIndex: selectedAnswerIndex });
  }

  const handleNextQuestion = () => {
    socket.emit('next_question_in_game', { pin: pin });
  }

  const handleRestartGame = () => {
    socket.emit('restart_game', { pin: pin });
  }

  const handleEndGame = () => {
    socket.emit('end_game', { pin: pin });
  }

  //UseEffect to listen for socket events and update state accordingly
  useEffect(() => {
    socket.on('reconnected_success', (data: {
      myPlayer: Player;
      roomState: GameState;
      currentQuestion: Question | null;
    }) => {
      setMyPlayer(data.myPlayer);
      setMyRole(data.myPlayer.role);
      setCurrentQuestion(data.currentQuestion);

      if (data.roomState === 'LOBBY_HOST' || data.roomState === 'LOBBY_PLAYER') {
        setStateOfPlayer(data.myPlayer.role === 'HOST' ? 'LOBBY_HOST' : 'LOBBY_PLAYER');
      }
      if (data.roomState === 'IN_GAME') {
        setStateOfPlayer('IN_GAME');
      }
    });

    socket.on('room_created', (data: { pin: string, players: Player[] }) => {
      console.log('Chegou ao cliente!', data);
      setPlayers(data.players);
      setPin(data.pin);
      setMyPlayer(data.players.find(player => player.id === socket.id) || null);
      setMyRole('HOST');
    });

    socket.on("joined_room", (data: { pin: string, players: Player[], mySecretToken: string }) => {
      console.log("Joined room:", data);
      setStateOfPlayer('LOBBY_PLAYER');
      setPlayers(data.players);
      setPin(data.pin);
      setMyPlayer(data.players.find(player => player.id === socket.id) || null);
      setMyRole('PLAYER');

      sessionStorage.setItem('lastRoomPin', data.pin);
      sessionStorage.setItem('playerToken', data.mySecretToken);

    });

    socket.on("update_players", (updatedList: Player[]) => {
      console.log("Lista de jogadores recebida:", updatedList);
      setPlayers(updatedList);
      setMyPlayer(updatedList.find(player => player.id === socket.id) || null);
    });

    socket.on("new_question", (question: any) => {
      console.log("QUESTAO:", question);
      setStateOfPlayer('IN_GAME');
      setCurrentQuestion(question);
    });

    socket.on("show_feedback", (players: Player[], isLastQuestion: boolean, question: Question) => {
      console.log("PLAYERS FA :", question, players);
      setStateOfPlayer('FEEDBACK');
      setPlayers(players);

      let foundMyPlayer = players.find(player => player.id === socket.id);

      console.log("isLastQuestion:", isLastQuestion);

      setIsLastQuestion(isLastQuestion);

      setMyPlayer(foundMyPlayer || null);
      setMyRole(foundMyPlayer?.role || null);

      setCurrentQuestion(question);
    });

    socket.on("round_finished", (players: Player[], isLastQuestion: boolean) => {
      console.log("PLAYERS :", players);
      setPlayers(players);
      console.log(" round -fi nexisLastQuestion:", isLastQuestion);
      setIsLastQuestion(isLastQuestion);
      setStateOfPlayer('ROUND_RESULTS');
    });

    socket.on("game_restarted", (players: Player[]) => {
      console.log("Game restarted, players:", players);
      setPlayers(players);

      let myPlayer = players.find(player => player.id === socket.id);

      if (myPlayer?.role === "HOST") {
        setStateOfPlayer('LOBBY_HOST');
      }
      else {
        setStateOfPlayer('LOBBY_PLAYER');
      }
    });

    socket.on("game_ended", () => {
      setStateOfPlayer('MENU');
      setPin('');
      setPlayers([]);
      setCurrentQuestion(null);
      setIsLastQuestion(false);
      sessionStorage.removeItem('lastRoomPin');
      sessionStorage.removeItem('playerToken');
      sessionStorage.removeItem('nickname');
    });

    socket.on("error", (message: string) => {
      console.error("Error from server:", message);
      setErrorMessage(message);
    });

    const storedPin = sessionStorage.getItem('lastRoomPin');
    const storedToken = sessionStorage.getItem('playerToken');

    if (storedPin && storedToken) {
      socket.emit('reconnect_attempt', {
        pin: storedPin,
        nickname: sessionStorage.getItem('nickname'),
        token: storedToken,
      });
    }

    socket.on("reconnect_failed_kicked_or_closed", (message: string) => {
      console.log(message);
      setErrorMessage(message);
      setStateOfPlayer('MENU');
      setPin('');
      setPlayers([]);
      setMyPlayer(null);
      setMyRole(null);
      setCurrentQuestion(null);
      setIsLastQuestion(false);
      sessionStorage.removeItem('lastRoomPin');
      sessionStorage.removeItem('playerToken');
    });

    return () => {
      socket.off('reconnected_success');
      socket.off('room_created');
      socket.off('joined_room');
      socket.off("update_players");
      socket.off("new_question");
      socket.off("round_finished");
      socket.off("game_restarted");
      socket.off("game_ended");
      socket.off("show_feedback");
      socket.off("reconnect_failed_kicked_or_closed");
      socket.off("error");
    };

  }, []);

  //RETURNING UI BASED ON STATE OF PLAYER

  if (stateOfPlayer === 'LANDING') {
    return <LandingPageScreen setStateOfPlayer={setStateOfPlayer} />;
  }

  if (stateOfPlayer === 'IN_GAME' && currentQuestion) {
    return <GameScreen currentQuestion={currentQuestion} onAnswerSubmitted={handleAnswerSubmitted} />;
  }

  if (stateOfPlayer === 'ROUND_RESULTS') {

    return <LeaderBoardScreen playersList={players} myRole={myRole} onNextQuestion={handleNextQuestion} isLastQuestion={isLastQuestion} onRestartGame={handleRestartGame} onEndGame={handleEndGame} />
  }

  if (stateOfPlayer === 'LOBBY_PLAYER') {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center bg-[url('/caminho-da-tua-onda.jpg')] bg-cover bg-center bg-fixed px-4 py-6 font-sans">

        {/* Cartão de Vidro Azul */}
        <div className="flex min-h-80 w-full max-w-sm md:max-w-xl lg:max-w-3xl flex-col items-center justify-center gap-6 rounded-3xl border border-blue-400/30 bg-blue-500/20 backdrop-blur-md p-6 md:p-10 lg:p-14 shadow-2xl transition-all duration-300 text-center">

          <h1 className="text-4xl font-black  text-black md:text-5xl drop-shadow-md">You are in!</h1>

          <p className="text-lg md:text-xl font-bold  text-black/80 animate-pulse">
            Wait for the host to start...
          </p>

          <h2 className="text-2xl font-bold  text-black mt-2 md:text-3xl">
            Room PIN: <span className="font-black tracking-widest">{pin}</span>
          </h2>

          <h3 className="text-lg font-bold  text-black mt-4 md:text-xl">
            Players in the room ({players.length}) / {MAX_PLAYERS_IN_ROOM}
          </h3>

          <ul className="flex max-w-full flex-wrap justify-center gap-3">
            {players.map((player) => (
              <div
                className="flex max-w-full items-center justify-center rounded-full bg-white/90 px-4 py-2 text-base font-bold text-gray-900 shadow-sm md:px-5 md:py-3 md:text-lg"
                key={player.id}
              >
                <li className="min-w-0 break-all">{player.nickname}</li>
              </div>
            ))}
          </ul>

          <button
            className="mt-6 w-full rounded-2xl border-b-4 border-slate-700 bg-slate-500 p-4 text-xl font-bold text-white shadow-lg transition-all duration-150 hover:bg-slate-400 active:translate-y-1 active:scale-95 sm:w-auto md:px-10 md:py-4"
            onClick={() => handleReturnToMenu(myRole)}
          >
            Leave Room
          </button>

        </div>
      </div>
    );
  }

  if (stateOfPlayer === 'FEEDBACK') {
    return <FeedBackScreen myPlayer={myPlayer} question={currentQuestion} ></FeedBackScreen>
  }

  // RETURNING UI FOR MENU AND LOBBY HOST STATES
  return (
    <>
      <div className="flex min-h-dvh w-full items-center justify-center bg-[url('/caminho-da-tua-onda.jpg')] bg-cover bg-center bg-fixed px-4 py-6 font-sans">

        <div className="flex min-h-80 w-full max-w-sm md:max-w-xl lg:max-w-3xl flex-col items-center justify-center gap-6 rounded-3xl border border-black bg-blue-500/20 backdrop-blur-md p-6 md:p-10 lg:p-14 shadow-2xl transition-all duration-300">
          <div className="flex w-full">
            <span className="flex w-full flex-col gap-3 font-bold text-black md:flex-row md:items-center md:justify-center md:text-xl">
              Nickname:
              <input
                type="text"
                placeholder="Your's nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                disabled={Boolean(pin)}
                className="w-full rounded-2xl border-4 border-transparent bg-white/90 p-4 text-center text-lg font-bold text-gray-900 shadow-inner outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 md:max-w-xs md:p-5 md:text-2xl"
              />
            </span>
          </div>

          {!pin ? (
            <div className="mt-6 flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
              <button
                className="w-full rounded-2xl border-b-4 border-blue-700 bg-blue-500 p-4 text-xl font-bold text-white shadow-lg transition-all duration-150 hover:bg-blue-400 active:translate-y-1 active:scale-95 sm:w-auto md:p-5 md:text-2xl"
                onClick={handleCreateRoom}
              >
                Create room
              </button>
              <button
                className="w-full rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 p-4 text-xl font-bold text-white shadow-lg transition-all duration-150 hover:bg-emerald-400 active:translate-y-1 active:scale-95 sm:w-auto md:p-5 md:text-2xl"
                onClick={openJoinRoomModal}
              >
                Join room
              </button>
            </div>
          ) : (
            // Lobby Host View
            <div className="mt-4 flex w-full flex-col items-center justify-center gap-4 text-black">
              <h2 className="text-xl font-bold text-black/80">Room PIN:</h2>
              <h1 className="text-5xl font-black tracking-widest md:text-7xl">{pin}</h1>

              <h3 className="mt-6 text-lg font-bold md:text-xl">
                Players in the room ({players.length}) / {MAX_PLAYERS_IN_ROOM}
              </h3>

              <ul className="flex max-w-full flex-wrap justify-center gap-3">
                {players.map((player) => (
                  <div className="flex max-w-full items-center justify-center rounded-full bg-white/90 px-4 py-2 text-base font-bold text-gray-900 shadow-sm md:px-5 md:py-3 md:text-lg" key={player.id}>
                    <li key={player.id} className="min-w-0 break-all">{player.nickname}</li>
                    {player.id !== socket.id && (
                      <button
                        type="button"
                        className="ml-3 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full hover:scale-110 hover:bg-red-100 transition-all"
                        aria-label={`Remove ${player.nickname}`}
                        onClick={() => handleRemovePlayer(player.id)}
                      >
                        <img src={deleteFriendIcon} alt="Kick" className="h-5 w-5 opacity-70" />
                      </button>
                    )}
                  </div>
                ))}
              </ul>

              <div className="mt-8 flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
                <button
                  onClick={() => handleReturnToMenu(myRole)}
                  className="w-full rounded-2xl border-b-4 border-slate-700 bg-slate-500 p-4 text-xl font-bold text-white shadow-lg transition-all duration-150 hover:bg-slate-400 active:translate-y-1 active:scale-95 sm:w-auto md:p-5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartGame}
                  className="w-full rounded-2xl border-b-4 border-green-700 bg-green-500 p-4 text-xl font-bold text-white shadow-lg transition-all duration-150 hover:bg-green-400 active:translate-y-1 active:scale-95 sm:w-auto md:px-10 md:py-5 md:text-2xl"
                >
                  Start game
                </button>
              </div>
            </div>
          )}

          {errorMessage && (
            <p className="mt-4 rounded-xl bg-red-500/20 px-4 py-2 font-bold text-gray-500 border border-red-500/50">
              {errorMessage}
            </p>
          )}
        </div>
      </div>

      {isJoinRoomModalOpen && (
        <JoinRoomModal
          isOpen={isJoinRoomModalOpen}
          onClose={() => setIsJoinRoomModalOpen(false)}
          nickname={nickname}
          onJoin={handleJoinRoom}
        />
      )}
    </>
  );
}

export default App
