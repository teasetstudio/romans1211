/**
 * Truncates HTML content while preserving tags
 * @param html HTML string to process
 * @param maxLength Maximum length of the visible text (excluding tags)
 * @returns Truncated HTML string with preserved tags
 */
export function truncateHtml(html: string, maxLength: number = 200): string {
  if (!html) return '';
  
  let textLength = 0;
  let inTag = false;
  let output = '';
  let truncated = false;
  
  // Stack to keep track of open tags that need to be closed
  const openTags: string[] = [];
  let currentTag = '';
  
  for (let i = 0; i < html.length; i++) {
    const char = html[i];
    
    if (char === '<') {
      inTag = true;
      currentTag = '';
      output += char;
      continue;
    }
    
    if (inTag) {
      output += char;
      currentTag += char;
      if (char === '>') {
        inTag = false;
        // If it's an opening tag (not self-closing and not a closing tag)
        if (!currentTag.includes('/') && !currentTag.endsWith('/>')) {
          const tagName = currentTag.match(/^([a-zA-Z0-9]+)/)?.[1];
          if (tagName) openTags.unshift(tagName);
        }
        // If it's a closing tag, remove the corresponding opening tag
        else if (currentTag.startsWith('/')) {
          openTags.shift();
        }
      }
      continue;
    }
    
    // Count actual text characters (not in tags)
    textLength++;
    
    if (textLength <= maxLength) {
      output += char;
    } else if (!truncated) {
      // Add ellipsis only once
      output += '...';
      truncated = true;
      
      // Close all open tags in reverse order
      for (const tag of openTags) {
        output += `</${tag}>`;
      }
      break;
    }
  }
  
  return output;
}
