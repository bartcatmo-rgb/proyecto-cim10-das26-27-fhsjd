import zlib from 'zlib';

export interface ExtractedPdfContent {
  rawText: string;
  titleCandidate: string;
  estimatedPages: number;
  sections: Array<{
    title: string;
    content: string;
  }>;
}

/**
 * Native Node.js PDF text extractor without external binaries or heavy npm packages.
 * Parses PDF streams, decompresses FlateDecode streams using native zlib,
 * extracts text tokens (Tj, TJ, ', ") and reconstructs coherent textual sections.
 */
export function extractTextFromPdfBuffer(buffer: Buffer): ExtractedPdfContent {
  if (!buffer || buffer.length === 0) {
    throw new Error('El buffer del PDF está vacío.');
  }

  // Validate PDF header (%PDF-)
  const header = buffer.subarray(0, 8).toString('latin1');
  if (!header.startsWith('%PDF-')) {
    throw new Error('El archivo proporcionado no es un documento PDF válido (%PDF- header no encontrado).');
  }

  const rawString = buffer.toString('latin1');
  const textChunks: string[] = [];
  let pageCount = 0;

  // Count /Type /Page occurrences for estimated pages
  const pageMatches = rawString.match(/\/Type\s*\/Page\b/g);
  pageCount = pageMatches ? pageMatches.length : 1;

  // Regex to extract streams: stream\r?\n(data)\r?\nendstream
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match: RegExpExecArray | null;

  while ((match = streamRegex.exec(rawString)) !== null) {
    const streamContent = match[1];
    const streamStartPos = match.index + match[0].indexOf(streamContent);
    const streamBuffer = buffer.subarray(streamStartPos, streamStartPos + streamContent.length);

    // Look back in dictionary before "stream" to check filters
    const dictStart = Math.max(0, match.index - 300);
    const dictSnippet = rawString.substring(dictStart, match.index);

    let decompressed: Buffer | null = null;

    if (dictSnippet.includes('/FlateDecode') || dictSnippet.includes('/Fl')) {
      try {
        decompressed = zlib.inflateSync(streamBuffer);
      } catch {
        try {
          decompressed = zlib.inflateRawSync(streamBuffer);
        } catch {
          // Non-standard stream or encryption, continue
        }
      }
    } else {
      decompressed = streamBuffer;
    }

    if (decompressed) {
      const streamText = parsePdfTextStream(decompressed.toString('latin1'));
      if (streamText.trim().length > 0) {
        textChunks.push(streamText.trim());
      }
    }
  }

  // Fallback: if no decompressed stream yielded text, scan raw string for text markers
  if (textChunks.length === 0) {
    const fallbackText = parsePdfTextStream(rawString);
    if (fallbackText.trim().length > 0) {
      textChunks.push(fallbackText.trim());
    }
  }

  const fullText = textChunks.join('\n\n').replace(/\r\n/g, '\n');
  const cleanedText = cleanExtractedText(fullText);

  // Extract sections and title
  const sections = splitIntoSections(cleanedText);
  const titleCandidate = detectTitle(cleanedText, sections);

  return {
    rawText: cleanedText,
    titleCandidate,
    estimatedPages: Math.max(1, pageCount),
    sections
  };
}

/**
 * Parses PDF text operators inside a decompressed content stream (BT ... ET)
 */
function parsePdfTextStream(stream: string): string {
  const result: string[] = [];
  const btBlocks = stream.match(/BT[\s\S]*?ET/g) || [stream];

  for (const block of btBlocks) {
    // 1. Array TJ: [(text) 20 (more text)] TJ
    const tjArrayRegex = /\[((?:\([^)]*\)|-?\d+(?:\.\d+)?|\s+)+)\]\s*TJ/g;
    let mArray: RegExpExecArray | null;
    while ((mArray = tjArrayRegex.exec(block)) !== null) {
      const inner = mArray[1];
      const stringMatches = inner.match(/\(([^)]*)\)/g);
      if (stringMatches) {
        const line = stringMatches.map((s) => s.slice(1, -1)).join('');
        if (line.trim().length > 0) result.push(decodePdfString(line));
      }
    }

    // 2. Single Tj: (Text here) Tj
    const tjSingleRegex = /\(([^)]*)\)\s*(?:Tj|'|")/g;
    let mSingle: RegExpExecArray | null;
    while ((mSingle = tjSingleRegex.exec(block)) !== null) {
      const text = mSingle[1];
      if (text.trim().length > 0) {
        result.push(decodePdfString(text));
      }
    }
  }

  return result.join(' ');
}

function decodePdfString(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
    .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
}

function cleanExtractedText(text: string): string {
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

function detectTitle(text: string, sections: Array<{ title: string; content: string }>): string {
  if (sections.length > 0 && sections[0].title && sections[0].title !== 'Introducción General') {
    return sections[0].title;
  }
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 4 && l.length < 90);
  if (lines.length > 0) {
    return lines[0];
  }
  return 'Temario Clínico Sanitario Importado';
}

function splitIntoSections(text: string): Array<{ title: string; content: string }> {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Split by common syllabus section headers: "Tema X", "Capítulo X", "Unidad X", "Sección X" or numbered lines
  const lines = text.split('\n');
  const sections: Array<{ title: string; content: string }> = [];
  let currentTitle = 'Introducción General';
  let currentLines: string[] = [];

  const sectionHeaderRegex = /^(?:Tema\s+\d+|Cap[ií]tulo\s+\d+|Unidad\s+\d+|M[oó]dulo\s+\d+|\d+\.\s+[A-ZÁÉÍÓÚÑ])/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 3 && sectionHeaderRegex.test(trimmed)) {
      if (currentLines.length > 0) {
        sections.push({
          title: currentTitle,
          content: currentLines.join('\n').trim()
        });
        currentLines = [];
      }
      currentTitle = trimmed;
    } else {
      currentLines.push(trimmed);
    }
  }

  if (currentLines.length > 0) {
    sections.push({
      title: currentTitle,
      content: currentLines.join('\n').trim()
    });
  }

  // If text was monolithic without explicit headers, split into coherent chunks (~800-1500 chars)
  if (sections.length <= 1 && text.length > 1200) {
    const paragraphs = text.split(/\n\s*\n/);
    const chunked: Array<{ title: string; content: string }> = [];
    let chunkLines: string[] = [];
    let chunkCount = 1;

    for (const p of paragraphs) {
      chunkLines.push(p);
      if (chunkLines.join('\n').length > 1000) {
        chunked.push({
          title: `Bloque Temático ${chunkCount}: Fundamentos y Casuística`,
          content: chunkLines.join('\n\n').trim()
        });
        chunkLines = [];
        chunkCount++;
      }
    }
    if (chunkLines.length > 0) {
      chunked.push({
        title: `Bloque Temático ${chunkCount}: Criterios y Directrices`,
        content: chunkLines.join('\n\n').trim()
      });
    }
    return chunked;
  }

  return sections;
}
