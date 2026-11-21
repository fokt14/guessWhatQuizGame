# GuessWhat

A real-time multiplayer trivia game built with React, Node.js, and Socket.io. 

Players can create private rooms using a PIN code and compete against friends in a fast-paced trivia match. Questions are randomly selected from a Firebase Firestore database.

## Live Demo

- Frontend: https://guess-what-quiz-game.vercel.app
- Backend: Hosted on Render

## Tech Stack

- **Frontend:** React, Vite, CSS
- **Backend:** Node.js, Express, Socket.io
- **Database:** Firebase Firestore

## Core Features

- Real-time multiplayer communication via WebSockets.
- PIN-based private room generation.
- Host and player role separation.
- Randomized selection of 10 unique questions per match.
- Responsive design for mobile and desktop.

## Local Development

### Prerequisites
- Node.js installed.
- A Firebase project with a Firestore database initialized.

### 1. Backend Setup
Navigate to the server directory:

```bash
cd server
npm install
```

Create a `.env` file in the `server` root directory:

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
FIREBASE_CREDENTIALS={"type":"service_account", ...}
```

Start the server:

```bash
npm start
```

### 2. Frontend Setup
Navigate to the client directory:

```bash
cd client
npm install
```

Create a `.env` file in the `client` root directory:

```env
VITE_SERVER_URL=http://localhost:3001
```

Start the development server:

```bash
npm run dev
```

## License

MIT
