import React, { useState, useEffect, useRef } from 'react';
import { Experience } from './components/Experience';
import { TreeState } from './types';

// Kevin MacLeod's Jingle Bells (Instrumental) - Reliable public domain source
const MUSIC_URL = "https://upload.wikimedia.org/wikipedia/commons/e/e9/Jingle_Bells_%28Kevin_MacLeod%29_%28ISRC_USUAN1100187%29.mp3";

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.SCATTERED);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize Audio
    const audio = new Audio(MUSIC_URL);
    audio.loop = true;
    audio.volume = 0.4; // Subtle background volume
    audioRef.current = audio;

    // Intro sequence: Wait 1.5s, then assemble tree
    const timer = setTimeout(() => {
        setTreeState(TreeState.TREE_SHAPE);
    }, 1500);

    return () => {
        audio.pause();
        audioRef.current = null;
        clearTimeout(timer);
    };
  }, []);

  const toggleState = () => {
    // UX Improvement: Try to start music on the first main interaction if it's not playing
    if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
    }

    setTreeState(prev => prev === TreeState.SCATTERED ? TreeState.TREE_SHAPE : TreeState.SCATTERED);
  };

  return (
    <div className="relative w-full h-screen bg-black">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Experience treeState={treeState} />
      </div>

      {/* UI Overlay Layer */}
      <main className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6 md:p-12">
        
        {/* Header */}
        <header className="flex justify-center items-start pt-8 md:pt-16 animate-[fadeIn_2s_ease-out]">
            <div className="text-center group">
                <h2 className="text-emerald-100/90 text-xl md:text-3xl font-serif font-bold mb-3 tracking-[0.2em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase">
                    Merry Christmas
                </h2>
                <div className="gold-text-gradient text-5xl md:text-7xl font-serif font-bold tracking-widest filter drop-shadow-[0_0_15px_rgba(255,215,0,0.4)] transform group-hover:scale-105 transition-transform duration-700">
                    zsh & lqq
                </div>
            </div>
        </header>

        {/* Empty spacer to push footer down */}
        <div className="flex-1"></div>

        {/* Footer / Controls */}
        <footer className="flex flex-col md:flex-row items-center justify-between gap-4 pointer-events-auto pb-4 md:pb-8">
            <div className="flex gap-4">
                <button 
                    onClick={toggleState}
                    className="group relative px-10 py-4 bg-gradient-to-r from-emerald-950/80 to-black/80 border border-emerald-600/40 rounded-sm transition-all duration-500 hover:border-emerald-400/80 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] overflow-hidden"
                >
                    <span className="relative z-10 text-emerald-50 font-serif tracking-[0.2em] text-sm md:text-lg group-hover:text-white transition-colors">
                        {treeState === TreeState.TREE_SHAPE ? '星光散落' : '点亮祝福'}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                </button>
            </div>
        </footer>
      </main>
    </div>
  );
};

export default App;