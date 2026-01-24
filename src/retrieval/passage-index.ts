import { Passage } from './chunker';

export class PassageIndex {
  private passages: Map<string, Passage> = new Map();
  private invertedIndex: Map<string, Set<string>> = new Map(); // word -> passageIds

  add(passages: Passage[]) {
    for (const p of passages) {
      this.passages.set(p.id, p);
      this.indexPassage(p);
    }
  }

  private indexPassage(p: Passage) {
    const words = p.text.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    for (const word of words) {
      if (!this.invertedIndex.has(word)) {
        this.invertedIndex.set(word, new Set());
      }
      this.invertedIndex.get(word)!.add(p.id);
    }
  }

  search(query: string, limit: number = 5): Passage[] {
    const words = query.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const scores = new Map<string, number>();

    for (const word of words) {
      const ids = this.invertedIndex.get(word);
      if (ids) {
        for (const id of ids) {
          scores.set(id, (scores.get(id) || 0) + 1);
        }
      }
    }

    // Sort by score
    const sortedIds = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(e => e[0])
      .slice(0, limit);

    return sortedIds.map(id => this.passages.get(id)!);
  }

  get(id: string): Passage | undefined {
    return this.passages.get(id);
  }
}
