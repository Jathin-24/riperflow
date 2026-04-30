import chokidar from 'chokidar';
import path from 'path';
import { EventEmitter } from 'events';
import { loadConfig } from '../config/loader.js';
import { MEMORY_FILES } from '../core/modes.js';

export class FileWatcher extends EventEmitter {
  private watcher: chokidar.FSWatcher | null = null;
  private projectPath: string;
  private memoryBankPath: string;
  private riperDirPath: string;
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(projectPath: string) {
    super();
    this.projectPath = projectPath;
    this.memoryBankPath = path.join(projectPath, 'memory-bank');
    this.riperDirPath = path.join(projectPath, '.riper');
  }

  async start(): Promise<void> {
    if (this.watcher) {
      return;
    }

    const watchPaths = [
      path.join(this.memoryBankPath, '*.md'),
      path.join(this.riperDirPath, 'state.json'),
      path.join(this.riperDirPath, 'config.json')
    ];

    this.watcher = chokidar.watch(watchPaths, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 100
      }
    });

    this.watcher
      .on('change', (filePath) => this.handleChange('change', filePath))
      .on('add', (filePath) => this.handleChange('add', filePath))
      .on('unlink', (filePath) => this.handleChange('unlink', filePath))
      .on('error', (error) => {
        console.error('File watcher error:', error);
      });

    console.log('File watcher started');
  }

  private handleChange(event: string, filePath: string): void {
    const relativePath = path.relative(this.projectPath, filePath);
    const existingTimer = this.debounceTimers.get(relativePath);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      this.debounceTimers.delete(relativePath);
      this.emit('fileChange', {
        event,
        path: relativePath,
        absolutePath: filePath,
        timestamp: new Date().toISOString()
      });
    }, 300);

    this.debounceTimers.set(relativePath, timer);
  }

  async stop(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
      console.log('File watcher stopped');
    }
  }

  isWatching(): boolean {
    return this.watcher !== null;
  }

  getWatchedPaths(): string[] {
    if (!this.watcher) {
      return [];
    }
    return Object.keys(this.watcher.getWatched());
  }
}

let fileWatcherInstance: FileWatcher | null = null;

export async function createFileWatcher(projectPath: string): Promise<FileWatcher> {
  if (fileWatcherInstance) {
    await fileWatcherInstance.stop();
  }
  fileWatcherInstance = new FileWatcher(projectPath);
  await fileWatcherInstance.start();
  return fileWatcherInstance;
}

export function getFileWatcher(): FileWatcher | null {
  return fileWatcherInstance;
}

export async function stopFileWatcher(): Promise<void> {
  if (fileWatcherInstance) {
    await fileWatcherInstance.stop();
    fileWatcherInstance = null;
  }
}
