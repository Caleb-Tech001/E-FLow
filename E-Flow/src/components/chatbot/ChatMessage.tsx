import { cn } from "@/lib/utils";
import { stripMarkdown } from "@/lib/markdown-utils";
import { Message } from "@/hooks/useChatbot";
import { Bot, User } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Track which messages have already been animated globally
const animatedMessages = new Set<string>();

// Messages older than this threshold (in ms) are considered "old" and won't animate
const ANIMATION_TIME_THRESHOLD = 3000; // 3 seconds

interface ChatMessageProps {
  message: Message;
  isLatest?: boolean;
}

function useTypingAnimation(messageId: string, content: string, enabled: boolean, messageTimestamp: Date | string, speed: number = 12) {
  const alreadyAnimated = animatedMessages.has(messageId);
  // Safely get timestamp - ensure it's a valid Date
  const timestamp = messageTimestamp instanceof Date ? messageTimestamp : new Date(messageTimestamp);
  const timestampMs = isNaN(timestamp.getTime()) ? 0 : timestamp.getTime();
  const isOldMessage = Date.now() - timestampMs > ANIMATION_TIME_THRESHOLD;
  const shouldActuallyAnimate = enabled && !alreadyAnimated && !isOldMessage;
  
  const [displayedContent, setDisplayedContent] = useState(shouldActuallyAnimate ? "" : content);
  const [isTyping, setIsTyping] = useState(shouldActuallyAnimate);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!shouldActuallyAnimate) {
      setDisplayedContent(content);
      setIsTyping(false);
      if (!alreadyAnimated) {
        animatedMessages.add(messageId);
      }
      return;
    }

    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      animatedMessages.add(messageId);
    }

    setDisplayedContent("");
    setIsTyping(true);
    let index = 0;

    const interval = setInterval(() => {
      if (index < content.length) {
        setDisplayedContent(content.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [messageId, content, shouldActuallyAnimate, alreadyAnimated, speed]);

  return { displayedContent, isTyping };
}

// Parse and render content with clickable links
function RenderContent({ content, navigate }: { content: string; navigate: (path: string) => void }) {
  // Pattern to match markdown links [text](url) and plain URLs
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)|((https?:\/\/[^\s]+))/g;
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkPattern.exec(content)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }

    if (match[1] && match[2]) {
      // Markdown link [text](url)
      const text = match[1];
      const url = match[2];
      const isInternal = url.startsWith('/') || url.startsWith('#');
      
      parts.push(
        <a
          key={match.index}
          href={isInternal ? undefined : url}
          onClick={(e) => {
            if (isInternal) {
              e.preventDefault();
              navigate(url);
            }
          }}
          target={isInternal ? undefined : "_blank"}
          rel={isInternal ? undefined : "noopener noreferrer"}
          className="text-primary underline hover:text-primary/80 cursor-pointer"
        >
          {text}
        </a>
      );
    } else if (match[3]) {
      // Plain URL
      parts.push(
        <a
          key={match.index}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:text-primary/80"
        >
          {match[3]}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return <>{parts.length > 0 ? parts : content}</>;
}

export function ChatMessage({ message, isLatest = false }: ChatMessageProps) {
  const navigate = useNavigate();
  const isUser = message.role === "user";
  
  // Strip markdown from assistant messages for clean plain text
  const cleanContent = isUser ? message.content : stripMarkdown(message.content);
  
  // Only animate typing for the latest assistant message that hasn't been animated yet
  const shouldAnimate = !isUser && isLatest;
  const { displayedContent, isTyping } = useTypingAnimation(
    message.id, 
    cleanContent, 
    shouldAnimate,
    message.timestamp
  );

  return (
    <div className={cn("flex gap-3 p-4", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn(
        "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-sm",
        isUser 
          ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground" 
          : "bg-gradient-to-br from-muted to-muted/80"
      )}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className={cn(
        "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
        isUser 
          ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-md" 
          : "bg-card border rounded-tl-md"
      )}>
        <div className="whitespace-pre-wrap break-words leading-relaxed">
          {isUser ? displayedContent : <RenderContent content={displayedContent} navigate={navigate} />}
          {isTyping && <span className="inline-block w-0.5 h-4 bg-foreground/60 ml-0.5 animate-pulse" />}
        </div>
        <div className={cn(
          "text-[10px] mt-2 opacity-50",
          isUser ? "text-right" : "text-left"
        )}>
          {(() => {
            const ts = message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp);
            return isNaN(ts.getTime()) ? '' : ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          })()}
        </div>
      </div>
    </div>
  );
}
