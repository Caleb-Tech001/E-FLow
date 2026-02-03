import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Loader2, X, FileText, Mic, MicOff } from "lucide-react";
import { FileContext } from "@/hooks/useChatbot";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  onFileUpload: (file: FileContext) => void;
  fileContext: FileContext[];
  onRemoveFile: (fileName: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

// Check if Web Speech API is supported
const isSpeechRecognitionSupported = () => {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

export function ChatInput({ 
  onSend, 
  onFileUpload, 
  fileContext, 
  onRemoveFile, 
  isLoading, 
  disabled 
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!isSpeechRecognitionSupported()) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }

      // Only update with final transcripts - clean output without brackets
      if (finalTranscript) {
        setInput(prev => prev + finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        toast.error("Microphone access denied", { 
          description: "Please allow microphone access in your browser settings" 
        });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  const toggleListening = () => {
    if (!isSpeechRecognitionSupported()) {
      toast.error("Voice input not supported", { 
        description: "Your browser doesn't support speech recognition" 
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
      toast.success("Listening...", { description: "Speak now", duration: 1500 });
    }
  };

  const handleSend = () => {
    // Stop listening if active
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    
    const cleanedInput = input.trim();
    
    if (cleanedInput && !isLoading && !disabled) {
      onSend(cleanedInput);
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 1MB for text content)
    if (file.size > 1024 * 1024) {
      toast.error("File too large", { description: "Please upload files under 1MB" });
      return;
    }

    // Only allow text-based files
    const allowedTypes = [
      'text/plain', 'text/csv', 'text/markdown', 'application/json',
      'text/html', 'text/css', 'text/javascript', 'application/xml'
    ];
    
    const isTextFile = allowedTypes.includes(file.type) || 
      file.name.endsWith('.txt') || 
      file.name.endsWith('.csv') || 
      file.name.endsWith('.json') ||
      file.name.endsWith('.md');

    if (!isTextFile) {
      toast.error("Unsupported file type", { 
        description: "Please upload text, CSV, JSON, or Markdown files" 
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onFileUpload({
        name: file.name,
        content: content.slice(0, 50000), // Limit content size
        type: file.type || 'text/plain',
      });
      toast.success(`File "${file.name}" added to context`);
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="border-t bg-background/80 backdrop-blur-sm p-4 space-y-3">
      {/* Attached files */}
      {fileContext.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {fileContext.map((file) => (
            <div 
              key={file.name}
              className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1.5 text-xs"
            >
              <FileText className="w-3 h-3 text-muted-foreground" />
              <span className="max-w-[120px] truncate">{file.name}</span>
              <button 
                onClick={() => onRemoveFile(file.name)}
                className="ml-1 hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 items-end">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 h-10 w-10"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Paperclip className="w-5 h-5" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".txt,.csv,.json,.md,.xml,.html,.css,.js"
          onChange={handleFileChange}
        />

        {/* Voice input button */}
        <Button
          type="button"
          variant={isListening ? "default" : "ghost"}
          size="icon"
          className={cn(
            "shrink-0 h-10 w-10 transition-all",
            isListening && "bg-destructive hover:bg-destructive/90 animate-pulse"
          )}
          onClick={toggleListening}
          disabled={disabled || isLoading}
        >
          {isListening ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </Button>
        
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening..." : "Ask anything about EngageFlow..."}
          className={cn(
            "min-h-[44px] max-h-[120px] resize-none rounded-xl transition-all",
            isListening && "border-destructive/50 bg-destructive/5"
          )}
          disabled={isLoading || disabled}
          rows={1}
        />
        
        <Button
          type="button"
          size="icon"
          className="shrink-0 h-10 w-10 rounded-xl"
          onClick={handleSend}
          disabled={!input.trim() || isLoading || disabled}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
    </div>
  );
}

// Add type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}
