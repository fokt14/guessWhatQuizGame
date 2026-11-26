export interface Player {
  id: string;
  nickname: string;
  role: "HOST" | "PLAYER";
  hasAlreadyAnswered: boolean;
  points: number;
  lastAnswerIndex: number | null;
}

export interface Question {
  question: string;
  answers: string[];
  correctAnswerIndex: number;
  questionIndex: number;
  totalQuestions: number;
  timeRemainingSeconds?: number;
  imageUrl?: string;
}
