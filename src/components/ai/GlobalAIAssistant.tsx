
import React from 'react';
import { useLocation } from 'react-router-dom';
import { EliaAIChat } from '@/components/assessment/ai/EliaAIChat';

export function GlobalAIAssistant() {
  const location = useLocation();
  
  // On the expert talk page, we use the full-page interface
  // so don't render the floating chat component
  if (location.pathname === '/expert/talk') {
    return <EliaAIChat fullPage={true} />;
  }
  
  // On all other pages, render the floating chat
  return <EliaAIChat />;
}
