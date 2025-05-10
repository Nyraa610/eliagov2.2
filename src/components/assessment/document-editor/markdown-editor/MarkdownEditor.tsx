
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "../rich-text-editor/RichTextEditor";
import { EditorToolbar } from "./EditorToolbar";
import { MarkdownPreview } from "./MarkdownPreview";
import { convertMarkdownToHtml, convertHtmlToMarkdown } from "./markdownUtils";
import "./MarkdownEditor.css";

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readonly?: boolean;
  className?: string;
}

export function MarkdownEditor({
  content,
  onChange,
  placeholder = 'Write something...',
  readonly = false,
  className = '',
}: MarkdownEditorProps) {
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('visual');

  // Initialize editor content
  useEffect(() => {
    if (!content) {
      setMarkdownContent('');
      setHtmlContent('');
      return;
    }
    
    // If content is markdown, convert to HTML for the visual editor
    if (content.includes('#') || content.includes('*') || content.includes('```') || content.includes('- ')) {
      setMarkdownContent(content);
      setHtmlContent(convertMarkdownToHtml(content));
    } else {
      // Assuming content is HTML
      setHtmlContent(content);
      setMarkdownContent(convertHtmlToMarkdown(content));
    }
  }, [content]);

  // Update content when markdown changes
  const handleMarkdownChange = (newMarkdown: string) => {
    setMarkdownContent(newMarkdown);
    setHtmlContent(convertMarkdownToHtml(newMarkdown));
    onChange(newMarkdown); // We store content as markdown
  };

  // Update content when visual editor changes
  const handleHtmlChange = (newHtml: string) => {
    setHtmlContent(newHtml);
    const markdown = convertHtmlToMarkdown(newHtml);
    setMarkdownContent(markdown);
    onChange(markdown); // We store content as markdown
  };

  // Handle tab switching
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className={`markdown-editor ${className}`}>
      {!readonly && (
        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange} 
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="visual">Visual Editor</TabsTrigger>
            <TabsTrigger value="markdown">Markdown</TabsTrigger>
          </TabsList>
          
          <TabsContent value="visual" className="mt-2">
            <RichTextEditor
              content={htmlContent}
              onChange={handleHtmlChange}
              placeholder={placeholder}
              readonly={readonly}
            />
          </TabsContent>
          
          <TabsContent value="markdown" className="mt-2">
            <EditorToolbar onApply={handleMarkdownChange} content={markdownContent} />
            <div className="border border-input rounded-md p-2 min-h-[200px]">
              <textarea
                className="w-full h-[500px] focus:outline-none resize-vertical font-mono text-sm p-2"
                value={markdownContent}
                onChange={(e) => handleMarkdownChange(e.target.value)}
                placeholder={placeholder}
                disabled={readonly}
                spellCheck="false"
              />
            </div>
          </TabsContent>
        </Tabs>
      )}
      
      {readonly && (
        <div className="preview-only">
          <MarkdownPreview content={markdownContent} />
        </div>
      )}
    </div>
  );
}
