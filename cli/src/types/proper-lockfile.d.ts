declare module 'proper-lockfile' {
  export function lock(file: string, options?: {
    stale?: number;
    updateInterval?: number;
    retries?: number;
    realpath?: boolean;
  }): Promise<() => Promise<void>>;
  
  export function check(file: string): Promise<boolean>;
}
