
import React, { useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { EditorToolbar } from './EditorToolbar';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readonly?: boolean;
  className?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Write something...',
  readonly = false,
  className = '',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    editable: !readonly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // This effect updates the editor content when the content prop changes
  // (to handle cases where content is loaded asynchronously)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const handleFocus = useCallback(() => {
    if (editor && !readonly) {
      editor.commands.focus('end');
    }
  }, [editor, readonly]);

  return (
    <div className={`border border-input rounded-md ${className}`} onClick={handleFocus}>
      {!readonly && editor && <EditorToolbar editor={editor} />}
      <div className={`${readonly ? 'prose' : 'prose-editable'} max-w-none px-3 py-2 min-h-[200px] prose-sm sm:prose lg:prose-lg focus:outline-none`}>
        <EditorContent editor={editor} className="focus:outline-none" />
      </div>
    </div>
  );
}
