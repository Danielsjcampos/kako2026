import { ArrowRightIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CallToAction() {
  return (
    <div className="relative mx-auto flex w-full max-w-3xl flex-col justify-between gap-y-6 border-y border-red-200 bg-[radial-gradient(35%_80%_at_25%_0%,theme(colors.red.100),transparent)] px-4 py-16 my-24">
      <PlusIcon
        className="absolute top-[-12.5px] left-[-11.5px] z-10 size-6 text-red-500"
        strokeWidth={1}
      />
      <PlusIcon
        className="absolute top-[-12.5px] right-[-11.5px] z-10 size-6 text-red-500"
        strokeWidth={1}
      />
      <PlusIcon
        className="absolute bottom-[-12.5px] left-[-11.5px] z-10 size-6 text-red-500"
        strokeWidth={1}
      />
      <PlusIcon
        className="absolute right-[-11.5px] bottom-[-12.5px] z-10 size-6 text-red-500"
        strokeWidth={1}
      />

      <div className="-inset-y-6 pointer-events-none absolute left-0 w-px border-l border-red-200" />
      <div className="-inset-y-6 pointer-events-none absolute right-0 w-px border-r border-red-200" />

      <div className="-z-10 absolute top-0 left-1/2 h-full border-l border-dashed border-red-200" />


      <div className="space-y-4 relative z-10">
        <h2 className="text-center font-black text-3xl md:text-5xl text-red-950 uppercase tracking-tighter">
          A Família Vermelhinha apoia a chapa <span className="text-red-600">AESJ PARA OS SÓCIOS</span>
        </h2>
        <p className="text-center text-xl font-bold text-red-800 tracking-widest uppercase">
          Transparência e Diálogo!
        </p>
      </div>

      <div className="flex items-center justify-center gap-4 pt-4 relative z-10">
        <Button 
            size="lg" 
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-full px-8 shadow-xl hover:scale-105 transition-all duration-300"
            onClick={() => {
                const element = document.getElementById('apoiar');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }}
        >
          QUERO APOIAR <ArrowRightIcon className="size-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
