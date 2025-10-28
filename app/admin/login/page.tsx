"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { signIn } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminLogin() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/admin/dashboard");
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn(email, password);

      if (result.user) {
        toast.success("Login realizado com sucesso!");
        router.push("/admin/dashboard");
      } else {
        toast.error(`Erro ao fazer login: ${result.error}`);
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl md:text-5xl text-center mb-4 font-display">
          HACKACAST
        </h1>
        <h2 className="text-2xl md:text-3xl text-center mb-12 font-display text-[rgb(102_102_102)]">
          Área Restrita
        </h2>

        <hr className="sketchy-divider" />

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-lg font-bold mb-2 uppercase">
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              disabled={loading}
              className="w-full sketchy-border p-4 bg-[rgb(242_242_242)] text-black focus:outline-none focus:shadow-[6px_6px_0px_rgb(0_0_0)] transition-shadow disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-lg font-bold mb-2 uppercase">
              Senha:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              disabled={loading}
              className="w-full sketchy-border p-4 bg-[rgb(242_242_242)] text-black focus:outline-none focus:shadow-[6px_6px_0px_rgb(0_0_0)] transition-shadow disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={!email || !password || loading}
            className="w-full text-xl md:text-2xl py-6 md:py-8 font-display sketchy-border bg-black text-white hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-[6px_6px_0px_rgb(0_0_0)] hover:shadow-[8px_8px_0px_rgb(0_0_0)] transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        <hr className="sketchy-divider" />

        <div className="text-center mt-6 space-y-4">
          <div>
            <button
              onClick={() => router.push("/")}
              className="text-sm underline hover:no-underline"
            >
              Voltar para página inicial
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

