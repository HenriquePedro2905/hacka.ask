"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  const editions = [
    { name: "Sextou com Jogos", logoPath: "/Sextou_Com_Jogos.svg", slug: "sextou-com-jogos" },
    { name: "De frente com Frank", logoPath: "/De_Frente_Com_Frank.svg", slug: "de-frente-com-frank" },
    { name: "The night com Miola", logoPath: "/TheNightComMiola.svg", slug: "the-night-com-miola" },
  ];

  const handleEditionSelect = (editionName: string) => {
    // Navegar para a página de pergunta com a edição selecionada
    router.push(`/pergunta?edicao=${encodeURIComponent(editionName)}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start sm:justify-center p-2 sm:p-4 overflow-x-hidden">
      <div className="w-full max-w-4xl px-2 sm:px-4">
        <div className="mt-4 sm:mt-0 mb-2 sm:mb-4">
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-center font-display">
            HACKA.ASK
          </h1>
          <h2 className="text-sm sm:text-xl md:text-2xl text-center font-display mt-2 sm:mt-4">
            Escolha a edição para enviar sua pergunta
          </h2>
        </div>

        <hr className="sketchy-divider my-4 sm:my-6 md:my-8" />

        {/* Grid de edições */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
          {editions.map((edition) => (
            <button
              key={edition.name}
              onClick={() => handleEditionSelect(edition.name)}
              className="sketchy-border bg-white hover:bg-black transition-all duration-300 p-2 sm:p-4 md:p-6 aspect-square flex items-center justify-center group w-full max-w-[280px] mx-auto"
            >
              <Image
                src={edition.logoPath}
                alt={edition.name}
                width={200}
                height={200}
                className="w-full h-full max-w-[75%] max-h-[75%] object-contain group-hover:invert transition-all duration-300"
                priority
              />
            </button>
          ))}
        </div>

        <hr className="sketchy-divider mt-8 sm:mt-10 md:mt-12" />

        <div className="text-center mt-6 sm:mt-8 mb-4 sm:mb-6 space-y-2 sm:space-y-3">
          <p className="text-xs sm:text-sm text-gray-600">Selecione uma edição acima para continuar</p>
          <p className="text-xs text-gray-500">Sistema de Perguntas Anônimas - Hacka.Ask</p>
          <p className="text-xs text-gray-500">
            Desenvolvido por{' '}
            <a 
              href="https://www.instagram.com/7_pedrohe/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-black hover:underline transition-colors duration-200"
            >
              Pedro Henrique
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

