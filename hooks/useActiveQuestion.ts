import { useState, useEffect, useCallback, useRef } from 'react';
import { getActiveQuestion, Question } from '@/lib/firestore';

// Tempo em milissegundos entre as atualizações (10 segundos)
const POLLING_INTERVAL = 10 * 1000;
// Tempo de cache em milissegundos (10 segundos)
const CACHE_DURATION = 10 * 1000;

// Cache global para compartilhar entre instâncias do hook
let globalCache: {
  question: Question | null;
  lastFetch: number;
  subscribers: Set<(question: Question | null) => void>;
} = {
  question: null,
  lastFetch: 0,
  subscribers: new Set(),
};

// Função para buscar a pergunta ativa com cache
async function fetchWithCache(force = false): Promise<Question | null> {
  const now = Date.now();
  
  // Retornar do cache se disponível e dentro da duração do cache
  if (!force && globalCache.question && (now - globalCache.lastFetch < CACHE_DURATION)) {
    return globalCache.question;
  }

  try {
    const question = await getActiveQuestion();
    globalCache.question = question;
    globalCache.lastFetch = now;
    
    // Notificar todos os assinantes
    globalCache.subscribers.forEach(callback => callback(question));
    
    return question;
  } catch (error) {
    console.error('Erro ao buscar pergunta ativa:', error);
    throw error;
  }
}

export function useActiveQuestion() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  // Função para atualizar o estado local quando o cache for atualizado
  const updateQuestion = useCallback((newQuestion: Question | null) => {
    if (isMounted.current) {
      setQuestion(newQuestion);
      setLoading(false);
    }
  }, []);

  // Efeito para configurar o hook
  useEffect(() => {
    isMounted.current = true;
    
    // Adicionar ao conjunto de assinantes
    globalCache.subscribers.add(updateQuestion);
    
    // Buscar imediatamente se não tivermos dados em cache
    const fetchInitial = async () => {
      try {
        await fetchWithCache();
      } catch (err) {
        if (isMounted.current) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };
    
    fetchInitial();
    
    // Configurar polling
    const interval = setInterval(() => {
      fetchWithCache().catch(err => {
        if (isMounted.current) {
          setError(err);
        }
      });
    }, POLLING_INTERVAL);
    
    // Limpeza
    return () => {
      isMounted.current = false;
      globalCache.subscribers.delete(updateQuestion);
      clearInterval(interval);
    };
  }, [updateQuestion]);
  
  // Função para forçar atualização
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await fetchWithCache(true);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  return { question, loading, error, refresh };
}
