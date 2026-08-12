import React from 'react';
import { ThemeId } from '../types';

interface ThemeBackgroundDecorationProps {
  currentTheme: ThemeId;
}

interface FloatingIconSpec {
  symbol: string;
  className: string;
  style: React.CSSProperties;
}

export const ThemeBackgroundDecoration: React.FC<ThemeBackgroundDecorationProps> = ({ currentTheme }) => {
  const getThemeIcons = (): FloatingIconSpec[] => {
    switch (currentTheme) {
      case 'orange':
        return [
          { symbol: '🍊', className: 'top-[8%] left-1 sm:left-4 md:left-6 xl:left-10 text-4xl sm:text-6xl xl:text-7xl animate-float-1', style: { animationDelay: '0s' } },
          { symbol: '🍃', className: 'top-[38%] left-2 sm:left-5 md:left-8 xl:left-12 text-3xl sm:text-5xl xl:text-6xl animate-float-3', style: { animationDelay: '2s' } },
          { symbol: '🍊', className: 'top-[68%] left-1 sm:left-4 md:left-6 xl:left-10 text-4xl sm:text-6xl xl:text-7xl animate-float-2', style: { animationDelay: '1s' } },
          
          { symbol: '🍊', className: 'top-[12%] right-1 sm:right-4 md:right-6 xl:right-10 text-5xl sm:text-7xl xl:text-8xl animate-float-2', style: { animationDelay: '1s' } },
          { symbol: '🌟', className: 'top-[42%] right-2 sm:right-5 md:right-8 xl:right-12 text-3xl sm:text-5xl xl:text-6xl animate-float-4', style: { animationDelay: '1.5s' } },
          { symbol: '🍃', className: 'top-[72%] right-1 sm:right-4 md:right-6 xl:right-10 text-4xl sm:text-6xl xl:text-7xl animate-float-1', style: { animationDelay: '0.5s' } },
        ];
      case 'kiwi':
        return [
          { symbol: '🥝', className: 'top-[8%] left-1 sm:left-4 md:left-6 xl:left-10 text-4xl sm:text-6xl xl:text-7xl animate-float-1', style: { animationDelay: '0s' } },
          { symbol: '🌿', className: 'top-[38%] left-2 sm:left-5 md:left-8 xl:left-12 text-3xl sm:text-5xl xl:text-6xl animate-float-3', style: { animationDelay: '1.2s' } },
          { symbol: '🥝', className: 'top-[68%] left-1 sm:left-4 md:left-6 xl:left-10 text-4xl sm:text-6xl xl:text-7xl animate-float-2', style: { animationDelay: '0.8s' } },
          
          { symbol: '🥝', className: 'top-[12%] right-1 sm:right-4 md:right-6 xl:right-10 text-5xl sm:text-7xl xl:text-8xl animate-float-2', style: { animationDelay: '1.5s' } },
          { symbol: '🌱', className: 'top-[42%] right-2 sm:right-5 md:right-8 xl:right-12 text-3xl sm:text-5xl xl:text-6xl animate-float-4', style: { animationDelay: '2s' } },
          { symbol: '🥝', className: 'top-[72%] right-1 sm:right-4 md:right-6 xl:right-10 text-4xl sm:text-6xl xl:text-7xl animate-float-1', style: { animationDelay: '0.3s' } },
        ];
      case 'panda':
        return [
          { symbol: '🐼', className: 'top-[8%] left-1 sm:left-4 md:left-6 xl:left-10 text-4xl sm:text-6xl xl:text-7xl animate-float-1', style: { animationDelay: '0s' } },
          { symbol: '🐾', className: 'top-[38%] left-2 sm:left-5 md:left-8 xl:left-12 text-3xl sm:text-5xl xl:text-6xl animate-float-3', style: { animationDelay: '1s' } },
          { symbol: '🎋', className: 'top-[68%] left-1 sm:left-4 md:left-6 xl:left-10 text-4xl sm:text-6xl xl:text-7xl animate-float-2', style: { animationDelay: '2s' } },
          
          { symbol: '🐼', className: 'top-[12%] right-1 sm:right-4 md:right-6 xl:right-10 text-5xl sm:text-7xl xl:text-8xl animate-float-2', style: { animationDelay: '1.2s' } },
          { symbol: '🎋', className: 'top-[42%] right-2 sm:right-5 md:right-8 xl:right-12 text-3xl sm:text-5xl xl:text-6xl animate-float-4', style: { animationDelay: '0.5s' } },
          { symbol: '🐾', className: 'top-[72%] right-1 sm:right-4 md:right-6 xl:right-10 text-4xl sm:text-6xl xl:text-7xl animate-float-1', style: { animationDelay: '1.8s' } },
        ];
      case 'flamingo':
        return [
          { symbol: '🦩', className: 'top-[8%] left-1 sm:left-4 md:left-6 xl:left-10 text-5xl sm:text-7xl xl:text-8xl animate-float-1', style: { animationDelay: '0s' } },
          { symbol: '💖', className: 'top-[38%] left-2 sm:left-5 md:left-8 xl:left-12 text-3xl sm:text-5xl xl:text-6xl animate-float-3', style: { animationDelay: '1s' } },
          { symbol: '🦩', className: 'top-[68%] left-1 sm:left-4 md:left-6 xl:left-10 text-4xl sm:text-6xl xl:text-7xl animate-float-2', style: { animationDelay: '2s' } },
          
          { symbol: '🌺', className: 'top-[12%] right-1 sm:right-4 md:right-6 xl:right-10 text-4xl sm:text-6xl xl:text-7xl animate-float-2', style: { animationDelay: '0.5s' } },
          { symbol: '🦩', className: 'top-[42%] right-2 sm:right-5 md:right-8 xl:right-12 text-5xl sm:text-7xl xl:text-8xl animate-float-4', style: { animationDelay: '1.7s' } },
          { symbol: '💖', className: 'top-[72%] right-1 sm:right-4 md:right-6 xl:right-10 text-3xl sm:text-5xl xl:text-6xl animate-float-1', style: { animationDelay: '1.2s' } },
        ];
      case 'jungle':
        return [
          { symbol: '🦕', className: 'top-[8%] left-1 sm:left-4 md:left-6 xl:left-10 text-5xl sm:text-7xl xl:text-8xl animate-float-1', style: { animationDelay: '0s' } },
          { symbol: '🌿', className: 'top-[38%] left-2 sm:left-5 md:left-8 xl:left-12 text-4xl sm:text-6xl xl:text-7xl animate-float-3', style: { animationDelay: '1s' } },
          { symbol: '🌴', className: 'top-[68%] left-1 sm:left-4 md:left-6 xl:left-10 text-4xl sm:text-6xl xl:text-7xl animate-float-2', style: { animationDelay: '2s' } },
          
          { symbol: '🦕', className: 'top-[12%] right-1 sm:right-4 md:right-6 xl:right-10 text-5xl sm:text-7xl xl:text-8xl animate-float-2', style: { animationDelay: '1.4s' } },
          { symbol: '🍃', className: 'top-[42%] right-2 sm:right-5 md:right-8 xl:right-12 text-3xl sm:text-5xl xl:text-6xl animate-float-4', style: { animationDelay: '0.4s' } },
          { symbol: '🌿', className: 'top-[72%] right-1 sm:right-4 md:right-6 xl:right-10 text-4xl sm:text-6xl xl:text-7xl animate-float-1', style: { animationDelay: '1.8s' } },
        ];
      case 'crimson':
        return [
          { symbol: '🦖', className: 'top-[8%] left-1 sm:left-4 md:left-6 xl:left-10 text-5xl sm:text-7xl xl:text-8xl animate-float-1', style: { animationDelay: '0s' } },
          { symbol: '🥩', className: 'top-[38%] left-2 sm:left-5 md:left-8 xl:left-12 text-3xl sm:text-5xl xl:text-6xl animate-float-3', style: { animationDelay: '1s' } },
          { symbol: '🌋', className: 'top-[68%] left-1 sm:left-4 md:left-6 xl:left-10 text-4xl sm:text-6xl xl:text-7xl animate-float-2', style: { animationDelay: '2s' } },
          
          { symbol: '🦖', className: 'top-[12%] right-1 sm:right-4 md:right-6 xl:right-10 text-5xl sm:text-7xl xl:text-8xl animate-float-2', style: { animationDelay: '1.1s' } },
          { symbol: '💥', className: 'top-[42%] right-2 sm:right-5 md:right-8 xl:right-12 text-3xl sm:text-5xl xl:text-6xl animate-float-4', style: { animationDelay: '0.6s' } },
          { symbol: '🥩', className: 'top-[72%] right-1 sm:right-4 md:right-6 xl:right-10 text-4xl sm:text-6xl xl:text-7xl animate-float-1', style: { animationDelay: '1.7s' } },
        ];
      case 'sky':
      default:
        return [
          { symbol: '🩵', className: 'top-[8%] left-1 sm:left-4 md:left-6 xl:left-10 text-4xl sm:text-6xl xl:text-7xl animate-float-1', style: { animationDelay: '0s' } },
          { symbol: '☁️', className: 'top-[38%] left-2 sm:left-5 md:left-8 xl:left-12 text-5xl sm:text-7xl xl:text-8xl animate-float-3', style: { animationDelay: '1s' } },
          { symbol: '✨', className: 'top-[68%] left-1 sm:left-4 md:left-6 xl:left-10 text-3xl sm:text-5xl xl:text-6xl animate-float-2', style: { animationDelay: '2s' } },
          
          { symbol: '☁️', className: 'top-[12%] right-1 sm:right-4 md:right-6 xl:right-10 text-5xl sm:text-7xl xl:text-8xl animate-float-2', style: { animationDelay: '1.3s' } },
          { symbol: '🩵', className: 'top-[42%] right-2 sm:right-5 md:right-8 xl:right-12 text-4xl sm:text-6xl xl:text-7xl animate-float-4', style: { animationDelay: '0.7s' } },
          { symbol: '✨', className: 'top-[72%] right-1 sm:right-4 md:right-6 xl:right-10 text-3xl sm:text-5xl xl:text-6xl animate-float-1', style: { animationDelay: '1.9s' } },
        ];
    }
  };

  const icons = getThemeIcons();

  return (
    <div 
      aria-hidden="true" 
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none transition-all duration-500 opacity-25 sm:opacity-35"
    >
      {/* Soft Ambient Radial Glow Backdrops on edges */}
      <div className="absolute top-0 -left-20 w-[350px] h-[350px] bg-gradient-to-br from-current to-transparent rounded-full blur-3xl opacity-15 transform -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-[400px] h-[400px] bg-gradient-to-tl from-current to-transparent rounded-full blur-3xl opacity-15 transform translate-y-1/3 pointer-events-none" />

      {/* Floating Dynamic Theme Watermark Characters - Pinned Strictly To Side Margins */}
      {icons.map((icon, idx) => (
        <div
          key={`${currentTheme}-${idx}`}
          className={`absolute transform filter drop-shadow-sm select-none pointer-events-none opacity-80 sm:opacity-90 ${icon.className}`}
          style={icon.style}
        >
          {icon.symbol}
        </div>
      ))}
    </div>
  );
};
