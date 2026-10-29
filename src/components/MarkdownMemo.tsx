import React from 'react';

interface MarkdownMemoProps {
  content: string;
}

/**
 * Parses inline formatting:
 * - **bold** -> <strong>
 * - *italic* -> <em>
 * - `code` -> <code>
 * - \$ -> $
 * Also resilient against unclosed tags during real-time streaming!
 */
function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  // Clean escaped dollar signs like \$1,30,275 -> $1,30,275
  const normalized = text.replace(/\\(\$)/g, '$1');

  // Split and match tokens: **bold**, *italic*, `code`
  // We use regex with capturing groups
  const regex = /(\*\*([^*]+?)\*\*|\*([^*]+?)\*|`([^`]+?)`)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIdx = 0;

  while ((match = regex.exec(normalized)) !== null) {
    // Plain text before token
    if (match.index > lastIndex) {
      parts.push(normalized.substring(lastIndex, match.index));
    }

    const full = match[0];
    if (full.startsWith('**')) {
      parts.push(
        <strong key={`b-${keyIdx++}`} className="font-semibold text-slate-900">
          {match[2]}
        </strong>
      );
    } else if (full.startsWith('*')) {
      parts.push(
        <em key={`i-${keyIdx++}`} className="italic text-slate-600">
          {match[3]}
        </em>
      );
    } else if (full.startsWith('`')) {
      parts.push(
        <code key={`c-${keyIdx++}`} className="px-1 py-0.5 bg-slate-100 rounded text-slate-800 font-mono text-[11px]">
          {match[4]}
        </code>
      );
    }

    lastIndex = match.index + full.length;
  }

  // Handle trailing text
  if (lastIndex < normalized.length) {
    const tail = normalized.substring(lastIndex);
    // If the stream is in the middle of bold text e.g. "**Immediate Stockout" without closing "**"
    if (tail.startsWith('**')) {
      parts.push(
        <strong key={`b-tail-${keyIdx++}`} className="font-semibold text-slate-900">
          {tail.substring(2)}
        </strong>
      );
    } else {
      parts.push(tail);
    }
  }

  return <>{parts}</>;
}

export const MarkdownMemo: React.FC<MarkdownMemoProps> = ({ content }) => {
  if (!content) return null;

  // Split text by lines
  const rawLines = content.split('\n');

  // Group and render structured blocks
  const blocks: React.ReactNode[] = [];
  let currentList: { type: 'bullet' | 'number'; items: string[] } | null = null;
  let metaGroup: { key: string; value: string }[] = [];

  const flushMetaGroup = (keyPrefix: string) => {
    if (metaGroup.length === 0) return;
    const currentItems = [...metaGroup];
    metaGroup = [];

    blocks.push(
      <div
        key={`${keyPrefix}-meta-grid`}
        className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 bg-slate-50 border border-slate-200/90 rounded-md p-3 my-2 text-xs font-sans"
      >
        {currentItems.map((item, idx) => (
          <div key={idx} className="flex items-baseline justify-between sm:justify-start gap-2 border-b border-slate-100 sm:border-0 pb-1 sm:pb-0">
            <span className="text-slate-500 font-medium text-[11px] min-w-[130px]">{item.key}:</span>
            <span className="font-semibold text-slate-900 text-xs tabular-nums text-right sm:text-left">{renderInlineMarkdown(item.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  const flushList = (keyPrefix: string) => {
    if (!currentList || currentList.items.length === 0) return;
    const { type, items } = currentList;
    currentList = null;

    if (type === 'bullet') {
      blocks.push(
        <ul key={`${keyPrefix}-ul`} className="space-y-1.5 my-2 pl-1">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-snug">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
              <div className="flex-1">{renderInlineMarkdown(item)}</div>
            </li>
          ))}
        </ul>
      );
    } else {
      blocks.push(
        <ol key={`${keyPrefix}-ol`} className="space-y-2 my-2">
          {items.map((item, idx) => {
            const isWarning = item.includes('⚠️') || item.toLowerCase().includes('promo distortion');
            return (
              <li
                key={idx}
                className={`text-xs leading-relaxed p-2.5 rounded-md border ${
                  isWarning
                    ? 'bg-amber-50/80 border-amber-200/80 text-amber-950'
                    : 'bg-slate-50/70 border-slate-200/70 text-slate-800'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0 mt-0.5 ${
                    isWarning ? 'bg-amber-200 text-amber-900' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 space-y-1">
                    {renderInlineMarkdown(item)}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      );
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();

    if (!line) {
      // Empty line -> flush pending groups
      flushMetaGroup(`empty-${i}`);
      flushList(`empty-${i}`);
      continue;
    }

    // Horizontal Rule: --- or ***
    if (line === '---' || line === '***') {
      flushMetaGroup(`hr-${i}`);
      flushList(`hr-${i}`);
      blocks.push(<hr key={`hr-${i}`} className="my-3 border-t border-slate-200" />);
      continue;
    }

    // Heading 3: ### Title
    if (line.startsWith('### ')) {
      flushMetaGroup(`h3-${i}`);
      flushList(`h3-${i}`);
      const text = line.replace(/^###\s+/, '');
      blocks.push(
        <div key={`h3-${i}`} className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            {renderInlineMarkdown(text)}
          </h3>
        </div>
      );
      continue;
    }

    // Heading 4: #### Title
    if (line.startsWith('#### ')) {
      flushMetaGroup(`h4-${i}`);
      flushList(`h4-${i}`);
      const text = line.replace(/^####\s+/, '');
      blocks.push(
        <h4 key={`h4-${i}`} className="text-xs font-bold text-slate-800 uppercase tracking-wide mt-3.5 mb-1.5 flex items-center gap-1.5 text-blue-900">
          {renderInlineMarkdown(text)}
        </h4>
      );
      continue;
    }

    // Key-Value Metadata: **Key:** Value
    const metaMatch = line.match(/^\*\*([^*:]+):\*\*\s*(.*)$/);
    if (metaMatch) {
      flushList(`meta-${i}`);
      metaGroup.push({ key: metaMatch[1].trim(), value: metaMatch[2].trim() });
      continue;
    } else {
      flushMetaGroup(`nonmeta-${i}`);
    }

    // Bullet List: - item or * item
    const bulletMatch = line.match(/^[-*]\s+(.*)$/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== 'bullet') {
        flushList(`switch-bullet-${i}`);
        currentList = { type: 'bullet', items: [] };
      }
      currentList.items.push(bulletMatch[1]);
      continue;
    }

    // Numbered List: 1. item or 2. item
    const numberMatch = line.match(/^\d+\.\s+(.*)$/);
    if (numberMatch) {
      if (!currentList || currentList.type !== 'number') {
        flushList(`switch-number-${i}`);
        currentList = { type: 'number', items: [] };
      }
      currentList.items.push(numberMatch[1]);
      continue;
    }

    // If we were inside a list and this line is indented continuation or paragraph
    if (currentList) {
      if (line.startsWith('   ') || line.startsWith('\t')) {
        // Append to last list item
        const lastIdx = currentList.items.length - 1;
        if (lastIdx >= 0) {
          currentList.items[lastIdx] += `\n${line.trim()}`;
          continue;
        }
      } else {
        flushList(`break-list-${i}`);
      }
    }

    // Italic Footnote: *text*
    const footnoteMatch = line.match(/^\*([^*]+)\*$/);
    if (footnoteMatch) {
      blocks.push(
        <div key={`fn-${i}`} className="text-[11px] text-slate-400 italic text-center pt-2 font-mono border-t border-slate-100 mt-3">
          {footnoteMatch[1]}
        </div>
      );
      continue;
    }

    // Regular paragraph
    blocks.push(
      <p key={`p-${i}`} className="text-xs text-slate-700 leading-relaxed my-1">
        {renderInlineMarkdown(line)}
      </p>
    );
  }

  // Flush any remaining groups
  flushMetaGroup('end');
  flushList('end');

  return <div className="space-y-1 font-sans text-xs leading-relaxed text-slate-800">{blocks}</div>;
};

