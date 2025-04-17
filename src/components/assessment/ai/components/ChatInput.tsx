
import React, { useRef } from "react";
import { Send } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export function ChatInput({ input, setInput, onSend, isLoading, onKeyDown }: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex gap-2 w-full">
      <Input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask anything about ESG or how to use the app..."
        disabled={isLoading}
        className="flex-1"
      />
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={onSend}
          disabled={!input.trim() || isLoading}
          size="icon"
          className="bg-emerald-800 hover:bg-emerald-700"
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </motion.div>
    </div>
  );
}
