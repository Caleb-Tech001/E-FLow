import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, X, Trash2, Target, Minimize2, History, 
  ChevronRight, Plus, MessageCircle, Maximize2, Minimize 
} from "lucide-react";
import { useChatbot } from "@/hooks/useChatbot";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ChatExport } from "./ChatExport";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const {
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
  } = useChatbot();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleClearAll = () => {
    deleteCurrentSession();
    clearFiles();
    setShowHistory(false);
  };

  const handleNewChat = () => {
    startNewSession();
    setShowHistory(false);
  };

  const handleSelectSession = (targetSessionId: string) => {
    switchToSession(targetSessionId);
    setShowHistory(false);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl z-50 bg-gradient-to-br from-primary via-primary to-primary/80 hover:scale-105 transition-transform"
            size="icon"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Chat with EngageFlow AI</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end pointer-events-none sm:p-6">
      {/* Overlay for expanded mode */}
      {isExpanded && !isMinimized && (
        <div 
          className="absolute inset-0 bg-black/20 pointer-events-auto"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <Card className={cn(
        "relative shadow-2xl flex overflow-hidden transition-all duration-300 border pointer-events-auto",
        isMinimized 
          ? "w-80 h-14 rounded-lg" 
          : isExpanded
            ? "w-full h-full sm:w-[800px] sm:h-[700px] sm:max-h-[90vh] sm:rounded-lg rounded-none"
            : "w-full h-full sm:w-[480px] sm:h-[600px] sm:max-h-[85vh] sm:rounded-lg rounded-none"
      )}>
        {/* History Sidebar - Slide from left */}
        <div className={cn(
          "absolute left-0 top-0 bottom-0 z-10 bg-background border-r shadow-lg flex flex-col transition-transform duration-300 ease-in-out",
          isExpanded ? "w-[220px]" : "w-[200px]",
          !isMinimized && showHistory ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-3 border-b flex items-center justify-between bg-muted/30">
            <span className="text-sm font-medium">Chat History</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={() => setShowHistory(false)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {pastSessions.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No past conversations</p>
              ) : (
                pastSessions.map((session) => (
                  <div 
                    key={session.id}
                    onClick={() => handleSelectSession(session.id)}
                    className={cn(
                      "p-2.5 rounded-lg cursor-pointer transition-colors",
                      session.id === sessionId 
                        ? "bg-primary/10 border border-primary/20" 
                        : "bg-muted/50 hover:bg-muted"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <MessageCircle className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{session.preview}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-muted-foreground">
                            {session.messageCount} msgs
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(session.lastMessageAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          <div className="p-2 border-t bg-muted/30">
            <Button 
              variant="default" 
              size="sm" 
              className="w-full text-xs"
              onClick={handleNewChat}
            >
              <Plus className="w-3 h-3 mr-1" />
              New Chat
            </Button>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
            <div className="flex items-center gap-3">
              {!isMinimized && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => setShowHistory(!showHistory)}
                    >
                      <History className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Chat history</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center shadow-sm">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">EngageFlow AI</h3>
                {!isMinimized && (
                  <p className="text-xs text-muted-foreground">
                    {isLoading ? "Thinking..." : "Your GTM assistant"}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {!isMinimized && (
                <>
                  <ChatExport messages={messages} />
                  <AlertDialog>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Delete chat</p>
                      </TooltipContent>
                    </Tooltip>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will delete all messages in the current chat. Your other conversations will be preserved.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearAll}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  {/* Expand/Collapse button - desktop only */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 hidden sm:flex"
                        onClick={() => setIsExpanded(!isExpanded)}
                      >
                        {isExpanded ? (
                          <Minimize className="h-4 w-4" />
                        ) : (
                          <Maximize2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{isExpanded ? "Collapse" : "Expand"}</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setIsMinimized(!isMinimized)}
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{isMinimized ? "Expand" : "Minimize"}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Close</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground">
                    <div className="w-16 h-16 rounded-full bg-black/10 flex items-center justify-center mb-4">
                      <Target className="w-8 h-8 text-foreground/60" />
                    </div>
                    <p className="font-semibold text-foreground">Welcome to EngageFlow AI!</p>
                    <p className="text-sm mt-2 max-w-[280px]">
                      I can help you navigate the platform, explain features, or answer questions about your segments.
                    </p>
                    <div className="mt-6 space-y-2 w-full max-w-[280px]">
                      <p 
                        className="bg-muted hover:bg-muted/80 px-4 py-3 rounded-xl cursor-pointer transition-colors text-sm text-left"
                        onClick={() => sendMessage("Analyze high-engagement users in my data")}
                      >
                        🎯 Analyze high-engagement users
                      </p>
                      <p 
                        className="bg-muted hover:bg-muted/80 px-4 py-3 rounded-xl cursor-pointer transition-colors text-sm text-left"
                        onClick={() => sendMessage("Generate a nurture email for Segment 1")}
                      >
                        ✉️ Generate nurture email for Segment 1
                      </p>
                      <p 
                        className="bg-muted hover:bg-muted/80 px-4 py-3 rounded-xl cursor-pointer transition-colors text-sm text-left"
                        onClick={() => sendMessage("How do I compare different analysis runs?")}
                      >
                        📊 Compare analysis runs
                      </p>
                      <p 
                        className="bg-muted hover:bg-muted/80 px-4 py-3 rounded-xl cursor-pointer transition-colors text-sm text-left"
                        onClick={() => sendMessage("What GTM actions should I take for my top segment?")}
                      >
                        🚀 Get GTM action recommendations
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-2">
                    {messages.map((message, index) => (
                      <ChatMessage 
                        key={message.id} 
                        message={message} 
                        isLatest={index === messages.length - 1 && message.role === "assistant"}
                      />
                    ))}
                    {isLoading && messages[messages.length - 1]?.role === "user" && (
                      <div className="flex gap-3 p-4">
                        <div className="w-9 h-9 rounded-full bg-black/80 flex items-center justify-center shadow-sm">
                          <Target className="w-4 h-4 text-white animate-pulse" />
                        </div>
                        <div className="bg-card border rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                          <div className="flex gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Error display */}
              {error && (
                <div className="px-4 py-2 bg-destructive/10 text-destructive text-xs border-t">
                  {error}
                </div>
              )}

              {/* Input */}
              <ChatInput
                onSend={sendMessage}
                onFileUpload={addFile}
                fileContext={fileContext}
                onRemoveFile={removeFile}
                isLoading={isLoading}
              />
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
