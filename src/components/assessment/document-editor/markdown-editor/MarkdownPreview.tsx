
import React, { useEffect } from 'react';
import { convertMarkdownToHtml } from './markdownUtils';
import './MarkdownEditor.css';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
  // Convert markdown to HTML for rendering
  const htmlContent = convertMarkdownToHtml(content);
  
  // Load images after component renders
  useEffect(() => {
    // Force images to load properly after rendering
    const images = document.querySelectorAll('.markdown-preview img');
    images.forEach((img: HTMLImageElement) => {
      if (img.src) {
        const originalSrc = img.src;
        // Toggle src to force browser to reload the image
        img.src = '';
        setTimeout(() => {
          img.src = originalSrc;
        }, 10);
      }
    });
  }, [htmlContent]);
  
  return (
    <div 
      className={`markdown-preview prose max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
