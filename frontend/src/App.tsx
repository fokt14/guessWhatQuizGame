import { useState, useEffect } from 'react'
import './App.css'
import { io } from 'socket.io-client';
import JoinRoomModal from './components/joinRoomModal';
import GameScreen from './components/GameScreen';
import LeaderBoardScreen from './components/LeaderBoardScreen';
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
  const [stateOfPlayer, setStateOfPlayer] = useState<GameState>('MENU'); // MENU, LOBBY_HOST, LOBBY_PLAYER, IN_GAME, GAME_OVER
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

  if (stateOfPlayer === 'IN_GAME' && currentQuestion) {
    return <GameScreen currentQuestion={currentQuestion} onAnswerSubmitted={handleAnswerSubmitted} />;
  }

  if (stateOfPlayer === 'ROUND_RESULTS') {

    return <LeaderBoardScreen playersList={players} myRole={myRole} onNextQuestion={handleNextQuestion} isLastQuestion={isLastQuestion} onRestartGame={handleRestartGame} onEndGame={handleEndGame} />
  }

  if (stateOfPlayer === 'LOBBY_PLAYER') {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center px-4 py-6 text-white">
        <div className="flex min-h-80 w-full max-w-md flex-col items-center justify-center gap-4 rounded-lg border-2 border-black bg-blue-200 p-4 text-center text-black sm:p-6">
          <h1 className="text-2xl font-bold sm:text-3xl">You are in! </h1>
          <button className='border-2 rounded-4xl p-3 hover:bg-blue-400 cursor-pointer' onClick={() => handleReturnToMenu(myRole)}>Return</button>
          <p className="text-base text-slate-600 sm:text-xl">Wait for the host...</p>
          <h2 className="text-xl font-semibold sm:text-2xl">Room PIN: {pin}</h2>
          <h3 className="text-base font-semibold sm:text-xl">Players in the room ({players.length}) / {MAX_PLAYERS_IN_ROOM}</h3>
          <ul className="flex max-w-full flex-wrap justify-center gap-2">
            {players.map((player) => (
              <li key={player.id} className="max-w-full break-all rounded-full bg-white px-3 py-1 text-sm font-semibold text-black">{player.nickname}</li>
            ))}
          </ul>
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
      <div className='flex min-h-dvh w-full items-center justify-center px-4 py-6'>
        <div className='flex min-h-80 w-full max-w-md flex-col items-center justify-center gap-4 rounded-lg border-2 border-black bg-blue-200 p-4 sm:p-6'>

          <div className='flex w-full' >
            <span className='flex w-full flex-col gap-2 font-bold sm:flex-row sm:items-center sm:justify-center'>
              Nickname: <input
                type="text"
                placeholder="Your Nickname.."
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                disabled={Boolean(pin)}
                className="w-full rounded-lg border border-slate-600 bg-white px-3 py-2 font-normal outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 sm:max-w-56"
              />
            </span>
          </div>

          {!pin ? (
            <div className='flex flex-col gap-5 mt-4'>
              <div className='flex w-full flex-col gap-3 sm:flex-row sm:gap-5'>
                <button className='border-2 rounded-4xl p-3 hover:bg-blue-400 cursor-pointer w-full sm:w-auto' onClick={handleCreateRoom}>Create room</button>
                <button className='border-2 rounded-4xl p-3 hover:bg-blue-400 cursor-pointer w-full sm:w-auto' onClick={openJoinRoomModal}>Join room</button>
              </div>
            </div>
          ) : ( //Lobby Host View
            <div className='flex flex-col gap-2 items-center justify-center mt-4'>
              <button className='border-2 rounded-4xl p-3 hover:bg-blue-400 cursor-pointer' onClick={() => handleReturnToMenu(myRole)}>Return</button>
              <h2 className='font-bold'>Room PIN:</h2>
              <h1 className='text-3xl font-black sm:text-4xl'>{pin}</h1>
              <h3 className='font-bold mt-4 text-center'>Players in the room ({players.length}) / {MAX_PLAYERS_IN_ROOM}</h3>
              <ul className='flex max-w-full flex-wrap gap-2 justify-center'>
                {players.map((player) => (
                  <div className='max-w-full bg-white px-3 py-1 rounded-full text-sm font-semibold flex items-center justify-center' key={player.id}>
                    <li key={player.id} className='min-w-0 break-all'>{player.nickname}</li>
                    {player.id !== socket.id && (
                      <button
                        type='button'
                        className='ml-2 w-5 h-5 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform'
                        aria-label={`Remove ${player.nickname}`}
                        onClick={() => handleRemovePlayer(player.id)}
                      >
                        <img src={deleteFriendIcon} alt='' className='w-4 h-4' />
                      </button>)
                    }
                  </div>
                ))}
              </ul>
              <button onClick={handleStartGame} className='border-2 bg-green-500 text-white font-bold rounded-4xl p-3 hover:bg-green-600 cursor-pointer mt-4'>Start game</button>
            </div>
          )}

          {errorMessage ? (<p className='text-red-500 font-bold mt-2'>{errorMessage}</p>) : null}
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
