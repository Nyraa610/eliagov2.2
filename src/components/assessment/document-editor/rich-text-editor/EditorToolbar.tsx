
import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image,
  ListOrdered,
  List,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageDialogOpen, setImageDialogOpen] = useState<boolean>(false);
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [linkDialogOpen, setLinkDialogOpen] = useState<boolean>(false);
  const { toast } = useToast();

  if (!editor) {
    return null;
  }

  const handleImageInsert = () => {
    if (imageUrl) {
      editor.chain().focus().insertContent(`<img src="${imageUrl}" alt="Inserted image" />`).run();
      setImageUrl('');
      setImageDialogOpen(false);
      toast({
        title: "Image inserted",
        description: "The image has been added to the document",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        editor.chain().focus().insertContent(`<img src="${result}" alt="Uploaded image" />`).run();
        setImageDialogOpen(false);
        toast({
          title: "Image uploaded",
          description: "The image has been added to the document",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLinkInsert = () => {
    if (linkUrl) {
      // Fixed: Removing unsetLink and using standard methods
      if (editor.isActive('link')) {
        editor.chain().focus().extendMarkRange('link').unsetMark('link').run();
      }
      
      // Add link with proper attributes
      editor.chain().focus().extendMarkRange('link').setMark('link', { href: linkUrl }).run();
      setLinkUrl('');
      setLinkDialogOpen(false);
    }
  };

  // Fixed: Replace insertTable with custom implementation
  const insertTable = () => {
    // Using insertContent instead as a workaround since insertTable isn't available
    editor.chain().focus().insertContent('<table><tbody><tr><td></td><td></td></tr><tr><td></td><td></td></tr></tbody></table>').run();
  };

  return (
    <div className="border border-input bg-transparent rounded-md px-1 py-1 mb-2 flex flex-wrap gap-1">
      {/* Text Formatting */}
      <TooltipProvider>
        <ToggleGroup type="multiple" variant="outline" className="flex-wrap">
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value="bold"
                aria-label="Toggle bold"
                onClick={() => editor.chain().focus().toggleMark('bold').run()}
                data-active={editor.isActive('bold')}
                className={editor.isActive('bold') ? 'bg-accent' : ''}
              >
                <Bold className="h-4 w-4" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value="italic"
                aria-label="Toggle italic"
                onClick={() => editor.chain().focus().toggleMark('italic').run()}
                data-active={editor.isActive('italic')}
                className={editor.isActive('italic') ? 'bg-accent' : ''}
              >
                <Italic className="h-4 w-4" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value="underline"
                aria-label="Toggle underline"
                onClick={() => editor.chain().focus().toggleMark('underline').run()}
                data-active={editor.isActive('underline')}
                className={editor.isActive('underline') ? 'bg-accent' : ''}
              >
                <Underline className="h-4 w-4" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>Underline</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value="strike"
                aria-label="Toggle strikethrough"
                onClick={() => editor.chain().focus().toggleMark('strike').run()}
                data-active={editor.isActive('strike')}
                className={editor.isActive('strike') ? 'bg-accent' : ''}
              >
                <Strikethrough className="h-4 w-4" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>Strikethrough</TooltipContent>
          </Tooltip>
        </ToggleGroup>
      </TooltipProvider>

      <Separator orientation="vertical" className="mx-1 h-8" />

      {/* Headings */}
      <TooltipProvider>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9">
                  <span className="sr-only">Heading</span>
                  <Heading2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Headings</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Heading</DropdownMenuLabel>
            {/* Fixed: Corrected toggleNode parameters */}
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleNode('heading', 'paragraph', { level: 1 }).run()}>
              <Heading1 className="mr-2 h-4 w-4" />
              <span>Heading 1</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleNode('heading', 'paragraph', { level: 2 }).run()}>
              <Heading2 className="mr-2 h-4 w-4" />
              <span>Heading 2</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleNode('heading', 'paragraph', { level: 3 }).run()}>
              <Heading3 className="mr-2 h-4 w-4" />
              <span>Heading 3</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>

      <Separator orientation="vertical" className="mx-1 h-8" />
      
      {/* Lists */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => editor.chain().focus().toggleList('bulletList').run()}
              className={editor.isActive('bulletList') ? 'bg-accent' : ''}
            >
              <List className="h-4 w-4" />
              <span className="sr-only">Bullet list</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Bullet List</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => editor.chain().focus().toggleList('orderedList').run()}
              className={editor.isActive('orderedList') ? 'bg-accent' : ''}
            >
              <ListOrdered className="h-4 w-4" />
              <span className="sr-only">Ordered list</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Ordered List</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Separator orientation="vertical" className="mx-1 h-8" />

      {/* Text Alignment */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={editor.isActive({ textAlign: 'left' }) ? 'bg-accent' : ''}
            >
              <AlignLeft className="h-4 w-4" />
              <span className="sr-only">Align left</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align Left</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={editor.isActive({ textAlign: 'center' }) ? 'bg-accent' : ''}
            >
              <AlignCenter className="h-4 w-4" />
              <span className="sr-only">Align center</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align Center</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={editor.isActive({ textAlign: 'right' }) ? 'bg-accent' : ''}
            >
              <AlignRight className="h-4 w-4" />
              <span className="sr-only">Align right</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align Right</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Separator orientation="vertical" className="mx-1 h-8" />

      {/* Insert */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setImageDialogOpen(true)}
            >
              <Image className="h-4 w-4" />
              <span className="sr-only">Insert image</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Image</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setLinkDialogOpen(true)}
              className={editor.isActive('link') ? 'bg-accent' : ''}
            >
              <LinkIcon className="h-4 w-4" />
              <span className="sr-only">Insert link</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Link</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={insertTable}
            >
              <span className="sr-only">Insert table</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="3" y1="15" x2="21" y2="15" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <line x1="15" y1="3" x2="15" y2="21" />
              </svg>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Table</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Separator orientation="vertical" className="mx-1 h-8" />
      
      {/* History */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => editor.commands.undo()}
              disabled={!editor.can().chain().focus().undo().run()}
            >
              <Undo className="h-4 w-4" />
              <span className="sr-only">Undo</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => editor.commands.redo()}
              disabled={!editor.can().chain().focus().redo().run()}
            >
              <Redo className="h-4 w-4" />
              <span className="sr-only">Redo</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="image-url">Image URL</label>
              <Input
                id="image-url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="image-upload">Or upload an image</label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setImageDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" onClick={handleImageInsert}>
              Insert Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="link-url">URL</label>
              <Input
                id="link-url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setLinkDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" onClick={handleLinkInsert}>
              Insert Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
