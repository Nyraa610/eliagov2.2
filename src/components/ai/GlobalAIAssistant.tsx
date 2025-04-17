
import React from 'react';
import { useLocation } from 'react-router-dom';
import { EliaAIChat } from '@/components/assessment/ai/EliaAIChat';

export function GlobalAIAssistant() {
  const location = useLocation();
  
  // On the expert talk page, we don't render the assistant
  // since it's already being rendered in the page content
  if (location.pathname === '/expert/talk') {
    return null;
  }
  
  // On all other pages, render the floating chat
  return <EliaAIChat />;
}
