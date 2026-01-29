import * as crypto from 'crypto';
import { ArtifactManager } from '../runtime/artifacts';
import { WebPage } from '../search/fetcher';

export class EvidenceStore {
  private artifactManager: ArtifactManager;

  constructor(artifactManager: ArtifactManager) {
    this.artifactManager = artifactManager;
  }

  async add(page: WebPage): Promise<string> {
    const hash = crypto.createHash('sha256').update(page.url).digest('hex');
    const docId = `doc-${hash.substring(0, 12)}`;

    // Store content
    await this.artifactManager.store(
      `evidence/docs/${docId}/content.txt`,
      page.content,
      'text/plain',
      { url: page.url, title: page.title, ...page.metadata }
    );

    // Store metadata separately for quick access
    await this.artifactManager.store(
      `evidence/docs/${docId}/meta.json`,
      JSON.stringify({ url: page.url, title: page.title, ...page.metadata }, null, 2),
      'application/json'
    );

    return docId;
  }
}
