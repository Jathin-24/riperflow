import { EventEmitter } from 'events';
import { getMCPServer, MCPServerConfig } from './servers.js';

export interface MCPRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params?: Record<string, unknown>;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export class MCPClient extends EventEmitter {
  private id: number = 0;
  private connected: boolean = false;

  constructor(private serverName: string) {
    super();
  }

  async connect(): Promise<boolean> {
    const server = getMCPServer(this.serverName);
    if (!server) {
      this.emit('error', `Unknown server: ${this.serverName}`);
      return false;
    }

    this.connected = true;
    this.emit('connected', server);
    return true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.emit('disconnected');
  }

  isConnected(): boolean {
    return this.connected;
  }

  async callTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    if (!this.connected) {
      throw new Error('Not connected to MCP server');
    }

    const request: MCPRequest = {
      jsonrpc: '2.0',
      id: ++this.id,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    };

    this.emit('request', request);
    return { success: true, request };
  }

  async listTools(): Promise<string[]> {
    if (!this.connected) {
      throw new Error('Not connected to MCP server');
    }

    return ['tool1', 'tool2'];
  }

  getServerConfig(): MCPServerConfig | undefined {
    return getMCPServer(this.serverName);
  }
}

export function createMCPClient(serverName: string): MCPClient {
  return new MCPClient(serverName);
}
