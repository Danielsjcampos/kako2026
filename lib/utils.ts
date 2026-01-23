
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const cardData = [
  {
    id: 1,
    title: "Eventos para o Sócio",
    description: "Priorizar eventos do clube voltados para o sócio (como, por exemplo, o carnaval).",
    color: "rgba(37, 99, 235, 0.8)"
  },
  {
    id: 2,
    title: "Transparência",
    description: "Publicação no site das reuniões da direção e resumo contábil mensal.",
    color: "rgba(5, 150, 105, 0.8)"
  },
  {
    id: 3,
    title: "Ouvidoria",
    description: "Diálogo permanente com os sócios e comissões para resolução ágil.",
    color: "rgba(217, 70, 239, 0.8)"
  },
  {
    id: 4,
    title: "Manutenção",
    description: "Plano de manutenção preventiva e corretiva permanente em todo o patrimônio.",
    color: "rgba(245, 158, 11, 0.8)"
  },
  {
    id: 5,
    title: "Colaboradores",
    description: "Reconhecimento e plano de carreira para quem faz o clube funcionar.",
    color: "rgba(30, 41, 59, 0.8)"
  }
];
