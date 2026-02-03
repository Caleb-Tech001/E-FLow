import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export type FileContext = {
  name: string;
  content: string;
  type: string;
};

export type ChatSession = {
  id: string;
  preview: string;
  messageCount: number;
  lastMessageAt: Date;
};

const ACTIVE_SESSION_KEY = "engageflow_active_session";
const DEVICE_ID_KEY = "engageflow_device_id";
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

// Get or create a unique device ID
function getDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

// Get or create active session ID
function getActiveSessionId(): string {
  let sessionId = localStorage.getItem(ACTIVE_SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(ACTIVE_SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function useChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [fileContext, setFileContext] = useState<FileContext[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState(getActiveSessionId);
  const [pastSessions, setPastSessions] = useState<ChatSession[]>([]);
  const deviceId = getDeviceId();

  // Load all sessions for this device
  const loadAllSessions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("session_id, content, role, created_at")
        .like("session_id", `${deviceId}_%`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load sessions:", error);
        return;
      }

      // Group by session
      const sessionMap = new Map<string, { messages: typeof data; lastAt: Date }>();
      data?.forEach(msg => {
        const existing = sessionMap.get(msg.session_id);
        const msgDate = new Date(msg.created_at);
        if (!existing) {
          sessionMap.set(msg.session_id, { messages: [msg], lastAt: msgDate });
        } else {
          existing.messages.push(msg);
          if (msgDate > existing.lastAt) existing.lastAt = msgDate;
        }
      });

      const sessions: ChatSession[] = [];
      sessionMap.forEach((value, key) => {
        const firstUserMsg = value.messages.find(m => m.role === "user");
        sessions.push({
          id: key,
          preview: firstUserMsg?.content.slice(0, 50) || "New conversation",
          messageCount: value.messages.length,
          lastMessageAt: value.lastAt,
        });
      });

      // Sort by most recent
      sessions.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
      setPastSessions(sessions);
    } catch (e) {
      console.error("Failed to load sessions:", e);
    }
  }, [deviceId]);

  // Load chat history for current session
  useEffect(() => {
    async function loadHistory() {
      // Use device-scoped session ID
      const fullSessionId = sessionId.startsWith(deviceId) ? sessionId : `${deviceId}_${sessionId}`;
      
      try {
        const { data: messagesData, error: messagesError } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("session_id", fullSessionId)
          .order("created_at", { ascending: true });

        if (messagesError) {
          console.error("Failed to load chat history:", messagesError);
        } else if (messagesData) {
          setMessages(messagesData.map((m) => {
            const parsedDate = new Date(m.created_at);
            return {
              id: m.id,
              role: m.role as "user" | "assistant",
              content: m.content,
              timestamp: isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
            };
          }));
        }

        const { data: filesData, error: filesError } = await supabase
          .from("chat_files")
          .select("*")
          .eq("session_id", fullSessionId);

        if (filesError) {
          console.error("Failed to load file context:", filesError);
        } else if (filesData) {
          setFileContext(filesData.map((f) => ({
            name: f.file_name,
            content: f.file_content,
            type: f.file_type,
          })));
        }
      } catch (e) {
        console.error("Failed to load chat data:", e);
      }
    }

    loadHistory();
    loadAllSessions();
  }, [sessionId, deviceId, loadAllSessions]);

  // Get full session ID
  const getFullSessionId = useCallback(() => {
    return sessionId.startsWith(deviceId) ? sessionId : `${deviceId}_${sessionId}`;
  }, [sessionId, deviceId]);

  // Save message to database
  const saveMessage = useCallback(async (message: Message) => {
    try {
      await supabase.from("chat_messages").insert({
        id: message.id,
        session_id: getFullSessionId(),
        role: message.role,
        content: message.content,
        created_at: message.timestamp.toISOString(),
      });
    } catch (e) {
      console.error("Failed to save message:", e);
    }
  }, [getFullSessionId]);

  const addFile = useCallback(async (file: FileContext) => {
    setFileContext(prev => {
      const updated = [...prev.filter(f => f.name !== file.name), file];
      return updated;
    });

    try {
      const fullSessionId = getFullSessionId();
      await supabase
        .from("chat_files")
        .delete()
        .eq("session_id", fullSessionId)
        .eq("file_name", file.name);

      await supabase.from("chat_files").insert({
        session_id: fullSessionId,
        file_name: file.name,
        file_content: file.content,
        file_type: file.type,
      });
    } catch (e) {
      console.error("Failed to save file:", e);
    }
  }, [getFullSessionId]);

  const removeFile = useCallback(async (fileName: string) => {
    setFileContext(prev => prev.filter(f => f.name !== fileName));

    try {
      await supabase
        .from("chat_files")
        .delete()
        .eq("session_id", getFullSessionId())
        .eq("file_name", fileName);
    } catch (e) {
      console.error("Failed to remove file:", e);
    }
  }, [getFullSessionId]);

  // Start a new chat session (preserves old ones)
  const startNewSession = useCallback(() => {
    const newSessionId = `${deviceId}_${crypto.randomUUID()}`;
    localStorage.setItem(ACTIVE_SESSION_KEY, newSessionId);
    setSessionId(newSessionId);
    setMessages([]);
    setFileContext([]);
  }, [deviceId]);

  // Switch to an existing session
  const switchToSession = useCallback(async (targetSessionId: string) => {
    localStorage.setItem(ACTIVE_SESSION_KEY, targetSessionId);
    setSessionId(targetSessionId);
  }, []);

  // Delete current session only
  const deleteCurrentSession = useCallback(async () => {
    try {
      const fullSessionId = getFullSessionId();
      await supabase.from("chat_messages").delete().eq("session_id", fullSessionId);
      await supabase.from("chat_files").delete().eq("session_id", fullSessionId);
      
      // Start a fresh session
      startNewSession();
      loadAllSessions();
    } catch (e) {
      console.error("Failed to delete session:", e);
    }
  }, [getFullSessionId, startNewSession, loadAllSessions]);

  const clearFiles = useCallback(async () => {
    setFileContext([]);

    try {
      await supabase
        .from("chat_files")
        .delete()
        .eq("session_id", getFullSessionId());
    } catch (e) {
      console.error("Failed to clear files:", e);
    }
  }, [getFullSessionId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    await saveMessage(userMessage);
    
    setIsLoading(true);
    setError(null);

    let assistantContent = "";
    let assistantMessageId = crypto.randomUUID();

    const upsertAssistant = (nextChunk: string) => {
      assistantContent += nextChunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last.id === assistantMessageId) {
          return prev.map((m, i) => 
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, {
          id: assistantMessageId,
          role: "assistant" as const,
          content: assistantContent,
          timestamp: new Date(),
        }];
      });
    };

    try {
      const allMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: allMessages,
          fileContext: fileContext,
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${resp.status}`);
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch { /* ignore */ }
        }
      }

      // Save the complete assistant message
      if (assistantContent) {
        await saveMessage({
          id: assistantMessageId,
          role: "assistant",
          content: assistantContent,
          timestamp: new Date(),
        });
        // Refresh sessions list
        loadAllSessions();
      }
    } catch (err) {
      console.error("Chat error:", err);
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  }, [messages, fileContext, saveMessage, loadAllSessions]);

  return {
    messages,
    fileContext,
    isLoading,
    error,
    sendMessage,
    addFile,
    removeFile,
    clearFiles,
    sessionId,
    pastSessions,
    startNewSession,
    switchToSession,
    deleteCurrentSession,
    loadAllSessions,
  };
}
