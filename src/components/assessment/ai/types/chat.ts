
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
  messageCategory?: 'esg' | 'app' | 'general';  // Added messageCategory property
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
