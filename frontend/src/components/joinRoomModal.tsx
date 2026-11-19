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
        <>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-slate-800 bg-blue-200 p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 sm:p-6"
                >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h3 className="text-xl font-bold">{'Join Room'}</h3>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white transition-colors text-lg font-bold px-2 py-1"
                            type="button"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-4">
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="Enter PIN"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            className="w-full rounded-xl border border-slate-600 bg-white px-4 py-3 text-center text-lg outline-none focus:border-blue-500"
                        />
                        <button className='min-h-11 w-full rounded-2xl border-2 border-blue-500 bg-slate-900 text-white hover:bg-slate-600 cursor-pointer sm:w-28' onClick={handleJoin}>Join</button>
                    </div>
                </div>
            </div>
        </>
    )

}
