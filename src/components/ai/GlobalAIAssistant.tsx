
import React from 'react';
import { useLocation } from 'react-router-dom';
import { EliaAIChat } from '@/components/assessment/ai/EliaAIChat';

export function GlobalAIAssistant() {
  const location = useLocation();
  
  // Don't show global assistant on the expert talk page as it has its own interface
  if (location.pathname === '/expert/talk') {
    return null;
  }
  
  return <EliaAIChat />;
}
