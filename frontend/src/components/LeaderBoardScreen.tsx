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
        onNextQuestion();
    }

    return (
        <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-[url('/caminho-da-tua-onda.jpg')] bg-cover bg-center bg-fixed px-4 py-6 font-sans">

            <h1 className="mb-6 text-4xl font-black uppercase tracking-widest text-black drop-shadow-xl sm:mb-10 md:text-6xl animate-in slide-in-from-top-10 duration-500">
                Leaderboard
            </h1>

            <div className="flex w-full max-w-2xl flex-col gap-3 rounded-3xl border border-blue-400/30 bg-blue-900/40 backdrop-blur-xl p-4 shadow-2xl sm:p-6 max-h-[55vh] md:max-h-[65vh] overflow-y-auto">

                {sortedPlayers.map((player, index) => {
                    const isTop1 = index === 0;
                    const isTop2 = index === 1;
                    const isTop3 = index === 2;
                    const isPodium = isTop1 || isTop2 || isTop3;

                    const rowStyle = isTop1
                        ? "bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-950 border border-yellow-200 shadow-[0_0_20px_rgba(234,179,8,0.5)]"
                        : isTop2
                            ? "bg-gradient-to-r from-slate-200 to-slate-400 text-slate-900 border border-slate-100 shadow-[0_0_15px_rgba(148,163,184,0.4)]"
                            : isTop3
                                ? "bg-gradient-to-r from-orange-300 to-orange-500 text-orange-950 border border-orange-200 shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                                : "bg-white/10 text-white border border-white/10 hover:bg-white/20";

                    return (
                        <div
                            key={player.id}
                            className={`flex items-center justify-between gap-3 rounded-2xl p-4 sm:p-5 font-bold transition-all duration-300 shrink-0 ${rowStyle}`}
                        >
                            <div className="flex min-w-0 items-center gap-3 sm:gap-5">
                                <span className={`flex w-12 shrink-0 items-center justify-center font-black sm:w-16 ${isTop1 ? 'text-3xl' : isPodium ? 'text-2xl' : 'text-lg sm:text-xl opacity-70'}`}>
                                    {isTop1 ? '1º' : isTop2 ? '2º' : isTop3 ? '3º' : `${index + 1}º`}
                                </span>
                                <span className={`truncate ${isPodium ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'}`}>
                                    {player.nickname}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="shrink-0 rounded-xl bg-black/20 px-3 py-2 text-sm sm:text-base font-black tracking-wide">
                                    {player.points} pts
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {myRole === "HOST" && (
                <div className="mt-8 flex w-full max-w-2xl flex-col items-center justify-center gap-4 sm:flex-row">
                    {!isLastQuestion ? (
                        <button
                            onClick={handleNextQuestion}
                            className="w-full rounded-2xl border-b-4 border-indigo-700 bg-indigo-500 p-4 text-xl font-bold text-white shadow-lg transition-all duration-150 hover:bg-indigo-400 active:translate-y-1 active:scale-95 sm:w-1/2"
                        >
                            Next Question
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={onRestartGame}
                                className="w-full rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 p-4 text-xl font-bold text-white shadow-lg transition-all duration-150 hover:bg-emerald-400 active:translate-y-1 active:scale-95 sm:w-1/2"
                            >
                                Play Again
                            </button>
                            <button
                                onClick={onEndGame}
                                className="w-full rounded-2xl border-b-4 border-red-700 bg-red-500 p-4 text-xl font-bold text-white shadow-lg transition-all duration-150 hover:bg-red-400 active:translate-y-1 active:scale-95 sm:w-1/2"
                            >
                                End Game
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}