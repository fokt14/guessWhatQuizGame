import { useEffect, useState } from "react";
import type { Player } from "../interfaces/interfaces";

interface LeaderBoardScreenProps {
    myPlayer: Player | null;
    playersList: Player[];
    myRole: "HOST" | "PLAYER" | null;
    onNextQuestion: () => void;
    isLastQuestion: boolean;
    onRestartGame: () => void;
    onEndGame: () => void;
}

export default function LeaderBoardScreen({ myPlayer, playersList, myRole, onNextQuestion, isLastQuestion, onRestartGame, onEndGame }: LeaderBoardScreenProps) {

    const sortedPlayers = [...playersList].sort((a, b) => b.points - a.points);
    const podiumPlayers = sortedPlayers.slice(0, 3);
    const [countdown, setCountdown] = useState<number | null>(isLastQuestion ? 5 : null);
    const [revealedPodiumCount, setRevealedPodiumCount] = useState(0);
    const podiumRevealComplete = countdown === null && revealedPodiumCount >= podiumPlayers.length;

    useEffect(() => {
        if (!isLastQuestion || countdown === null) return;

        const timerId = window.setTimeout(() => {
            if (countdown === 1) {
                setCountdown(null);
                setRevealedPodiumCount(1);
            } else {
                setCountdown(countdown - 1);
            }
        }, 1000);

        return () => window.clearTimeout(timerId);
    }, [countdown, isLastQuestion]);

    useEffect(() => {
        if (
            !isLastQuestion ||
            countdown !== null ||
            revealedPodiumCount === 0 ||
            revealedPodiumCount >= podiumPlayers.length
        ) {
            return;
        }

        const timerId = window.setTimeout(() => {
            setRevealedPodiumCount(count => count + 1);
        }, 1000);

        return () => window.clearTimeout(timerId);
    }, [countdown, isLastQuestion, podiumPlayers.length, revealedPodiumCount]);

    const handleNextQuestion = () => {
        onNextQuestion();
    }

    return (
        <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-cover bg-center bg-fixed px-4 py-6 font-sans">

            <h1 className={`mb-6 text-4xl font-black uppercase tracking-widest drop-shadow-xl sm:mb-10 md:text-6xl animate-in slide-in-from-top-10 duration-500 text-black'}`}>
                {isLastQuestion ? 'Final Leaderboard' : 'Leaderboard'}
            </h1>

            <h4>
                {myPlayer && myPlayer.role !== "HOST" && !isLastQuestion && (
                    <div className={`mb-6 text-lg font-bold drop-shadow-md sm:text-xl md:text-2xl text-black'}`}>
                        You are in <span className={isLastQuestion ? 'text-yellow-300' : 'text-blue-600'}> {sortedPlayers.findIndex(player => player.id === myPlayer.id) + 1}º</span> place with <span className={isLastQuestion ? 'text-yellow-300' : 'text-blue-600'}>{myPlayer.points} pts</span>
                    </div>
                )}
            </h4>

            {isLastQuestion && countdown !== null && (
                <div className="mb-6 flex flex-col items-center rounded-3xl border border-blue-300/30 bg-slate-900/70 px-10 py-6 text-center text-white shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)] backdrop-blur-xl">
                    <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-200 sm:text-base">
                        Final podium in
                    </p>
                    <span
                        key={countdown}
                        aria-live="polite"
                        className="mt-2 animate-pulse text-6xl font-black text-yellow-300 drop-shadow-lg sm:text-7xl"
                    >
                        {countdown}
                    </span>
                </div>
            )}

            {isLastQuestion && (
                <div className="mb-8 grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
                    {podiumPlayers.map((player, index) => {
                        const place = index + 1;
                        const isRevealed = index >= podiumPlayers.length - revealedPodiumCount;
                        const podiumStyle = place === 1
                            ? 'border-yellow-200 bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-950 shadow-[0_0_28px_rgba(234,179,8,0.5)]'
                            : place === 2
                                ? 'border-slate-100 bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900 shadow-[0_0_20px_rgba(148,163,184,0.4)]'
                                : 'border-orange-200 bg-gradient-to-br from-orange-300 to-orange-500 text-orange-950 shadow-[0_0_20px_rgba(249,115,22,0.4)]';

                        return (
                            <div
                                key={player.id}
                                className={`flex min-h-40 flex-col items-center justify-center rounded-3xl border p-5 text-center transition-all duration-1000 sm:min-h-48 ${podiumStyle} ${isRevealed ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-6 scale-95 opacity-0'
                                    }`}
                            >
                                <span className="text-sm font-black uppercase tracking-[0.2em] opacity-80">
                                    {place === 1 ? 'Champion' : `${place}º place`}
                                </span>
                                <span className="mt-2 max-w-full truncate text-2xl font-black sm:text-3xl">
                                    {player.nickname}
                                </span>
                                <span className="mt-2 rounded-xl bg-black/15 px-4 py-2 text-lg font-black">
                                    {player.points} pts
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {(!isLastQuestion || podiumRevealComplete) && (
                <>
                    {isLastQuestion && (
                        <div className={`mb-6 text-lg font-bold drop-shadow-md sm:text-xl md:text-2xl text-black'}`}>
                            <h2 className="mb-4 text-2xl font-black uppercase tracking-widest text-black drop-shadow-md">
                                All placements
                            </h2>

                            <div className={`mb-6 text-lg font-bold drop-shadow-md sm:text-xl md:text-2xl text-black'}`}>
                                You are in <span className={isLastQuestion ? 'text-yellow-300' : 'text-blue-600'}> {sortedPlayers.findIndex(player => player.id === myPlayer?.id) + 1}º</span> place with <span className={isLastQuestion ? 'text-yellow-300' : 'text-blue-600'}>{myPlayer?.points} pts</span>
                            </div>
                        </div>
                    )}

                    <div className={`flex w-full max-w-2xl flex-col gap-3 rounded-3xl border p-4 shadow-2xl backdrop-blur-xl sm:p-6 max-h-[55vh] md:max-h-[65vh] overflow-y-auto ${isLastQuestion ? 'border-blue-300/30 bg-slate-900/70' : 'border-blue-400/30 bg-blue-900/40'}`}>
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
                                    className={`flex shrink-0 items-center justify-between gap-3 rounded-2xl p-4 font-bold transition-all duration-300 sm:p-5 ${rowStyle}`}
                                >
                                    <div className="flex min-w-0 items-center gap-3 sm:gap-5">
                                        <span className={`flex w-12 shrink-0 items-center justify-center font-black sm:w-16 ${isTop1 ? 'text-3xl' : isPodium ? 'text-2xl' : 'text-lg sm:text-xl opacity-70'}`}>
                                            {isTop1 ? '1º' : isTop2 ? '2º' : isTop3 ? '3º' : `${index + 1}º`}
                                        </span>
                                        <span className={`truncate ${isPodium ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'}`}>
                                            {player.nickname}
                                        </span>
                                    </div>

                                    <span className="shrink-0 rounded-xl bg-black/20 px-3 py-2 text-sm font-black tracking-wide sm:text-base">
                                        {player.points} pts
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {myRole === "HOST" && (!isLastQuestion || podiumRevealComplete) && (
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