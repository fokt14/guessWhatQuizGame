import { useState } from 'react'

interface JoinRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    // onJoin: (pin: string, nickname: string) => void;
}

export default function JoinRoomModal({ isOpen, onClose }: JoinRoomModalProps) {

    const [pin, setPin] = useState('')

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-white flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150"
                >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h3 className="text-xl font-bold">{'Aviso'}</h3>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white transition-colors text-lg font-bold px-2 py-1"
                            type="button"
                        >
                            ✕
                        </button>
                    </div>
                    <div>
                        <h1>Join Room</h1>
                        <input type="text" placeholder="Enter PIN" value={pin} onChange={(e) => setPin(e.target.value)} />
                        <button>Join</button>
                    </div>
                </div>
            </div>
        </>
    )

}
