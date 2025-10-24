import { DatabaseSync } from 'node:sqlite';
import { DatabaseConnection } from '../database/connection.js';
import { ConfigurationRepository } from '../repositories/ConfigurationRepository.js';
import { Configuration, CreateConfigurationData, UpdateConfigurationData } from '../models/Configuration.js';

export class ConfigurationService {
  private db: DatabaseSync;
  private configRepo: ConfigurationRepository;

  constructor() {
    this.db = DatabaseConnection.getConnection();
    this.configRepo = new ConfigurationRepository(this.db);
  }

  // Configuration management
  getAllConfigurations(): Configuration[] {
    return this.configRepo.findAll();
  }

  getConfigurationById(id: number): Configuration | null {
    return this.configRepo.findById(id);
  }

  getConfigurationByName(name: string): Configuration | null {
    return this.configRepo.findByName(name);
  }

  createConfiguration(data: CreateConfigurationData): Configuration {
    // Validate configuration name
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Configuration name is required');
    }

    // Check if configuration already exists
    const existing = this.configRepo.findByName(data.name);
    if (existing) {
      throw new Error(`Configuration '${data.name}' already exists`);
    }

    return this.configRepo.create(data);
  }

  updateConfiguration(id: number, data: UpdateConfigurationData): Configuration | null {
    const existing = this.configRepo.findById(id);
    if (!existing) {
      throw new Error('Configuration not found');
    }

    // If updating name, check for conflicts
    if (data.name && data.name !== existing.name) {
      const nameExists = this.configRepo.findByName(data.name);
      if (nameExists) {
        throw new Error(`Configuration '${data.name}' already exists`);
      }
    }

    return this.configRepo.update(id, data);
  }

  deleteConfiguration(id: number): boolean {
    const existing = this.configRepo.findById(id);
    if (!existing) {
      throw new Error('Configuration not found');
    }

    return this.configRepo.delete(id);
  }

  // Utility methods for getting configuration values
  getConfigValue(name: string): string | null {
    return this.configRepo.getValue(name);
  }

  setConfigValue(name: string, value: string): Configuration {
    return this.configRepo.setValue(name, value);
  }

  // Specific configuration getters
  getUploadPath(): string {
    const path = this.getConfigValue('upload_path');
    if (!path) {
      throw new Error('Upload path configuration not found');
    }
    return path;
  }

  setUploadPath(path: string): Configuration {
    if (!path || path.trim().length === 0) {
      throw new Error('Upload path cannot be empty');
    }
    return this.setConfigValue('upload_path', path);
  }
}