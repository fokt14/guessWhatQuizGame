import { useState, useEffect } from 'react'
import type { Player, Question } from "../interfaces/interfaces";
import questions from "../../../server/questions.js";



interface FeedBackScreenProps {
    myPlayer: Player | null;
    question: Question | null;
}

export default function FeedBackScreen({ myPlayer, question }: FeedBackScreenProps) {

    const [barWidth, setBarWidth] = useState('100%');

    let isCorrectAnswer = myPlayer?.lastAnswerIndex === question?.correctAnswerIndex;

    useEffect(() => {
        const timer = setTimeout(() => {
            setBarWidth('0%');
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>

            <div className={`min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-500 ${isCorrectAnswer ? 'bg-green-500' : 'bg-red-500'} text-white px-4`}>

                <h1 className="text-6xl md:text-8xl font-black tracking-widest uppercase mb-4 text-center drop-shadow-md">
                    {isCorrectAnswer ? 'CORRECT' : 'INCORRECT'}
                </h1>

                <div className="text-center mb-16">
                    <p className="text-lg md:text-xl font-medium text-white/80 mb-2">
                        Correct answer:
                    </p>
                    <p className="text-2xl md:text-4xl font-bold max-w-2xl px-6 py-4 bg-black/20 rounded-xl shadow-inner">
                        {question?.answers[question.correctAnswerIndex]}
                    </p>
                </div>

                {myPlayer?.role === 'HOST' && (
                    <div className="absolute bottom-10">
                        <button
                            className="px-10 py-4 bg-white text-black font-bold text-xl uppercase tracking-wider rounded-lg shadow-xl hover:bg-gray-100 hover:-translate-y-1 transition-all active:translate-y-0"
                        >
                            View Leaderboard
                        </button>
                    </div>
                )}

                <div className="absolute bottom-0 left-0 w-full h-2 bg-white/20">
                    <div className="h-full bg-white transition-all ease-linear" style={{ width: barWidth, transitionDuration: '5000ms' }}></div>
                </div>

            </div>

        </>
    )

}
