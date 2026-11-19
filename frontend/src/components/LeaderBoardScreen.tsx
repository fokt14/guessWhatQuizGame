import type { Player } from "../interfaces/interfaces";

interface LeaderBoardScreenProps {
    playersList: Player[];
    myRole: "HOST" | "PLAYER" | null;
    onNextQuestion: () => void;
    isLastQuestion: boolean;
    onRestartGame: () => void;
    onEndGame: () => void;
}

export default function LeaderBoardScreen({ playersList, myRole, onNextQuestion, isLastQuestion, onRestartGame, onEndGame }: LeaderBoardScreenProps) {

    const sortedPlayers = [...playersList].sort((a, b) => b.points - a.points);

    const handleNextQuestion = () => {
        console.log("sdad", isLastQuestion)
        onNextQuestion();
    }

    return (
        <div className="flex min-h-dvh w-full flex-col items-center justify-center px-4 py-6">

            <h1 className="mb-6 text-3xl font-black tracking-widest text-black drop-shadow-lg sm:mb-10 sm:text-5xl md:text-6xl">
                LEADERBOARD
            </h1>

            <div className="flex w-full max-w-2xl flex-col gap-3 rounded-2xl border-2 border-black bg-blue-200 p-3 sm:gap-4 sm:p-4">
                {sortedPlayers.map((player, index) => (
                    <div
                        key={player.id}
                        className={`flex items-center justify-between gap-2 rounded-2xl p-3 text-sm font-bold shadow-xl transition-transform duration-300 sm:p-5 sm:text-xl
                            ${index === 0 ? 'bg-yellow-400 text-yellow-900 border-4 border-yellow-300 ' :
                                index === 1 ? 'bg-slate-300 text-slate-800' :
                                    index === 2 ? 'bg-orange-300 text-orange-900' :
                                        'bg-white text-slate-900'} 
                        `}
                    >
                        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                            <span className="w-10 shrink-0 text-center text-lg font-black sm:w-14 sm:text-3xl">
                                {index === 0 ? '1st' : index === 1 ? '2nd' : index === 2 ? '3rd' : `${index + 1}th`}
                            </span>
                            <span className="truncate text-base sm:max-w-75 sm:text-2xl">
                                {player.nickname}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="shrink-0 rounded-full bg-black/10 px-2 py-2 text-xs font-black tracking-wide sm:px-4 sm:text-base">
                                {player.points} pts
                            </span>
                        </div>
                    </div>
                ))}
            </div>


            {myRole === "HOST" && !isLastQuestion && (
                <button
                    onClick={handleNextQuestion}
                    className="mt-6 w-full max-w-xs rounded-2xl bg-slate-900 px-6 py-3 text-base font-bold text-white transition-colors hover:bg-slate-600 sm:mt-10 sm:text-xl"
                >
                    Next Question
                </button>
            )}

            {myRole === "HOST" && isLastQuestion && (<>

                <div className="mt-6 flex w-full max-w-md flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
                    <button onClick={onRestartGame} className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-base font-bold text-white transition-colors hover:bg-slate-600 sm:w-auto sm:text-xl">Restart Game</button>
                    <button
                        onClick={onEndGame}
                        className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-base font-bold text-white transition-colors hover:bg-slate-600 sm:w-auto sm:text-xl"
                    >
                        End Game
                    </button>
                </div></>)}
        </div>
    );
}