import type { Question } from "../interfaces/interfaces";
import { useState, useEffect } from "react";

interface GameScreenProps {
    currentQuestion: Question;
    onAnswerSubmitted: (selectedAnswerIndex: number) => void;
    hasAlreadyAnswered: boolean;
}

export default function GameScreen({ currentQuestion, onAnswerSubmitted, hasAlreadyAnswered }: GameScreenProps) {
    const [timeLeft, setTimeLeft] = useState(currentQuestion.timeRemainingSeconds ?? 60);

    const maxTime = 60;

    const handleAnswer = (index: number): void => {
        if (hasAlreadyAnswered) return;
        onAnswerSubmitted(index);
    }

    useEffect(() => {
        setTimeLeft(currentQuestion.timeRemainingSeconds ?? 60);

        let timerId = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timerId);
                    // if (!hasAnswered) {
                    //     onAnswerSubmitted(-1);
                    // }
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [currentQuestion]);

    useEffect(() => {
        if (timeLeft === 0 && !hasAlreadyAnswered) {
            onAnswerSubmitted(-1);
        }
    }, [timeLeft, hasAlreadyAnswered, onAnswerSubmitted]);

    const buttonColors = [
        "border-red-700 bg-red-500 hover:bg-red-400 focus:ring-red-400",
        "border-blue-700 bg-blue-500 hover:bg-blue-400 focus:ring-blue-400",
        "border-amber-700 bg-amber-500 hover:bg-amber-400 focus:ring-amber-400",
        "border-emerald-700 bg-emerald-900 hover:bg-emerald-600 focus:ring-emerald-400"
    ];

    return (
        <div className="flex min-h-dvh w-full items-center justify-center bg-cover bg-center bg-fixed px-4 py-6 font-sans">

            <div className="flex w-full max-w-sm flex-col gap-6 rounded-3xl border border-blue-400/50 bg-slate-900/70 p-6 shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)] backdrop-blur-xl md:max-w-4xl md:p-14">

                <div className="w-full h-3 sm:h-4 bg-slate-900/50 rounded-full overflow-hidden border border-white/10 shadow-inner">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ease-linear ${timeLeft <= 5 ? 'bg-red-500 animate-pulse' : timeLeft <= 10 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${(timeLeft / maxTime) * 100}%` }}
                    />
                </div>

                <div className="flex flex-col items-center justify-center gap-4 text-center text-white">
                    <div className={`flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full text-2xl font-black shadow-lg transition-colors duration-300 ${timeLeft <= 5 ? 'bg-red-600 text-white animate-pulse' : 'bg-white/20 backdrop-blur-sm text-white border border-white/30'}`}>
                        {timeLeft}
                    </div>
                    <h1 className="max-w-2xl text-2xl font-black md:text-4xl drop-shadow-md">
                        {currentQuestion.question}
                    </h1>
                    {currentQuestion.imageUrl && (
                        <img
                            src={currentQuestion.imageUrl}
                            alt="Image"
                            className="mt-2 max-h-40 w-full max-w-md rounded-2xl object-contain drop-shadow-lg md:max-h-64 border border-white/10 bg-black/20"
                        />
                    )}
                </div>

                <div className="mt-4 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                    {currentQuestion.answers.map((answer: string, index: number) => {
                        const colorClass = buttonColors[index % 4];

                        return (
                            <button
                                key={index}
                                onClick={() => handleAnswer(index)}
                                disabled={hasAlreadyAnswered}
                                className={`w-full rounded-2xl border-b-8 p-6 text-xl md:text-2xl font-black text-white shadow-lg transition-all duration-250 break-words ${hasAlreadyAnswered ? 'opacity-50 cursor-not-allowed scale-95 border-b-0 translate-y-2' : `${colorClass} active:scale-95 active:translate-y-2 active:border-b-0`}`}
                            >
                                {answer}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}