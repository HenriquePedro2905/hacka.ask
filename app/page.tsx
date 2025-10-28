"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { addQuestion, checkRateLimit } from "@/lib/firestore";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Home() {
  const router = useRouter();
  const [selectedEdition, setSelectedEdition] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [loading, setLoading] = useState(false);

const editions = [
    { name: "Sextou com Jogos", logoPath: "/Sextou_Com_Jogos.svg" },
    { name: "De frente com Frank", logoPath: "/De_Frente_Com_Frank.svg" },
    { name: "The night com Miola", logoPath: "/TheNightComMiola.svg" },
  ];

  // const editions = [
  //   "Sextou com Jogos",
  //   "De frente com Frank",
  //   "The night com Miola",
  // ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEdition || !question.trim()) {
      toast.error("Por favor, selecione uma edição e escreva sua pergunta.");
      return;
    }

    setLoading(true);

    try {
      // Verificar rate limit
      const rateLimitCheck = await checkRateLimit();
      
      if (!rateLimitCheck.allowed) {
        const minutes = Math.floor((rateLimitCheck.remainingTime || 0) / 60);
        const seconds = (rateLimitCheck.remainingTime || 0) % 60;
        toast.error(
          `Você precisa aguardar ${minutes}m ${seconds}s para enviar outra pergunta.`
        );
        setLoading(false);
        return;
      }

      // Enviar pergunta
      const result = await addQuestion(selectedEdition, question.trim());

      if (result.success) {
        toast.success("Pergunta enviada com sucesso!");
        router.push("/success");
      } else {
        toast.error(`Erro ao enviar pergunta: ${result.error}`);
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao enviar pergunta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl md:text-5xl text-center mb-8 font-display">
          HACKA.ASK
        </h1>
        <h2 className="text-2xl md:text-3xl text-center mb-12 font-display">
          Mande sua pergunta
        </h2>

        <hr className="sketchy-divider" />

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-xl font-bold mb-4 uppercase">
              Escolha a edição:
            </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* --- ALTERAÇÃO 2: Atualização do loop de renderização --- */}
              {editions.map((edition) => (
                <button
                  key={edition.name} // Chave agora é o nome
                  type="button"
                  onClick={() => setSelectedEdition(edition.name)} // Define o estado com o nome (string)
                  disabled={loading}
                  className={`
                    text-center
                    transition-all duration-200 disabled:opacity-50
                    ${
                      selectedEdition === edition.name
                        ? "bg-white text-black shadow-[6px_6px_0px_rgb(0_0_0)]" // <-- MUDANÇA AQUI
                        : "bg-white text-black"
                    }
                  `}
                  // Adicionado aria-label para acessibilidade, já que o botão não tem texto
                  aria-label={edition.name}
                >
                  {/* Renderiza o componente do logo */}
                 <img
                    src={edition.logoPath} // Use o caminho do logo aqui
                    alt={edition.name} // Importante para acessibilidade
                    className="w-full h-50 md:h-54 object-contain"
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xl font-bold mb-4 uppercase">
              Sua pergunta anônima:
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Digite sua pergunta anônima aqui..."
              rows={6}
              disabled={loading}
              className="w-full sketchy-border p-4 bg-[rgb(242_242_242)] text-black resize-none focus:outline-none focus:shadow-[6px_6px_0px_rgb(0_0_0)] transition-shadow disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={!selectedEdition || !question.trim() || loading}
            className="w-full text-xl md:text-2xl py-6 md:py-8 font-display sketchy-border bg-black text-white hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-[6px_6px_0px_rgb(0_0_0)] hover:shadow-[8px_8px_0px_rgb(0_0_0)] transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Enviando...
              </>
            ) : (
              "Enviar Pergunta"
            )}
          </button>
        </form>

        <hr className="sketchy-divider" />

        <div className="text-center mt-8 space-y-4">
          <div>
            <button
              onClick={() => router.push("/admin/login")}
              className="text-sm underline hover:no-underline"
            >
              Área de Admin
            </button>
          </div>
          <div className="text-xs text-gray-500">
            Desenvolvido por{' '}
            <a 
              href="https://www.instagram.com/7_pedrohe/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Pedro Henrique
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

