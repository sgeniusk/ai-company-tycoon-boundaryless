declare module "node:fs" {
  export function readFileSync(path: URL | string, encoding: string): string;
  export function mkdtempSync(prefix: string): string;
  export function mkdirSync(path: string, options?: { recursive?: boolean }): void;
  export function writeFileSync(path: string, data: string): void;
}

declare module "node:os" {
  export function tmpdir(): string;
}

declare module "node:path" {
  export function join(...paths: string[]): string;
}

declare module "node:child_process" {
  export function execFileSync(file: string, args?: readonly string[], options?: { cwd?: string; env?: Record<string, string | undefined> }): Buffer;
}

declare module "node:url" {
  export function fileURLToPath(url: URL | string): string;
}

declare module "node:process" {
  export const env: Record<string, string | undefined>;
}
