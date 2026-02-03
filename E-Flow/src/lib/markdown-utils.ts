// Utility to strip markdown formatting from text
export function stripMarkdown(text: string): string {
  return text
    // Remove headers (###, ##, #)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold (**text** or __text__)
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    // Remove italic (*text* or _text_)
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove strikethrough (~~text~~)
    .replace(/~~([^~]+)~~/g, '$1')
    // Remove inline code (`code`)
    .replace(/`([^`]+)`/g, '$1')
    // Remove code blocks (```code```)
    .replace(/```[\s\S]*?```/g, '')
    // Remove links [text](url)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // Remove blockquotes (> text)
    .replace(/^>\s+/gm, '')
    // Remove horizontal rules (---, ***, ___)
    .replace(/^[-*_]{3,}$/gm, '')
    // Remove bullet points (- item, * item, + item)
    .replace(/^[\s]*[-*+]\s+/gm, '• ')
    // Remove numbered lists (1. item)
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Clean up multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
