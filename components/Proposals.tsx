
import React, { useState, useEffect } from 'react';
import { Package, Calendar, FileText, MessageSquare, Wrench, Users, Hammer, Car, Lock, Waves, TrendingUp } from 'lucide-react';
import { Proposal } from '../types';
import { API_URL } from '../constants';
import HolographicCard from './ui/holographic-card';

const iconMap: Record<string, React.ReactNode> = {
  'Eventos': <Calendar className="w-8 h-8 text-blue-600" />,
  'Gestão': <FileText className="w-8 h-8 text-blue-600" />,
  'Pessoas': <MessageSquare className="w-8 h-8 text-blue-600" />,
  'Estrutura': <Wrench className="w-8 h-8 text-blue-600" />,
  'Segurança': <Lock className="w-8 h-8 text-blue-600" />,
  'Esportes': <TrendingUp className="w-8 h-8 text-blue-600" />,
  'default': <Package className="w-8 h-8 text-blue-600" />
};

const Proposals: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await fetch(`${API_URL}/api/proposals`);
        const data = await response.json();
        setProposals(data);
      } catch (err) {
        console.error('Error fetching proposals:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProposals();
  }, []);

  return (
    <section id="propostas" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-black text-blue-950 mb-4">Plano de Modernização AESJ</h2>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto">
            Pilares fundamentais para transformar o Clube de Campo Santa Rita em um ambiente de excelência.
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-gray-100 rounded-[3.5rem] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {proposals.map((proposal, index) => (
              <HolographicCard 
                key={proposal.id}
                className="group"
              >
                <div className="p-10 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-8 transition-transform group-hover:scale-[1.02]">
                    <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl w-fit shadow-md border border-white/10">
                      {/* Using a white version of the icons for dark backgrounds */}
                      {React.cloneElement(iconMap[proposal.category] as React.ReactElement, { className: "w-8 h-8 text-blue-400" })}
                    </div>
                    <div className="flex flex-col items-end gap-2 text-right">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        proposal.status === 'Concluído' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        proposal.status === 'Executando' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      }`}>
                        {proposal.status}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {proposal.category}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-black text-white mb-4 flex items-center gap-4">
                    <span className="text-blue-500/30 text-5xl font-black leading-none">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    {proposal.title}
                  </h3>

                  <p className="text-gray-300 leading-relaxed mb-8 text-lg font-medium flex-1">
                    {proposal.description}
                  </p>

                  {(proposal.goal || proposal.eta) && (
                    <div className="space-y-6 pt-8 border-t border-white/10">
                      {proposal.goal && (
                        <div>
                          <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">🎯 Objetivo</h4>
                          <p className="text-sm text-gray-400">{proposal.goal}</p>
                        </div>
                      )}
                      {proposal.eta && (
                        <div className="flex justify-between items-end">
                          <div>
                            <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">⏳ Prazo Estimado</h4>
                            <p className="text-sm text-gray-300 font-bold">{proposal.eta}</p>
                          </div>
                          <button className="text-blue-400 font-black text-xs uppercase tracking-widest hover:text-white transition-all">
                            Ver Detalhes +
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </HolographicCard>
            ))}
          </div>
        )}

        <div className="mt-20 p-12 bg-blue-900 rounded-[3rem] text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-700/30 rounded-full -mr-32 -mt-32 blur-3xl" />
          <h3 className="text-3xl font-bold mb-6">Transparência e Diálogo</h3>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            "Não prometemos o impossível, mas garantimos que cada centavo do sócio será aplicado onde ele mais precisa: no conforto, no esporte e no lazer de sua família."
          </p>
          <p className="mt-8 font-bold text-xl">— Sebastião Claudio Blanch (Kako)</p>
        </div>
      </div>
    </section>
  );
};

export default Proposals;
