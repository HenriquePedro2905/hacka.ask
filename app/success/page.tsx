"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkRateLimit } from "@/lib/firestore";

export default function Success() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLimit = async () => {
      const result = await checkRateLimit();
      if (result.allowed) {
        setCountdown(0);
      } else {
        setCountdown(result.remainingTime || 0);
      }
      setLoading(false);
    };

    checkLimit();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-bold">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl md:text-5xl text-center mb-8 font-display">
          HACKA.ASK
        </h1>

        <hr className="sketchy-divider" />

        <div className="sketchy-box text-center">
          <h2 className="text-3xl md:text-4xl mb-6 font-display text-black">
            Pergunta Enviada com Sucesso!
          </h2>
          <p className="text-lg md:text-xl mb-8">
            Obrigado por participar do Hackacast!
          </p>

          {countdown > 0 && (
            <div className="sketchy-border bg-[rgb(230_230_230)] p-6 mt-6">
              <p className="text-xl font-bold mb-2 uppercase">
                Aguarde para enviar novamente
              </p>
              <p className="text-4xl font-display text-black">
                {formatTime(countdown)}
              </p>
              <p className="text-sm mt-2 text-[rgb(102_102_102)]">
                Você poderá enviar uma nova pergunta em breve.
              </p>
            </div>
          )}
        </div>

        <hr className="sketchy-divider" />

        <button
          onClick={() => router.push("/")}
          disabled={countdown > 0}
          className="w-full text-xl md:text-2xl py-6 md:py-8 font-display sketchy-border bg-black text-white hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-[6px_6px_0px_rgb(0_0_0)] hover:shadow-[8px_8px_0px_rgb(0_0_0)] transition-all"
        >
          {countdown > 0 ? "Aguarde..." : "Enviar Nova Pergunta"}
        </button>

        <div className="text-center mt-8 space-y-4">
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

