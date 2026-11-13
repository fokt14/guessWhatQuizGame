import type { Player } from "../interfaces/interfaces";

interface LeaderBoardScreenProps {
    playersList: Player[];
    myRole: "HOST" | "PLAYER" | null;
    onNextQuestion: () => void;
    isLastQuestion: boolean;
}

export default function LeaderBoardScreen({ playersList, myRole, onNextQuestion, isLastQuestion }: LeaderBoardScreenProps) {

    const sortedPlayers = [...playersList].sort((a, b) => b.points - a.points);

    const handleNextQuestion = () => {
        onNextQuestion();
    }

    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center p-4">

            <h1 className="text-5xl md:text-6xl font-black text-black mb-10 tracking-widest drop-shadow-lg">
                LEADERBOARD
            </h1>

            <div className="flex flex-col gap-4 w-full max-w-2xl border-2 border-black rounded-2xl p-4 bg-blue-200">
                {sortedPlayers.map((player, index) => (
                    <div
                        key={player.id}
                        className={`flex flex-row items-center justify-between p-5 rounded-2xl shadow-xl font-bold text-xl transition-transform duration-300
                            ${index === 0 ? 'bg-yellow-400 text-yellow-900 border-4 border-yellow-300 ' :
                                index === 1 ? 'bg-slate-300 text-slate-800' :
                                    index === 2 ? 'bg-orange-300 text-orange-900' :
                                        'bg-white text-slate-900'} 
                        `}
                    >
                        <div className="flex gap-4 items-center">
                            <span className="text-3xl w-14 text-center font-black">
                                {index === 0 ? '1st' : index === 1 ? '2nd' : index === 2 ? '3rd' : `${index + 1}th`}
                            </span>
                            <span className="truncate max-w-50 sm:max-w-75 text-2xl">
                                {player.nickname}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-black bg-black/10 px-4 py-2 rounded-full tracking-wide">
                                {player.points} pts
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {myRole === "HOST" || !isLastQuestion && (
                <button
                    onClick={handleNextQuestion}
                    className="mt-10 bg-slate-900 text-white px-6 py-3 rounded-2xl text-xl font-bold hover:bg-slate-600 transition-colors"
                >
                    Next Question
                </button>
            )}

            {/* TODO: SE O JOGO ACABOU, MOSTRAR BOTÃO DE VOLTAR PARA O MENU */}
        </div>
    );
}