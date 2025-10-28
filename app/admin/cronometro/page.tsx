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
import {
  initializeTimer,
  startTimer,
  pauseTimer,
  resetTimer,
  subscribeToTimer,
  calculateCurrentTime,
  formatTime as formatStopwatchTime, // Renomeado para evitar conflito
  TimerState,
} from "@/lib/timer";
import {
  initializeCountdownTimer,
  startCountdownTimer,
  pauseCountdownTimer,
  resetCountdownTimer,
  subscribeToCountdownTimer,
  calculateRemainingTime,
  updateDeadline,
  formatTime as formatCountdownTime, // Renomeado para evitar conflito
  CountdownTimerState,
} from "@/lib/countdownTimer";
import { useAuth } from "@/contexts/AuthContext";

function DashboardContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedEdition, setSelectedEdition] = useState<string>("Sextou com Jogos");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  // Estados do Cronômetro (Contagem Progressiva)
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [timerLoading, setTimerLoading] = useState(false);

  // Estados do Timer de Contagem Regressiva
  const [countdownState, setCountdownState] = useState<CountdownTimerState | null>(null);
  const [countdownTime, setCountdownTime] = useState(0);
  const [deadlineInput, setDeadlineInput] = useState<string>("");

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

  // Inicializar e subscrever ao cronômetro (Contagem Progressiva)
  useEffect(() => {
    initializeTimer();
    const unsubscribe = subscribeToTimer((state) => {
      setTimerState(state);
    });
    return () => unsubscribe();
  }, []);

  // Inicializar e subscrever ao Timer de Contagem Regressiva
  useEffect(() => {
    initializeCountdownTimer();
    const unsubscribe = subscribeToCountdownTimer((state) => {
      setCountdownState(state);
    });
    return () => unsubscribe();
  }, []);

  // Atualizar tempo do cronômetro (Contagem Progressiva)
  useEffect(() => {
    if (!timerState) return;
    const update = () => setCurrentTime(calculateCurrentTime(timerState));
    update();
    if (timerState.state === "running") {
      const interval = setInterval(update, 100);
      return () => clearInterval(interval);
    }
  }, [timerState]);

  // Atualizar tempo do Timer de Contagem Regressiva
  useEffect(() => {
    if (!countdownState) return;
    const update = () => setCountdownTime(calculateRemainingTime(countdownState));
    update();

    if (countdownState.deadlineAt && !deadlineInput) {
      const date = countdownState.deadlineAt.toDate();
      const formattedDate = format(date, "yyyy-MM-dd'T'HH:mm");
      setDeadlineInput(formattedDate);
    }

    if (countdownState.state !== "stopped" && countdownState.state !== "finished") {
      const interval = setInterval(update, 100);
      return () => clearInterval(interval);
    }
  }, [countdownState]);

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
    if (!confirm("Tem certeza que deseja deletar esta pergunta?")) return;
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
      if (!currentIsShow) {
        await deactivateAllQuestions();
      }
      const result = await updateQuestionIsShow(questionId, !currentIsShow);
      if (result.success) {
        toast.success(currentIsShow ? "Pergunta desativada!" : "Pergunta ativada!");
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

  // Funções do cronômetro (Contagem Progressiva)
  const handleStartTimer = async () => {
    if (!user?.uid) return;
    setTimerLoading(true);
    try {
      await startTimer(user.uid);
      toast.success("Cronômetro iniciado!");
    } catch (error) {
      console.error("Erro ao iniciar cronômetro:", error);
      toast.error("Erro ao iniciar cronômetro.");
    } finally {
      setTimerLoading(false);
    }
  };

  const handlePauseTimer = async () => {
    if (!user?.uid) return;
    setTimerLoading(true);
    try {
      await pauseTimer(user.uid);
      toast.success("Cronômetro pausado!");
    } catch (error) {
      console.error("Erro ao pausar cronômetro:", error);
      toast.error("Erro ao pausar cronômetro.");
    } finally {
      setTimerLoading(false);
    }
  };

  const handleResetTimer = async () => {
    if (!user?.uid) return;
    if (!confirm("Tem certeza que deseja zerar o cronômetro?")) return;
    setTimerLoading(true);
    try {
      await resetTimer(user.uid);
      toast.success("Cronômetro zerado!");
    } catch (error) {
      console.error("Erro ao zerar cronômetro:", error);
      toast.error("Erro ao zerar cronômetro.");
    } finally {
      setTimerLoading(false);
    }
  };

  // Funções do Timer de Contagem Regressiva
  const handleUpdateDeadline = async () => {
    if (!user?.uid || !deadlineInput) return;
    try {
      const deadlineDate = new Date(deadlineInput);
      if (isNaN(deadlineDate.getTime())) {
        toast.error("Data/Hora inválida.");
        return;
      }
      await updateDeadline(user.uid, deadlineDate);
      toast.success("Prazo de entrega atualizado!");
    } catch (error) {
      console.error("Erro ao atualizar prazo:", error);
      toast.error("Erro ao atualizar prazo.");
    }
  };

  const handleStartCountdown = async () => {
    if (!user?.uid) return;
    setTimerLoading(true);
    try {
      await startCountdownTimer(user.uid);
      toast.success("Contagem Regressiva iniciada!");
    } catch (error) {
      console.error("Erro ao iniciar timer:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao iniciar timer.");
    } finally {
      setTimerLoading(false);
    }
  };

  const handlePauseCountdown = async () => {
    if (!user?.uid) return;
    setTimerLoading(true);
    try {
      await pauseCountdownTimer(user.uid);
      toast.success("Contagem Regressiva pausada!");
    } catch (error) {
      console.error("Erro ao pausar timer:", error);
      toast.error("Erro ao pausar timer.");
    } finally {
      setTimerLoading(false);
    }
  };

  const handleResetCountdown = async () => {
    if (!user?.uid) return;
    if (!confirm("Tem certeza que deseja zerar o timer e remover o prazo?")) return;
    setTimerLoading(true);
    try {
      await resetCountdownTimer(user.uid);
      setDeadlineInput("");
      toast.success("Timer zerado e prazo removido!");
    } catch (error) {
      console.error("Erro ao zerar timer:", error);
      toast.error("Erro ao zerar timer.");
    } finally {
      setTimerLoading(false);
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
          <h1 className="text-3xl md:text-4xl font-display">HACKA.ASK - Admin</h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="sketchy-border bg-white hover:bg-[rgb(230_230_230)] px-6 py-2 font-bold transition-colors"
            >
              Dashboard-Admin
            </button>
            <button
              onClick={handleLogout}
              className="sketchy-border bg-white hover:bg-[rgb(230_230_230)] px-6 py-2 font-bold transition-colors"
            >
              Sair
            </button>
          </div>
        </div>

        <hr className="sketchy-divider" />

        {/* Seção do Cronômetro (Contagem Progressiva) */}
        <div className="mb-8 sketchy-box bg-[rgb(250_250_250)]">
          <h2 className="text-2xl font-bold mb-4 uppercase">Cronômetro Remoto (Contagem Progressiva)</h2>
          <div className="text-center mb-6">
            <div className="text-6xl md:text-8xl font-display mb-2">
              {formatStopwatchTime(currentTime)}
            </div>
            <div className="text-sm text-[rgb(102_102_102)]">
              Estado: <span className="font-bold uppercase">{timerState?.state || "carregando..."}</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={handleStartTimer}
              disabled={timerLoading || timerState?.state === "running"}
              className="sketchy-border bg-green-400 hover:bg-green-500 px-8 py-3 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {timerState?.state === "running" ? "Em Execução" : "Iniciar"}
            </button>
            <button
              onClick={handlePauseTimer}
              disabled={timerLoading || timerState?.state !== "running"}
              className="sketchy-border bg-yellow-400 hover:bg-yellow-500 px-8 py-3 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Pausar
            </button>
            <button
              onClick={handleResetTimer}
              disabled={timerLoading}
              className="sketchy-border bg-red-400 hover:bg-red-500 px-8 py-3 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Zerar
            </button>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-[rgb(102_102_102)] mb-2">Tela pública do cronômetro (Contagem Progressiva):</p>
            <a
              href="/cronometro"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block sketchy-border bg-white hover:bg-[rgb(230_230_230)] px-4 py-2 font-bold text-sm transition-colors"
            >
              Abrir Cronômetro →
            </a>
          </div>
        </div>

        <hr className="sketchy-divider" />

        {/* Seção do Timer (Contagem Regressiva) */}
        <div className="mb-8 sketchy-box bg-[rgb(250_250_250)]">
          <h2 className="text-2xl font-bold mb-4 uppercase">Timer de Contagem Regressiva</h2>
          <div className="mb-4">
            <label htmlFor="deadline" className="block text-sm font-medium text-[rgb(102_102_102)] mb-1">Data e Hora do Prazo Final</label>
            <div className="flex gap-2">
              <input
                id="deadline"
                type="datetime-local"
                value={deadlineInput}
                onChange={(e) => setDeadlineInput(e.target.value)}
                className="sketchy-border p-2 w-full"
              />
              <button
                onClick={handleUpdateDeadline}
                className="sketchy-border bg-blue-400 hover:bg-blue-500 px-4 py-2 font-bold transition-colors"
              >
                Salvar Prazo
              </button>
            </div>
          </div>
          <div className="text-center mb-6">
            <div className="text-sm text-[rgb(102_102_102)] mb-1">Prazo Final: {countdownState?.deadlineAt ? formatDate(countdownState.deadlineAt) : "Não definido"}</div>
            <div className="text-6xl md:text-8xl font-display mb-2">
              {formatCountdownTime(countdownTime)}
            </div>
            <div className="text-sm text-[rgb(102_102_102)]">
              Estado: <span className="font-bold uppercase">{countdownState?.state || "carregando..."}</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={handleStartCountdown}
              disabled={timerLoading || countdownState?.state === "running" || !countdownState?.deadlineAt}
              className="sketchy-border bg-green-400 hover:bg-green-500 px-8 py-3 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {countdownState?.state === "running" ? "Em Execução" : "Iniciar Timer"}
            </button>
            <button
              onClick={handleResetCountdown}
              disabled={timerLoading}
              className="sketchy-border bg-red-400 hover:bg-red-500 px-8 py-3 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Zerar Timer
            </button>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-[rgb(102_102_102)] mb-2">Tela pública do Timer de Contagem Regressiva:</p>
            <a
              href="/timer"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block sketchy-border bg-white hover:bg-[rgb(230_230_230)] px-4 py-2 font-bold text-sm transition-colors"
            >
              Abrir Timer →
            </a>
          </div>
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
