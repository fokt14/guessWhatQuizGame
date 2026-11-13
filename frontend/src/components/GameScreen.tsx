import type { Question } from "../interfaces/interfaces";
import { useState, useEffect } from "react";


interface GameScreenProps {
    currentQuestion: Question;
    onAnswerSubmitted: (selectedAnswerIndex: number) => void;
}



export default function GameScreen({ currentQuestion, onAnswerSubmitted }: GameScreenProps) {

    const [timeLeft, setTimeLeft] = useState(15);
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
            <div className="w-full min-h-screen flex flex-col items-center justify-center content-center gap-4">
                <div className="text-center items-center justify-center flex flex-col gap-4">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black mb-6 transition-colors duration-300 ${timeLeft <= 5 ? 'bg-red-600 text-white animate-pulse' : 'bg-white text-slate-900'
                        }`}>
                        {timeLeft}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-black">{currentQuestion.question}</h1>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mt-4">
                    {currentQuestion.answers.map((answer: string, index: number) => (
                        <button
                            key={index}
                            onClick={() => handleAnswer(index)}
                            className={`border-2 rounded-2xl p-6 text-white text-xl font-bold ${hasAnswered ? 'bg-slate-500 opacity-50 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-600 transition-colors cursor-pointer w-full'}`}
                        >
                            {answer}
                        </button>
                    ))}
                </div>
            </div>
        </>
    )
}
