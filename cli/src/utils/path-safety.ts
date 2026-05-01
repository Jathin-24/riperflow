import path from 'node:path';

export class PathTraversalError extends Error {
  constructor(public readonly candidate: string, public readonly allowedRoots: string[]) {
    super(`Path '${candidate}' resolves outside the allowed roots: ${allowedRoots.join(', ')}`);
    this.name = 'PathTraversalError';
  }
}

/**
 * Throws PathTraversalError if `candidate` doesn't resolve under at least one
 * of `allowedRoots`. Both sides are passed through path.resolve() so symlink
 * targets aren't followed (we only stop lexical traversal here, which is the
 * common attack class). For paranoid use, wrap with fs.realpath on both sides
 * — but that requires the path to exist, so do it after this gate.
 */
export function assertWithinDir(candidate: string, allowedRoots: string[]): void {
  const resolved = path.resolve(candidate);
  const ok = allowedRoots.some((root) => {
    const r = path.resolve(root);
    // Allow the root itself or any descendant. Append separator to prevent
    // '/foo' matching '/foobar'.
    return resolved === r || resolved.startsWith(r + path.sep);
  });
  if (!ok) {
    throw new PathTraversalError(candidate, allowedRoots);
  }
}
