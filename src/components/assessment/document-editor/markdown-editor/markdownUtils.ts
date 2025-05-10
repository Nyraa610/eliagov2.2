
import { marked } from 'marked';
import TurndownService from 'turndown';

// Initialize turndown service for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
});

// Configure turndown to better handle lists and some HTML elements
turndownService.addRule('listItem', {
  filter: 'li',
  replacement: function(content, node) {
    const parent = node.parentNode;
    let prefix = parent.nodeName === 'OL' ? '1. ' : '- ';
    return prefix + content.trim() + '\n';
  }
});

// Configure marked for Markdown to HTML conversion
marked.setOptions({
  gfm: true,
  breaks: true,
  smartypants: true
});

/**
 * Convert Markdown content to HTML
 */
export function convertMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  try {
    return marked.parse(markdown);
  } catch (error) {
    console.error('Error converting markdown to HTML:', error);
    return markdown;
  }
}

/**
 * Convert HTML content to Markdown
 */
export function convertHtmlToMarkdown(html: string): string {
  if (!html) return '';
  
  try {
    return turndownService.turndown(html);
  } catch (error) {
    console.error('Error converting HTML to markdown:', error);
    return html;
  }
}

/**
 * Format a Markdown code block for display
 */
export function formatCodeBlock(code: string, language: string = ''): string {
  return '```' + language + '\n' + code + '\n```';
}

/**
 * Extract plain text from Markdown content
 */
export function extractTextFromMarkdown(markdown: string): string {
  // First convert markdown to HTML
  const html = convertMarkdownToHtml(markdown);
  
  // Then create a temporary element to extract text
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Return text content only
  return tempDiv.textContent || '';
}
