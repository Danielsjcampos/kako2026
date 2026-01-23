
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cardData } from '../../lib/utils';
import { Sparkles, Target, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface CardProps {
    id: number;
    title: string;
    description: string;
    index: number;
    totalCards: number;
    color: string;
}

const Card: React.FC<CardProps> = ({ title, description, index, totalCards, color }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const card = cardRef.current;
        const container = containerRef.current;
        if (!card || !container) return;

        const targetScale = 1 - (totalCards - index) * 0.05;

        // Set initial state
        gsap.set(card, {
            scale: 1,
            transformOrigin: "center top"
        });

        // Create scroll trigger for stacking effect
        ScrollTrigger.create({
            trigger: container,
            start: "top center",
            end: "bottom center",
            scrub: 1,
            onUpdate: (self) => {
                const progress = self.progress;
                const scale = gsap.utils.interpolate(1, targetScale, progress);

                gsap.set(card, {
                    scale: Math.max(scale, targetScale),
                    transformOrigin: "center top"
                });
            }
        });

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, [index, totalCards]);

    return (
        <div
            ref={containerRef}
            style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'sticky',
                top: 0
            }}
            className="z-0"
        >
            <div
                ref={cardRef}
                style={{
                    position: 'relative',
                    width: '90%',
                    maxWidth: '800px',
                    height: '450px',
                    borderRadius: '48px',
                    isolation: 'isolate',
                    top: `calc(-5vh + ${index * 30}px)`,
                    transformOrigin: 'top'
                }}
            >
                {/* Electric Border Effect */}
                <div
                    style={{
                        position: 'absolute',
                        inset: '-3px',
                        borderRadius: '51px',
                        padding: '3px',
                        background: `conic-gradient(
                            from 0deg,
                            transparent 0deg,
                            ${color} 60deg,
                            ${color.replace('0.8', '0.6')} 120deg,
                            transparent 180deg,
                            ${color.replace('0.8', '0.4')} 240deg,
                            transparent 360deg
                        )`,
                        zIndex: -1
                    }}
                />

                {/* Main Card Content */}
                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '3rem',
                    borderRadius: '48px',
                    background: `
                        linear-gradient(145deg, 
                            rgba(255, 255, 255, 0.1), 
                            rgba(255, 255, 255, 0.05)
                        )
                    `,
                    backdropFilter: 'blur(30px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: `
                        0 20px 50px rgba(0, 0, 0, 0.5),
                        inset 0 1px 0 rgba(255, 255, 255, 0.3)
                    `,
                    overflow: 'hidden'
                }}>
                    <div className="relative z-10">
                        <div 
                          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8"
                          style={{ backgroundColor: color }}
                        >
                            <Sparkles className="text-white" size={32} />
                        </div>
                        <h3 className="text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight">
                            {title}
                        </h3>
                        <p className="text-xl lg:text-2xl text-red-100/70 font-medium leading-relaxed max-w-xl">
                            {description}
                        </p>
                        
                        <div className="mt-10 flex gap-4">
                            <span className="bg-white/10 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest text-white border border-white/10">
                                Proposta {index + 1}
                            </span>
                        </div>
                    </div>

                    {/* Enhanced Glass reflection overlay */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '60%',
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 60%)',
                        pointerEvents: 'none'
                    }} />
                </div>
            </div>
        </div>
    );
};

export const StackedCards: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        gsap.fromTo(container,
            { opacity: 0 },
            {
                opacity: 1,
                duration: 1.2,
                ease: "power2.out"
            }
        );
    }, []);

    return (
        <section ref={containerRef} className="bg-red-950 py-32 overflow-visible relative">
            {/* Background Grid */}
            <div className="absolute inset-0 z-0">
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `
                        linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '80px 80px',
                    maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
                  }}
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center mb-24">
                   <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest mb-6 border border-red-500/20">
                      <Zap size={16} /> Experiência de Navegação
                   </div>
                   <h2 className="text-5xl lg:text-7xl font-black text-white mb-8 tracking-tighter italic">
                       Nossas Propostas <br />
                       <span className="text-red-500 underline decoration-red-500/30 underline-offset-8">em Foco.</span>
                   </h2>
                   <p className="text-xl text-red-100/50 max-w-2xl mx-auto font-medium">
                       Role a tela para ver como cada pilar da nossa gestão se empilha para construir um clube melhor para todos.
                   </p>
                </div>

                <div className="relative">
                    {cardData.map((card, index) => (
                        <Card
                            key={card.id}
                            id={card.id}
                            title={card.title}
                            description={card.description}
                            index={index}
                            totalCards={cardData.length}
                            color={card.color}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
