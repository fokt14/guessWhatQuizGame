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
                    className="w-full max-w-md rounded-2xl bg-blue-200 border   border-slate-800 p-6 shadow-2xl  flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150"
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
                    <div className="flex flex-col gap-4 align-center justify-center items-center">
                        <input type="text" placeholder="Enter PIN" value={pin} onChange={(e) => setPin(e.target.value)} />
                        <button className='bg-slate-900 border-2 border-blue-500 rounded-2xl w-28 text-white min-h-9 hover:bg-slate-600 cursor-pointer' onClick={handleJoin}>Join</button>
                    </div>
                </div>
            </div>
        </>
    )

}
