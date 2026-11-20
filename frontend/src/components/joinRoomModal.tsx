import { useState } from 'react'

interface JoinRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    nickname: string;
    onJoin: (pin: string, nickname: string) => void;
}

export default function JoinRoomModal({ isOpen, onClose, onJoin, nickname }: JoinRoomModalProps) {

    const [pin, setPin] = useState('')

    if (!isOpen) return null;

    const handleJoin = () => {
        if (!pin) {
            alert('Please enter a PIN.');
            return;
        }

        onJoin(pin, nickname);
        onClose(); // Close the modal after joining
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="flex w-full max-w-sm flex-col gap-6 rounded-3xl border border-blue-400/50 bg-slate-600/70 backdrop-blur-xl p-6 shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)] animate-in fade-in zoom-in-95 duration-200 md:max-w-md md:p-8"
            >
                <div className="flex items-center justify-between border-b border-white/20 pb-4 text-white">
                    <h3 className="text-2xl font-black tracking-wide">Join Room</h3>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-xl font-bold text-white/60 transition-all hover:bg-white/10 hover:text-white"
                        type="button"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex flex-col items-center justify-center gap-5">
                    <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Room PIN"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        autoFocus
                        className="w-full rounded-2xl border-4 border-transparent bg-white/90 p-4 text-center text-3xl font-black tracking-widest text-gray-900 shadow-inner outline-none transition-all placeholder:text-gray-400 placeholder:text-xl placeholder:font-bold placeholder:tracking-normal focus:border-emerald-500"
                    />

                    <button
                        className="w-full cursor-pointer rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 p-4 text-xl font-bold text-white shadow-lg transition-all duration-150 hover:bg-emerald-400 active:translate-y-1 active:scale-95"
                        onClick={handleJoin}
                    >
                        Join
                    </button>
                </div>
            </div>
        </div>
    )
}