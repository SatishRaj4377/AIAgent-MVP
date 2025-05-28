import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private store: Record<string, any> = {};

  save(nodeId: string, cfg: any) {
    this.store[nodeId] = cfg;
    console.log(`Config saved for ${nodeId}:`, cfg);
  }

  get(nodeId: string): any {
    return this.store[nodeId];
  }
}
