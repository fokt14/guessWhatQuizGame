import { useState, useEffect } from 'react'
import './App.css'
import { Socket, io } from 'socket.io-client';
import type { Player } from './interfaces/interfaces';

const socket = io('http://localhost:3000');


function App() {

  const [pin, setPin] = useState('')
  const [nickname, setNickname] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);


  const handleCreateRoom = () => {
    socket.emit('create_room');
  };

  const handleJoinRoom = () => {

    console.log("oi")

    if (!pin || !nickname) {
      alert('Preenche o PIN e o teu nome!');
      return;
    }

    socket.emit('join_room', { pin: pin, nickname: nickname });
    console.log(`Tentando entrar na sala com PIN: ${pin} e Nickname: ${nickname}`);
  }

  useEffect(() => {
    socket.on('room_created', (data: { pin: string }) => {
      console.log('Chegou ao cliente!', data);
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
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        {!pin ? (
          <button onClick={handleCreateRoom}>Criar Sala</button>
        ) : (
          <div>
            <h2>PIN da Sala:</h2>
            <h1 style={{ fontSize: '3rem', letterSpacing: '4px' }}>{pin}</h1>
            <p>A aguardar jogadores...</p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '250px' }}>
        <input
          type="text"
          placeholder="PIN (ex: 4821)"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        /> </div>
      <input
        type="text"
        placeholder="O teu Nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
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
      </div>
    </>
  )
}

export default App
