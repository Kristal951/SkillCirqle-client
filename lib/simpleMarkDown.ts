export function renderSimpleMarkdown(text: string): string {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    .replace(
      /\[(.+?)\]\((.+?)\)/g,
      '<a href="$2" target="_blank" class="text-primary underline">$1</a>',
    )
    .replace(
      /^> (.+)$/gm,
      '<blockquote class="border-l-2 border-text-primary/10 pl-3 text-text-secondary italic">$1</blockquote>',
    )
    .replace(/^\d+\.\s(.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    .replace(/^-\s(.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/\n/g, "<br/>");

  return html;
}
