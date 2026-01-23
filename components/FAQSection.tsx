
import React from 'react';
import { FAQ_ITEMS } from '../constants';
import { HelpCircle, ChevronDown } from 'lucide-react';

interface FAQSectionProps {
  settings: Record<string, string>;
}

const FAQSection: React.FC<FAQSectionProps> = ({ settings }) => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          {settings.site_logo ? (
            <img 
              src={`http://localhost:3001${settings.site_logo}`} 
              alt="Logo AESJ" 
              className="h-16 md:h-20 w-auto object-contain mx-auto mb-6 opacity-80"
            />
          ) : (
            <HelpCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          )}
          <h2 className="text-3xl lg:text-5xl font-black text-blue-950 mb-4">Dúvidas Frequentes</h2>
          <p className="text-xl text-gray-500">Esclarecemos os principais pontos da nossa visão para a AESJ.</p>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, index) => (
            <div 
              key={index} 
              className="border border-gray-100 rounded-3xl overflow-hidden bg-gray-50 hover:border-blue-200 transition-colors"
            >
              <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-8 py-6 text-left flex justify-between items-center bg-white hover:bg-gray-50 transition-all"
              >
                <span className="text-lg font-bold text-blue-950">{item.question}</span>
                <ChevronDown 
                  className={`text-blue-600 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} 
                  size={24} 
                />
              </button>
              {openIndex === index && (
                <div className="px-8 py-6 text-gray-600 leading-relaxed border-t border-gray-50">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
