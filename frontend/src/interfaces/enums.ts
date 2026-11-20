export type GameState = 
  | "LANDING"
  | "MENU" // In the menu, before joining or creating a room
  | "LOBBY_HOST"  // In the lobby, waiting for players to join (host)
  | "LOBBY_PLAYER" // In the lobby, waiting for players to join (player)
  | "IN_GAME"  // In the game, answering questions
  | "GAME_OVER" // Game has ended, showing results
  | "ROUND_RESULTS" // Show the round result, but still in GAME 
  | "FEEDBACK"; // Show the feedback from the question, but still in GAME