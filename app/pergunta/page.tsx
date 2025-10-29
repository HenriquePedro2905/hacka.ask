"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { addQuestion, checkRateLimit } from "@/lib/firestore";
import LoadingSpinner from "@/components/LoadingSpinner";

function PerguntaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedEdition, setSelectedEdition] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const editions = [
    { name: "Sextou com Jogos", logoPath: "/Sextou_Com_Jogos.svg" },
    { name: "De frente com Frank", logoPath: "/De_Frente_Com_Frank.svg" },
    { name: "The night com Miola", logoPath: "/TheNightComMiola.svg" },
  ];

  useEffect(() => {
    const edicao = searchParams.get("edicao");
    if (edicao) {
      setSelectedEdition(decodeURIComponent(edicao));
    } else {
      // Se não houver edição, redirecionar para home
      router.push("/");
    }
  }, [searchParams, router]);

  const selectedEditionData = editions.find((e) => e.name === selectedEdition);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEdition || !question.trim()) {
      toast.error("Por favor, escreva sua pergunta.");
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

  const handleBack = () => {
    router.push("/");
  };

  if (!selectedEdition) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="sketchy-border bg-white hover:bg-gray-100 px-4 py-2 font-bold text-sm transition-colors"
          >
            ← Voltar
          </button>
          <h1 className="text-3xl md:text-4xl font-display">
            HACKA.ASK
          </h1>
          <div className="w-20"></div> {/* Spacer para centralizar o título */}
        </div>

        <hr className="sketchy-divider mb-8" />

        {/* Edição selecionada */}
        <div className="mb-6 flex flex-col items-center">
          <p className="text-center text-base font-bold mb-2 uppercase">
            Enviando pergunta para:
          </p>
          {selectedEditionData && (
            <div className="flex justify-center w-full">
              <Image
                src={selectedEditionData.logoPath}
                alt={selectedEdition}
                width={200}
                height={80}
                className="max-w-[200px] h-auto object-contain"
              />
            </div>
          )}
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xl font-bold mb-4 uppercase">
              Sua pergunta anônima:
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Digite sua pergunta anônima aqui..."
              rows={8}
              disabled={loading}
              autoFocus
              className="w-full sketchy-border p-4 bg-[rgb(242_242_242)] text-black resize-none focus:outline-none focus:shadow-[6px_6px_0px_rgb(0_0_0)] transition-shadow disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={!question.trim() || loading}
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

        <hr className="sketchy-divider mt-8" />

        <div className="text-center text-sm text-[rgb(102_102_102)] mt-8 space-y-2">
          <p>Sistema de Perguntas Anônimas - Hacka.Ask</p>
          <p className="text-xs">
            Desenvolvido por{' '}
            <a 
              href="https://www.instagram.com/7_pedrohe/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Pedro Henrique
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PerguntaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <PerguntaContent />
    </Suspense>
  );
}

