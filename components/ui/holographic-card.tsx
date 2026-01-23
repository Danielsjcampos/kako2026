
import React, { useRef } from 'react';

interface HolographicCardProps {
  children: React.ReactNode;
  className?: string;
  background?: string;
}

const HolographicCard: React.FC<HolographicCardProps> = ({ 
  children, 
  className = "", 
  background = "linear-gradient(135deg, #1f2937 0%, #111827 100%)" // Modern Carbon Dark theme
}) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 15;
        const rotateY = (centerX - x) / 15;

        card.style.setProperty('--x', `${x}px`);
        card.style.setProperty('--y', `${y}px`);
        card.style.setProperty('--bg-x', `${(x / rect.width) * 100}%`);
        card.style.setProperty('--bg-y', `${(y / rect.height) * 100}%`);
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
        if (!cardRef.current) return;
        const card = cardRef.current;
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        card.style.setProperty('--x', `50%`);
        card.style.setProperty('--y', `50%`);
        card.style.setProperty('--bg-x', '50%');
        card.style.setProperty('--bg-y', '50%');
    };

    return (
        <div 
            className={`holographic-card relative overflow-hidden transition-transform duration-100 ease-out border border-white/10 ${className}`} 
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transformStyle: 'preserve-3d',
              background: background,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              borderRadius: '2.5rem',
            }}
        >
            <div className="relative z-10 h-full">
                {children}
            </div>
            <div 
              className="holo-glow"
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background: 'radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(59, 130, 246, 0.1) 0%, transparent 60%)',
                zIndex: 1
              }}
            ></div>
            {/* Holographic reflection effect */}
            <div 
              className="holo-flare"
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background: 'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)',
                backgroundPosition: 'var(--bg-x, 50%) var(--bg-y, 50%)',
                backgroundSize: '200% 200%',
                mixBlendMode: 'overlay',
                opacity: 0.5,
                zIndex: 2
              }}
            ></div>
        </div>
    );
};

export default HolographicCard;
