import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  Timestamp,
  limit,
  startAfter,
  DocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import CryptoJS from "crypto-js";

export interface Question {
  id: string;
  edition: string;
  questionText: string;
  createdAt: Timestamp;
  ipHash: string;
  isShow?: boolean;
}

export interface RateLimit {
  id: string;
  lastSubmission: Timestamp;
  submissionCount: number;
}

// Hash do IP para anonimização
export const hashIP = (ip: string): string => {
  return CryptoJS.SHA256(ip).toString();
};

// Obter IP do cliente (simplificado - em produção usar API ou headers)
export const getClientIP = (): string => {
  // Em produção, você deve obter o IP real do servidor
  // Por enquanto, usamos um identificador único do navegador
  let clientId = localStorage.getItem("clientId");
  if (!clientId) {
    clientId = `client_${Date.now()}_${Math.random()}`;
    localStorage.setItem("clientId", clientId);
  }
  return clientId;
};

// Verificar rate limit
export const checkRateLimit = async (): Promise<{
  allowed: boolean;
  remainingTime?: number;
}> => {
  const ip = getClientIP();
  const ipHash = hashIP(ip);
  const rateLimitRef = doc(db, "rateLimits", ipHash);

  try {
    const rateLimitDoc = await getDoc(rateLimitRef);

    if (rateLimitDoc.exists()) {
      const data = rateLimitDoc.data() as RateLimit;
      const lastSubmission = data.lastSubmission.toDate();
      const now = new Date();
      const diffMinutes = (now.getTime() - lastSubmission.getTime()) / 1000 / 60;

      if (diffMinutes < 5) {
        const remainingTime = Math.ceil((5 - diffMinutes) * 60); // em segundos
        return { allowed: false, remainingTime };
      }
    }

    return { allowed: true };
  } catch (error) {
    console.error("Erro ao verificar rate limit:", error);
    return { allowed: true }; // Em caso de erro, permitir envio
  }
};

// Atualizar rate limit após envio
export const updateRateLimit = async (): Promise<void> => {
  const ip = getClientIP();
  const ipHash = hashIP(ip);
  const rateLimitRef = doc(db, "rateLimits", ipHash);

  try {
    await setDoc(rateLimitRef, {
      lastSubmission: Timestamp.now(),
      submissionCount: 1,
    });
  } catch (error) {
    console.error("Erro ao atualizar rate limit:", error);
  }
};

// Adicionar pergunta
export const addQuestion = async (
  edition: string,
  questionText: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const ip = getClientIP();
    const ipHash = hashIP(ip);

    await addDoc(collection(db, "questions"), {
      edition,
      questionText,
      createdAt: Timestamp.now(),
      ipHash,
      isShow: false,
    });

    await updateRateLimit();

    return { success: true };
  } catch (error: any) {
    console.error("Erro ao adicionar pergunta:", error);
    return { success: false, error: error.message };
  }
};

// Buscar perguntas por edição
export const getQuestionsByEdition = async (
  edition: string,
  pageSize: number = 10,
  lastDoc?: DocumentSnapshot
): Promise<{ questions: Question[]; lastDoc: DocumentSnapshot | null }> => {
  try {
    let q = query(
      collection(db, "questions"),
      where("edition", "==", edition),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const questions: Question[] = [];

    querySnapshot.forEach((doc) => {
      questions.push({
        id: doc.id,
        ...doc.data(),
      } as Question);
    });

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    return { questions, lastDoc: lastVisible };
  } catch (error) {
    console.error("Erro ao buscar perguntas:", error);
    return { questions: [], lastDoc: null };
  }
};

// Deletar pergunta
export const deleteQuestion = async (
  questionId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await deleteDoc(doc(db, "questions", questionId));
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao deletar pergunta:", error);
    return { success: false, error: error.message };
  }
};

// Contar perguntas por edição
export const countQuestionsByEdition = async (edition: string): Promise<number> => {
  try {
    const q = query(collection(db, "questions"), where("edition", "==", edition));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error("Erro ao contar perguntas:", error);
    return 0;
  }
};



// Buscar pergunta ativa (isShow: true)
export const getActiveQuestion = async (): Promise<Question | null> => {
  try {
    const q = query(
      collection(db, "questions"),
      where("isShow", "==", true),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Question;
  } catch (error) {
    console.error("Erro ao buscar pergunta ativa:", error);
    return null;
  }
};

// Atualizar isShow de uma pergunta
export const updateQuestionIsShow = async (
  questionId: string,
  isShow: boolean
): Promise<{ success: boolean; error?: string }> => {
  try {
    const questionRef = doc(db, "questions", questionId);
    await setDoc(questionRef, { isShow }, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao atualizar isShow:", error);
    return { success: false, error: error.message };
  }
};

// Desativar todas as perguntas (isShow: false)
export const deactivateAllQuestions = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const q = query(collection(db, "questions"), where("isShow", "==", true));
    const querySnapshot = await getDocs(q);

    const batch: Promise<void>[] = [];
    querySnapshot.forEach((docSnapshot) => {
      const questionRef = doc(db, "questions", docSnapshot.id);
      batch.push(setDoc(questionRef, { isShow: false }, { merge: true }));
    });

    await Promise.all(batch);
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao desativar todas as perguntas:", error);
    return { success: false, error: error.message };
  }
};

