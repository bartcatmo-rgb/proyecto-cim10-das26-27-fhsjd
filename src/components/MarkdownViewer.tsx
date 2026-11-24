'use client';

import React from 'react';

interface MarkdownViewerProps {
  content: string;
}

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeLanguage = '';

  let inTable = false;
  let tableHeader: string[] = [];
  let tableRows: string[][] = [];

  const flushCodeBlock = (key: number) => {
    if (codeBlockLines.length > 0) {
      elements.push(
        <div key={`code-${key}`} className="my-4 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 font-mono text-xs">
          {codeLanguage && (
            <div className="bg-slate-900 px-4 py-1.5 border-b border-slate-800 text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>{codeLanguage}</span>
            </div>
          )}
          <pre className="p-4 overflow-x-auto leading-relaxed">
            <code>{codeBlockLines.join('\n')}</code>
          </pre>
        </div>
      );
      codeBlockLines = [];
      codeLanguage = '';
    }
  };

  const flushTable = (key: number) => {
    if (tableHeader.length > 0) {
      elements.push(
        <div key={`table-${key}`} className="my-5 overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
              <tr>
                {tableHeader.map((th, i) => (
                  <th key={i} className="px-3.5 py-2.5">
                    {formatInline(th.trim())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/80 transition">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3.5 py-2 text-slate-700">
                      {formatInline(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableHeader = [];
      tableRows = [];
    }
  };

  const formatInline = (text: string): React.ReactNode => {
    // Reemplazar negritas **texto** y códigos `codigo`
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-extrabold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="px-1.5 py-0.5 rounded bg-slate-100 text-brand-700 font-mono text-[11px] sm:text-xs border border-slate-200 font-semibold">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Bloque de código
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock(i);
        inCodeBlock = false;
      } else {
        if (inTable) {
          flushTable(i);
          inTable = false;
        }
        inCodeBlock = true;
        codeLanguage = trimmed.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(rawLine);
      continue;
    }

    // Tablas Markdown (| col1 | col2 |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());

      // Comprobar si es línea separadora (|:---|:---|)
      if (cells.every((c) => /^:?-+:?$/.test(c))) {
        continue;
      }

      if (!inTable) {
        inTable = true;
        tableHeader = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      flushTable(i);
      inTable = false;
    }

    // Línea divisoria
    if (trimmed === '---' || trimmed === '***') {
      elements.push(<hr key={i} className="my-6 border-slate-200" />);
      continue;
    }

    // Encabezados
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-6 mb-2">
          {formatInline(trimmed.slice(2))}
        </h1>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-6 mb-2 border-b border-slate-100 pb-1">
          {formatInline(trimmed.slice(3))}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-base sm:text-lg font-bold text-slate-900 mt-5 mb-1.5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />
          {formatInline(trimmed.slice(4))}
        </h3>
      );
      continue;
    }

    // Listas desordenadas (- o *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 my-1 ml-2">
          <span className="text-brand-500 font-bold leading-none mt-1">•</span>
          <span className="leading-relaxed">{formatInline(trimmed.slice(2))}</span>
        </div>
      );
      continue;
    }

    // Listas ordenadas (1. 2.)
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      elements.push(
        <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 my-1.5 ml-2">
          <span className="w-5 h-5 rounded-full bg-brand-50 text-brand-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 border border-brand-200">
            {orderedMatch[1]}
          </span>
          <span className="leading-relaxed">{formatInline(orderedMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Citas / Blockquotes (> )
    if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="my-3 border-l-4 border-brand-500 bg-brand-50/50 p-3.5 rounded-r-xl text-xs sm:text-sm text-slate-800 italic">
          {formatInline(trimmed.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Párrafo normal
    if (trimmed.length > 0) {
      elements.push(
        <p key={i} className="my-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {formatInline(trimmed)}
        </p>
      );
    }
  }

  // Limpiar estados pendientes
  if (inCodeBlock) flushCodeBlock(lines.length);
  if (inTable) flushTable(lines.length);

  return <div className="space-y-1 prose prose-slate max-w-none">{elements}</div>;
}
