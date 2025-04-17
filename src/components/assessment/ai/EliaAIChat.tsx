
import React, { useState, useRef, useEffect } from "react";
import { useMobile } from "@/hooks/use-mobile";
import { FullPageLayout } from "./layouts/FullPageLayout";
import { MobileChatLayout } from "./layouts/MobileChatLayout";
import { FloatingChatLayout } from "./layouts/FloatingChatLayout";
import { useChatState } from "./hooks/useChatState";
import { SuggestedPromptGroups } from "./types/chat";

interface EliaAIChatProps {
  fullPage?: boolean;
}

export function EliaAIChat({ fullPage = false }: EliaAIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobile();
  
  const {
    messages,
    input,
    setInput,
    isLoading,
    hasLoadedHistory,
    setHasLoadedHistory,
    loadChatHistory,
    handleSend: sendMessage
  } = useChatState();
  
  const suggestedPrompts: SuggestedPromptGroups = {
    esg: [
      "What are the key elements of an ESG strategy?",
      "How can I reduce my company's carbon footprint?",
      "What ESG reporting frameworks are recommended for small businesses?",
      "How do I conduct a materiality assessment?"
    ],
    app: [
      "How do I start an ESG assessment?",
      "Where can I find my stakeholder mapping results?",
      "How do I export my assessment reports?",
      "How do I invite team members to collaborate?"
    ]
  };

  // Handle full page mode
  useEffect(() => {
    if (fullPage) {
      setIsOpen(true);
    }
  }, [fullPage]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when chat opens (desktop only)
  useEffect(() => {
    if (isOpen && !isMobile) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMobile]);

  // Load chat history
  useEffect(() => {
    if ((!hasLoadedHistory || fullPage) && isOpen) {
      loadChatHistory();
      setHasLoadedHistory(true);
    }
  }, [hasLoadedHistory, fullPage, isOpen, loadChatHistory, setHasLoadedHistory]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePromptClick = (prompt: string, tag: 'esg' | 'app') => {
    setInput(prompt);
    setActiveTab("chat");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    
    if (!isOpen && !hasLoadedHistory) {
      loadChatHistory();
      setHasLoadedHistory(true);
    }
  };

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSend = () => {
    sendMessage(input, activeTab);
  };

  // Full page layout
  if (fullPage) {
    return (
      <FullPageLayout
        messages={messages}
        isLoading={isLoading}
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        handleKeyDown={handleKeyDown}
        handlePromptClick={handlePromptClick}
        suggestedPrompts={suggestedPrompts}
      />
    );
  }

  // Mobile layout
  if (isMobile) {
    return (
      <MobileChatLayout
        messages={messages}
        isLoading={isLoading}
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        handleKeyDown={handleKeyDown}
        handlePromptClick={handlePromptClick}
        suggestedPrompts={suggestedPrompts}
        handleToggle={handleToggle}
      />
    );
  }

  // Floating desktop layout
  return (
    <FloatingChatLayout
      isOpen={isOpen}
      isExpanded={isExpanded}
      messages={messages}
      isLoading={isLoading}
      input={input}
      setInput={setInput}
      handleSend={handleSend}
      handleKeyDown={handleKeyDown}
      handleToggle={handleToggle}
      handleExpand={handleExpand}
      handlePromptClick={handlePromptClick}
      suggestedPrompts={suggestedPrompts}
    />
  );
}
