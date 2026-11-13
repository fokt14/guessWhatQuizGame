export  interface Player {
  id: string;
  nickname: string;
  hasAlreadyAnswered: boolean,
  points: number;
}

export  interface Question {
  question: string;
  answers: string[];
  correctAnswerIndex: number;
  currentQuestionIndex: number;
}


