import { BaseAdapter, AdapterConfig } from './base.js';
import { generateToolRules } from './rules-generator.js';

export class KiloCodeAdapter extends BaseAdapter {
  constructor(projectPath: string) {
    const config: AdapterConfig = {
      name: 'kilocode',
      displayName: 'KiloCode',
      configDir: '.kilocode',
      rulesDir: 'rules',
      ruleExtension: '.md'
    };
    super(config, projectPath);
  }

  getRulesContent(): string {
    return generateToolRules('kilocode');
  }
}
