"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { signOut } from "@/lib/auth";
import {
  getQuestionsByEdition,
  deleteQuestion,
  countQuestionsByEdition,
  updateQuestionIsShow,
  deactivateAllQuestions,
  Question,
} from "@/lib/firestore";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/LoadingSpinner";

function DashboardContent() {
  const router = useRouter();
  const [selectedEdition, setSelectedEdition] = useState<string>("Sextou com Jogos");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);


  // const editions = ["Sextou com Jogos", "De frente com Frank", "The night com Miola"];

  const editions = [
    { name: "Sextou com Jogos", logoPath: "/Sextou_Com_Jogos.svg" },
    { name: "De frente com Frank", logoPath: "/De_Frente_Com_Frank.svg" },
    { name: "The night com Miola", logoPath: "/TheNightComMiola.svg" },
  ];
  
  const loadQuestions = async (edition: string) => {
    setLoading(true);
    try {
      const result = await getQuestionsByEdition(edition, 50);
      setQuestions(result.questions);
      
      const count = await countQuestionsByEdition(edition);
      setTotalCount(count);
    } catch (error) {
      console.error("Erro ao carregar perguntas:", error);
      toast.error("Erro ao carregar perguntas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions(selectedEdition);
  }, [selectedEdition]);

  const handleLogout = async () => {
    const result = await signOut();
    if (!result.error) {
      toast.success("Logout realizado com sucesso!");
      router.push("/");
    } else {
      toast.error("Erro ao fazer logout.");
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm("Tem certeza que deseja deletar esta pergunta?")) {
      return;
    }

    setDeletingId(questionId);

    try {
      const result = await deleteQuestion(questionId);

      if (result.success) {
        toast.success("Pergunta deletada com sucesso!");
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
        setTotalCount((prev) => prev - 1);
      } else {
        toast.error(`Erro ao deletar: ${result.error}`);
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao deletar pergunta.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleShow = async (questionId: string, currentIsShow: boolean) => {
    setActivatingId(questionId);

    try {
      // Se estiver ativando, desativar todas as outras primeiro
      if (!currentIsShow) {
        await deactivateAllQuestions();
      }

      const result = await updateQuestionIsShow(questionId, !currentIsShow);

      if (result.success) {
        toast.success(
          currentIsShow ? "Pergunta desativada!" : "Pergunta ativada!"
        );
        // Recarregar perguntas
        loadQuestions(selectedEdition);
      } else {
        toast.error(`Erro: ${result.error}`);
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao atualizar pergunta.");
    } finally {
      setActivatingId(null);
    }
  };


  
  const formatDate = (timestamp: any) => {
    try {
      const date = timestamp.toDate();
      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return "Data inválida";
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl md:text-4xl font-display">
            HACKA.ASK - Admin
          </h1>
          <button
            onClick={handleLogout}
            className="sketchy-border bg-white hover:bg-[rgb(230_230_230)] px-6 py-2 font-bold transition-colors"
          >
            Sair
          </button>
        </div>

        <hr className="sketchy-divider" />

        <div className="mb-8">
          <label className="block text-xl font-bold mb-4 uppercase">
            Filtrar por edição:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    className="w-full h-48 md:h-44 object-contain"
                  />
                </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 uppercase">
            Perguntas recebidas ({totalCount}):
          </h2>

          {loading ? (
            <div className="sketchy-box text-center py-12">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-lg">Carregando perguntas...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="sketchy-box text-center">
              <p className="text-lg text-[rgb(102_102_102)]">
                Nenhuma pergunta recebida ainda para esta edição.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="sketchy-box relative">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-base md:text-lg mb-2">{question.questionText}</p>
                      <p className="text-sm text-[rgb(102_102_102)]">
                        Enviada em: {formatDate(question.createdAt)}
                      </p>
                    </div>
                     <button
                        onClick={() =>
                          handleToggleShow(question.id, question.isShow || false)
                        }
                        disabled={activatingId === question.id}
                        className={`sketchy-border px-4 py-2 font-bold text-sm disabled:opacity-50 transition-colors ${
                          question.isShow
                            ? "bg-yellow-400 hover:bg-yellow-500"
                            : "bg-green-400 hover:bg-green-500"
                        }`}
                      >
                        {activatingId === question.id
                          ? "..."
                          : question.isShow
                          ? "Desativar"
                          : "Ativar"}
                      </button>
                    <button
                      onClick={() => handleDelete(question.id)}
                      disabled={deletingId === question.id}
                      className="sketchy-border bg-white hover:bg-red-50 px-4 py-2 font-bold text-sm disabled:opacity-50 transition-colors"
                    >
                      {deletingId === question.id ? "..." : "Deletar"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <hr className="sketchy-divider" />

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

export default function AdminDashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

