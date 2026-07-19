import React from 'react';
import { X } from 'lucide-react';

interface VideoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/10">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors"
                >
                    <X size={24} />
                </button>
                <div className="aspect-video w-full">
                    <video
                        src="/kidcode-feeling.mp4"
                        controls
                        autoPlay
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </div>
    );
};
