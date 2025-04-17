
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tag?: 'esg' | 'app' | 'general';
}

export interface ChatHistoryItem {
  user_message: string;
  assistant_response: string;
  created_at: string;
  tag?: 'esg' | 'app' | 'general';
}

export type MessageTag = 'esg' | 'app' | 'general';

export interface SuggestedPrompt {
  text: string;
  tag: MessageTag;
}

export interface SuggestedPromptGroups {
  esg: string[];
  app: string[];
}
