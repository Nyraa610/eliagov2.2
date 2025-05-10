
import React from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Bold, Italic, List, ListOrdered, Heading1, Heading2, 
  Link as LinkIcon, Image, Code, Quote, Table
} from "lucide-react";

interface EditorToolbarProps {
  content: string;
  onApply: (content: string) => void;
}

export function EditorToolbar({ content, onApply }: EditorToolbarProps) {
  const insertAtCursor = (
    insertBefore: string,
    insertAfter: string,
    defaultText: string = ''
  ) => {
    const textarea = document.querySelector('.markdown-editor textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const textToInsert = selectedText || defaultText;
    
    const newContent = 
      content.substring(0, start) + 
      insertBefore + textToInsert + insertAfter +
      content.substring(end);
    
    onApply(newContent);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + insertBefore.length + textToInsert.length,
        start + insertBefore.length + textToInsert.length
      );
    }, 0);
  };

  const insertImage = () => {
    // Show a simple prompt for image URL input
    const url = window.prompt('Enter image URL:', 'https://images.unsplash.com/');
    if (url) {
      insertAtCursor('![', `](${url})`, 'Image description');
    }
  };

  const formatButton = (
    icon: React.ReactNode,
    tooltip: string,
    onClick: () => void
  ) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          type="button"
          variant="ghost" 
          onClick={onClick} 
          className="h-8 w-8 p-0"
        >
          {icon}
          <span className="sr-only">{tooltip}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );

  return (
    <div className="flex flex-wrap gap-1 p-1 border border-input rounded-md mb-2 bg-background">
      {formatButton(<Bold className="h-4 w-4" />, "Bold", 
        () => insertAtCursor('**', '**', 'bold text'))}
      
      {formatButton(<Italic className="h-4 w-4" />, "Italic", 
        () => insertAtCursor('*', '*', 'italic text'))}
      
      {formatButton(<Heading1 className="h-4 w-4" />, "Heading 1", 
        () => insertAtCursor('# ', '', 'Heading 1'))}
      
      {formatButton(<Heading2 className="h-4 w-4" />, "Heading 2", 
        () => insertAtCursor('## ', '', 'Heading 2'))}
      
      {formatButton(<List className="h-4 w-4" />, "Bullet List", 
        () => insertAtCursor('- ', '', 'List item'))}
      
      {formatButton(<ListOrdered className="h-4 w-4" />, "Numbered List", 
        () => insertAtCursor('1. ', '', 'List item'))}
      
      {formatButton(<LinkIcon className="h-4 w-4" />, "Insert Link", 
        () => insertAtCursor('[', '](https://example.com)', 'link text'))}
      
      {formatButton(<Image className="h-4 w-4" />, "Insert Image", 
        () => insertImage())}
      
      {formatButton(<Code className="h-4 w-4" />, "Code Block", 
        () => insertAtCursor('```\n', '\n```', 'code'))}
      
      {formatButton(<Quote className="h-4 w-4" />, "Quote", 
        () => insertAtCursor('> ', '', 'quote'))}
      
      {formatButton(<Table className="h-4 w-4" />, "Table", 
        () => insertAtCursor(
          '| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n', 
          '', 
          ''
        ))}
    </div>
  );
}
