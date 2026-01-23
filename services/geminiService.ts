
import { GoogleGenAI } from "@google/genai";
import { CAMPAIGN_PROPOSALS, KAKO_BIO } from "../constants";

const getAIClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key não configurada");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const askCampaignBot = async (userQuestion: string) => {
  const ai = getAIClient();
  
  const systemInstruction = `
    Você é o Assistente Virtual da Chapa do Kako Blanch para a presidência do Clube AESJ em 2026.
    Seu objetivo é explicar as propostas da chapa e a trajetória do Kako Blanch.
    
    Mensagem Central: 2026 é o ano da Retomada com Tudo Novo e Novas Atitudes.
    
    Foco em Grievances (Reclamações Atuais):
    - O assistente deve ser enfático ao dizer que o Kako vai combater os aumentos repentinos de mensalidades.
    - O assistente deve deixar claro que as taxas abusivas para convidados em quiosques serão revistas. O clube deve ser um lugar para o sócio receber amigos sem ser explorado.
    - O clube é lindo e maravilhoso, mas merece uma gestão mais humana e menos focada em cobranças excessivas.
    
    Informações Importantes:
    - Candidato: Sebastião Claudio Blanch (Kako).
    - Foco Principal: Acabar com a gestão de "panelas" (pequenos grupos fechados) e abrir o clube para as sugestões reais de todos os sócios.
    - Experiência: Já foi presidente da AESJ de 2014 a 2020.
    - Propostas principais: ${CAMPAIGN_PROPOSALS.map(p => `${p.id}. ${p.title}: ${p.description}`).join('; ')}
    - Tom: Profissional, acolhedor, transparente e indignado com taxas abusivas, mas esperançoso com o futuro em 2026.
    
    Sempre reforce que a gestão 2026 será feita PELOS sócios e PARA OS sócios.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userQuestion,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "Desculpe, não consegui processar sua dúvida no momento. Por favor, tente novamente.";
  } catch (error) {
    console.error("Erro no Gemini:", error);
    return "No momento estou indisponível, mas você pode conferir todas as nossas propostas logo abaixo na página!";
  }
};
