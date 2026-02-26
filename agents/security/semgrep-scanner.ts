export class SemgrepScanner {
  scan(target: string, rules: string[]): Promise<any> {
    return Promise.resolve({ findings: [] });
  }
}