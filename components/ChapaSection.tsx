
import React, { useState, useEffect } from 'react';
import { Participant } from '../types';
import { User } from 'lucide-react';
import { API_URL } from '../constants';
import { supabase, T } from '../lib/supabaseClient';

const ChapaSection: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchParticipants = async () => {
        try {
          const { data, error } = await supabase
            .from(T.participants)
            .select('*')
            .order('display_order', { ascending: true });
          
          if (data) {
            const sorted = data.sort((a, b) => {
              const roleA = (a.role || '').toLowerCase();
              const roleB = (b.role || '').toLowerCase();
              const isPresA = roleA.includes('presidente') && !roleA.includes('vice');
              const isPresB = roleB.includes('presidente') && !roleB.includes('vice');
              if (isPresA && !isPresB) return -1;
              if (!isPresA && isPresB) return 1;
              return 0;
            });
            setParticipants(sorted);
          }
      } catch (err) {
        console.error('Error fetching participants:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchParticipants();
  }, []);

  return (
    <section id="chapa" className="py-24 bg-gray-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-200 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <span className="inline-block bg-red-100 text-red-700 font-black tracking-widest uppercase px-4 py-2 rounded-xl text-xs mb-6">
            NOSSO TIME DE 2026
          </span>
          <h2 className="text-4xl lg:text-6xl font-black text-red-950 mb-6 tracking-tighter">Quem está com o <span className="text-red-600">Kako Blanch</span></h2>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto font-medium">
            Uma chapa formada por sócios experientes, dinâmicos e comprometidos com a renovação e transparência da nossa AESJ.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[400px] bg-white rounded-[3rem] animate-pulse shadow-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {participants.map((member) => (
              <div key={member.id} className="bg-white rounded-[3.5rem] overflow-hidden shadow-2xl shadow-red-900/5 border border-white group hover:-translate-y-4 transition-all duration-700 flex flex-col">
                <div className="aspect-[4/5] overflow-hidden relative">
                  {member.photo ? (
                    <img 
                      src={member.photo.startsWith('http') ? member.photo : `${API_URL}${member.photo}`} 
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale group-hover:grayscale-0" 
                    />
                  ) : (
                    <div className="w-full h-full bg-red-50 flex items-center justify-center">
                      <User size={80} className="text-red-200" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-red-950/90 via-red-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute bottom-8 left-8 right-8 text-white">
                    <p className="text-sm font-black uppercase tracking-widest text-red-400 mb-2">{member.role}</p>
                    <h3 className="text-3xl font-black tracking-tight">{member.name}</h3>
                  </div>
                </div>
                <div className="p-10 flex-1 flex flex-col justify-center">
                  <p className="text-gray-600 leading-relaxed font-medium italic text-lg">
                    "{member.bio || 'Comprometido com a excelência e transparência na gestão da nossa AESJ para o triênio 2026-2028.'}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ChapaSection;
