import { useState, useEffect } from 'react'
import './App.css'
import { io } from 'socket.io-client';
import JoinRoomModal from './components/joinRoomModal';
import GameScreen from './components/GameScreen';
import LeaderBoardScreen from './components/LeaderBoardScreen';
import type { Question, Player } from './interfaces/interfaces';
import type { GameState } from './interfaces/enums';
import FeedBackScreen from './components/FeedBackScreen';


const socket = io('http://localhost:3000');


function App() {

  const [pin, setPin] = useState('')
  const [nickname, setNickname] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [stateOfPlayer, setStateOfPlayer] = useState<GameState>('MENU'); // MENU, LOBBY_HOST, LOBBY_PLAYER, IN_GAME, GAME_OVER
  const [isJoinRoomModalOpen, setIsJoinRoomModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [myRole, setMyRole] = useState<"HOST" | "PLAYER" | null>(null);
  const [myPlayer, setMyPlayer] = useState<Player | null>(null);
  const [correctIndexAnswer, setCorrectIndexAnswer] = useState<number | null>(null);


  const handleCreateRoom = () => {
    setErrorMessage('');

    if (!nickname) {
      setErrorMessage('Please fill in your Nickname.');
      return;
    }

    socket.emit('create_room', { nickname: nickname });
    setStateOfPlayer('LOBBY_HOST');
  };

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

    socket.emit('join_room', { pin: pinFromModal, nickname: nickname });
    setStateOfPlayer('LOBBY_PLAYER');
    setPin(pinFromModal);
    console.log(`Tentando entrar na sala com PIN: ${pinFromModal} e Nickname: ${nickname}`);
  }

  const handleStartGame = () => {
    socket.emit('start_game', { pin: pin });
  }

  const handleAnswerSubmitted = (selectedAnswerIndex: number) => {
    console.log("Answer submitted:", selectedAnswerIndex);
    socket.emit('submit_answer', { pin: pin, answerIndex: selectedAnswerIndex });
  }

  const handleGoToLeaderboard = () => {
    console.log("GO TO LEADERBOARD")
    socket.emit('go_to_leaderboard', { pin: pin , isLastQuestion: isLastQuestion });
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
    socket.on('room_created', (data: { pin: string, players: Player[] }) => {
      console.log('Chegou ao cliente!', data);
      setPlayers(data.players);
      setPin(data.pin);
    });

    socket.on("update_players", (updatedList: Player[]) => {
      console.log("Lista de jogadores recebida:", updatedList);
      setPlayers(updatedList);
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

      setCorrectIndexAnswer(question.correctAnswerIndex);
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
    });

    return () => {
      socket.off('room_created');
      socket.off("update_players");
      socket.off("new_question");
      socket.off("round_finished");
      socket.off("game_restarted");
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
      <div className="flex min-h-screen items-center justify-center  text-white flex-col gap-4">
        <div className="flex flex-col items-center justify-center gap-4 border-2 border-black text-black p-4 rounded-lg w-1/3 min-h-80 bg-blue-200">
          <h1 className="text-3xl font-bold">You are in! </h1>
          <p className="text-xl text-slate-400">Wait for the host...</p>
          <h2 className="text-2xl font-semibold">Room PIN: {pin}</h2>
          <h3 className="text-xl font-semibold">Players in the room ({players.length}):</h3>
          <ul className="flex flex-wrap gap-2 justify-center">
            {players.map((player) => (
              <li key={player.id} className="bg-white text-black px-3 py-1 rounded-full text-sm font-semibold">{player.nickname}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (stateOfPlayer === 'FEEDBACK') {
    return <FeedBackScreen myPlayer={myPlayer} question={currentQuestion} onGoToLeaderboard={handleGoToLeaderboard}></FeedBackScreen>
  }

  // RETURNING UI FOR MENU AND LOBBY HOST STATES
  return (
    <>
      <div className='flex min-h-screen w-full items-center justify-center flex-col'>
        <div className='flex flex-col items-center justify-center gap-4 border-2 border-black p-4 rounded-lg w-1/3 min-h-80 bg-blue-200'>

          <div className='flex' >
            <span className='flex gap-2 items-center justify-center font-bold'>
              Nickname: <input
                type="text"
                placeholder="Your Nickname.."
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </span>
          </div>

          {!pin ? (
            <div className='flex flex-col gap-5 mt-4'>
              <div className='flex flex-row gap-5'>
                <button className='border-2 rounded-4xl p-3 hover:bg-blue-400 cursor-pointer' onClick={handleCreateRoom}>Create room</button>
                <button className='border-2 rounded-4xl p-3 hover:bg-blue-400 cursor-pointer' onClick={openJoinRoomModal}>Join room</button>
              </div>
            </div>
          ) : ( //Lobby Host View
            <div className='flex flex-col gap-2 items-center justify-center mt-4'>
              <h2 className='font-bold'>Room PIN:</h2>
              <h1 className='text-4xl font-black'>{pin}</h1>
              <h3 className='font-bold mt-4'>Players in the room ({players.length}):</h3>
              <ul className='flex flex-wrap gap-2 justify-center'>
                {players.map((player) => (
                  <li key={player.id} className='bg-white px-3 py-1 rounded-full text-sm font-semibold'>{player.nickname}</li>
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
