import type { Question } from "../interfaces/interfaces";
import { useState, useEffect } from "react";


interface GameScreenProps {
    currentQuestion: Question;
    onAnswerSubmitted: (selectedAnswerIndex: number) => void;
}



export default function GameScreen({ currentQuestion, onAnswerSubmitted }: GameScreenProps) {

    const [timeLeft, setTimeLeft] = useState(currentQuestion.timeRemainingSeconds ?? 15);
    const [hasAnswered, setHasAnswered] = useState(false);

    const handleAnswer = (index: number): void => {
        console.log(`Selected answer: ${index}`);

        if (hasAnswered) {
            return;
        }

        setHasAnswered(true);
        onAnswerSubmitted(index);
    }

    useEffect(() => {
        let timerId = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timerId);
                    if (!hasAnswered) {
                        onAnswerSubmitted(-1);
                    }
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, []);


    return (
        <>
            <div className="flex min-h-dvh w-full flex-col items-center justify-center gap-4 px-4 py-6">
                <div className="flex flex-col items-center justify-center gap-3 text-center">
                    <div className={`mb-2 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-black transition-colors duration-300 sm:h-20 sm:w-20 sm:text-3xl ${timeLeft <= 5 ? 'bg-red-600 text-white animate-pulse' : 'bg-white text-slate-900'
                        }`}>
                        {timeLeft}
                    </div>
                    <h1 className="max-w-3xl text-2xl font-black text-black sm:text-4xl md:text-5xl">{currentQuestion.question}</h1>
                </div>
                <div className="mt-2 grid w-full max-w-2xl grid-cols-1 gap-3 sm:mt-4 sm:grid-cols-2 sm:gap-4">
                    {currentQuestion.answers.map((answer: string, index: number) => (
                        <button
                            key={index}
                            onClick={() => handleAnswer(index)}
                            className={`w-full rounded-2xl border-2 p-4 text-base font-bold text-white sm:p-6 sm:text-xl ${hasAnswered ? 'bg-slate-500 opacity-50 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-600 transition-colors cursor-pointer'}`}
                        >
                            {answer}
                        </button>
                    ))}
                </div>
            </div>
        </>
    )
}
