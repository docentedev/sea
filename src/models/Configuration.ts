export interface Configuration {
  id: number;
  name: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface CreateConfigurationData {
  name: string;
  value: string;
}

export interface UpdateConfigurationData {
  name?: string;
  value?: string;
}