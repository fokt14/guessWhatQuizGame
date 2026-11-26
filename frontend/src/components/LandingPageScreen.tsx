import type { GameState } from '../interfaces/enums';


interface LandingPageProps {
    setStateOfPlayer: (state: GameState) => void;
}

export default function LandingPageScreen({ setStateOfPlayer }: LandingPageProps) {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">

            <div className="mb-16 text-center">
                <h1 className="mb-4 text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-blue-600 via-blue-400 to-cyan-300 drop-shadow-[0_4px_25px_rgba(15,23,42,0.9)] sm:text-9xl">
                    GuessWhat
                </h1>
                <p className="mt-6 text-xl font-bold text-slate-400 sm:text-3xl drop-shadow-[0_2px_4px_rgba(255,255,255,0.3)]">
                    HAMK TECH EDITION.
                </p>
            </div>
            <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-3xl border border-blue-400/20 bg-blue-900/30 backdrop-blur-xl p-10 shadow-2xl">

                <div className="text-center mb-2">
                    <p className="text-blue-100/90 font-medium">Ready to prove who's the smartest?</p>
                </div>

                <button
                    onClick={() => setStateOfPlayer('MENU')}
                    className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-blue-600 px-8 py-5 font-bold text-white transition-all hover:scale-[1.02] hover:bg-blue-500 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                >
                    <span className="relative z-10 text-2xl tracking-wide">Enter the Game</span>
                    <div className="absolute inset-0 z-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                </button>
            </div>
            {/* 
            <div className="absolute bottom-8 text-center text-sm font-medium text-blue-200/30 tracking-widest uppercase">
                <p>Made for epic game nights</p>
            </div> */}
        </div>
    );
}