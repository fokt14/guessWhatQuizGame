import { useState, useEffect } from 'react'
import './App.css'
import { io } from 'socket.io-client';
import type { Player } from './interfaces/interfaces';
import JoinRoomModal from './components/joinRoomModal';

const socket = io('http://localhost:3000');


function App() {

  const [pin, setPin] = useState('')
  const [nickname, setNickname] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [stateOfPlayer, setStateOfPlayer] = useState<string>();
  const [isJoinRoomModalOpen, setIsJoinRoomModalOpen] = useState(false);


  const handleCreateRoom = () => {
    setErrorMessage('');

    if (!nickname) {
      setErrorMessage('Please fill in your Nickname.');
      return;
    }
    socket.emit('create_room', { nickname: nickname });
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
    setStateOfPlayer('JOINED');
    console.log(`Tentando entrar na sala com PIN: ${pinFromModal} e Nickname: ${nickname}`);
  }

  const handleStartGame = () => {
    socket.emit('start_game', { pin: pin });
  }

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

    return () => {
      socket.off('room_created');
      socket.off("update_players");
    };


  }, []);

  return (
    <>
      <div className='flex min-h-screen w-full items-center justify-center flex-col'>
        <div className='flex flex-col items-center justify-center gap-4 border-2 border-black p-4 rounded-lg w-1/3 h-80 bg-blue-200'>
          <div className='flex ' >
            <span className='flex gap-2 items-center justify-center font-bold'>
              Nickname: <input
                type="text"
                placeholder="Your Nickname.."
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              /></span></div>
          <div className='flex'>

            {!pin ? (
              <div className='flex flex-col gap-5'>
                <div className='flex flex-row gap-5'>
                  <button className='border-2 rounded-4xl p-3 hover:bg-blue-400 cursor-pointer' onClick={handleCreateRoom}>Create room</button>
                  <button className='border-2 rounded-4xl p-3 hover:bg-blue-400 cursor-pointer' onClick={openJoinRoomModal}>Join room</button>
                </div>
                {stateOfPlayer === 'JOINED' ? (<p>Your are in the room!</p>) : null}
              </div>
            ) : (
              <div className='flex flex-col gap-2 items-center justify-center'>
                <h2 className='font-bold'>Room PIN:</h2>
                <h1 >{pin}</h1>
                <h3 className='font-bold'>Players in the room ({players.length}):</h3>
                <ul>
                  {players.map((player) => (
                    <li key={player.id}>{player.nickname}</li>
                  ))}
                </ul>
                <button onClick={handleStartGame} className='border-2 rounded-4xl p-3 hover:bg-blue-400 cursor-pointer mt-2'>Start game</button>
              </div>
            )}
          </div>

          {isJoinRoomModalOpen && <JoinRoomModal isOpen={isJoinRoomModalOpen}
            onClose={() => setIsJoinRoomModalOpen(false)} nickname={nickname} onJoin={handleJoinRoom} />}


          {errorMessage ? (<p className='text-red-500'>{errorMessage}</p>) : null}
          {/* 
          <input
            type="text"
            placeholder="O teu Nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />

                      <input
              type="text"
              placeholder="PIN (ex: 4821)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            /> 
          <div>
            <h3>Jogadores na sala ({players.length}):</h3>
            <ul>
              {players.map((player) => (
                <li key={player.id}>{player.nickname}</li>
              ))}
            </ul>
          </div>
          <div>
            <button onClick={handleJoinRoom}>Join room</button>
          </div> */}
        </div>
      </div>

    </>
  )
}

export default App
