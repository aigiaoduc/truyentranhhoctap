import React, { useState } from 'react';
import type { StoryPanel } from '../types';

interface PromptCardProps {
    panel: StoryPanel;
}

const PromptCard: React.FC<PromptCardProps> = ({ panel }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(panel.imagePrompt);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    const ImagePlaceholder = () => (
        <div className="w-full aspect-square bg-slate-200 flex items-center justify-center rounded-t-lg">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"></path></svg>
        </div>
    );

    const ImageLoadingSpinner = () => (
        <div className="w-full aspect-square bg-slate-200 flex flex-col items-center justify-center animate-pulse rounded-t-lg">
            <svg className="animate-spin h-8 w-8 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-xs text-slate-500 mt-2">Đang vẽ tranh...</p>
        </div>
    );

    return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
            <div className="bg-teal-500 text-white px-4 py-2 font-bold text-center">
                Cảnh {panel.panel}
            </div>
             {panel.isGeneratingImage ? (
                <ImageLoadingSpinner />
            ) : panel.imageUrl ? (
                <img src={panel.imageUrl} alt={`Ảnh minh họa cho cảnh ${panel.panel}`} className="w-full h-auto object-cover aspect-square" />
            ) : (
                <ImagePlaceholder />
            )}
            
            <div className="p-4 flex-grow flex flex-col">
                 <p className="text-slate-700 text-sm mb-4 bg-slate-50 p-3 rounded-md border border-slate-200 flex-grow">"{panel.storyText}"</p>
                
                <details className="text-xs">
                    <summary className="cursor-pointer text-slate-500 hover:text-slate-700 font-medium">Xem Image Prompt</summary>
                    <p className="mt-2 text-slate-500 bg-slate-100 p-2 rounded font-mono break-words">{panel.imagePrompt}</p>
                </details>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200">
                <button
                    onClick={handleCopy}
                    className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        copied 
                        ? 'bg-green-500 text-white' 
                        : 'bg-teal-500 text-white hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500'
                    }`}
                >
                    {copied ? 'Đã sao chép!' : 'Sao chép Prompt'}
                </button>
            </div>
        </div>
    );
};

export default PromptCard;