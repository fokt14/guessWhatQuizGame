import { useState, useEffect } from 'react'
import type { Player, Question } from "../interfaces/interfaces";



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
        
            <div className={`flex min-h-dvh w-full flex-col items-center justify-center px-4 py-6 text-center transition-colors duration-500 ${isCorrectAnswer ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                <h1 className="mb-6 text-4xl font-black uppercase tracking-widest drop-shadow-md sm:mb-8 sm:text-6xl md:text-8xl">
                    {isCorrectAnswer ? 'CORRECT' : 'INCORRECT'}
                </h1>

                <div className="mb-12 text-center sm:mb-16">
                    <p className="mb-2 text-base font-medium text-white/80 sm:text-lg md:text-xl">
                        Correct answer:
                    </p>
                    <p className="max-w-2xl rounded-xl bg-black/20 px-4 py-4 text-xl font-bold shadow-inner sm:px-6 sm:text-2xl md:text-4xl">
                        {question?.answers[question.correctAnswerIndex]}
                    </p>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-2 bg-white/20">
                    <div className="h-full bg-white transition-all ease-linear" style={{ width: barWidth, transitionDuration: '5000ms' }}></div>
                </div>

            </div>

        </>
    )

}
