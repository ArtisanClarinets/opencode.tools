export class GitleaksScanner {
  scan(target: string, rules: string[]): Promise<any> {
    return Promise.resolve({ findings: [] });
  }
}