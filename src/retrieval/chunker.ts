import * as crypto from 'crypto';

export interface Passage {
  id: string;
  docId: string;
  text: string;
  offset: number;
  length: number;
}

export class Chunker {
  private chunkSize: number;
  private overlap: number;

  constructor(chunkSize: number = 500, overlap: number = 50) {
    this.chunkSize = chunkSize;
    this.overlap = overlap;
  }

  chunk(text: string, docId: string): Passage[] {
    const passages: Passage[] = [];
    let offset = 0;

    // Simple character-based chunking for now
    // In production, use token-based or sentence-boundary aware
    while (offset < text.length) {
      const end = Math.min(offset + this.chunkSize, text.length);
      const chunkText = text.substring(offset, end);
      
      const id = crypto.createHash('sha256')
        .update(docId)
        .update(offset.toString())
        .digest('hex')
        .substring(0, 16);

      passages.push({
        id,
        docId,
        text: chunkText,
        offset,
        length: chunkText.length
      });

      if (end >= text.length) break;
      offset += (this.chunkSize - this.overlap);
    }

    return passages;
  }
}
