export interface Player {
  id: string;
  nickname: string;
}

export default interface Question {
  question: string;
  answers: string[];
  currentQuestionIndex: number;
}

