
import React from 'react';
import { convertMarkdownToHtml } from './markdownUtils';
import './MarkdownEditor.css';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
  // Convert markdown to HTML for rendering
  const htmlContent = convertMarkdownToHtml(content);
  
  return (
    <div 
      className={`markdown-preview prose max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
