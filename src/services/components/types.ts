
import { ComponentType } from '../../types';

export interface ComponentObject {
  id: string;
  type: ComponentType;
  name: string;
  properties: Record<string, any>;
  methods: string[];
  events: string[];
}

export type ComponentSchema = {
  properties: { name: string; type: 'number' | 'boolean' | 'string' | 'color'; default: number | boolean | string; min?: number; max?: number; unit?: string; description?: string }[];
  methods: { name: string; description: string; params: { name: string; type: string }[] }[];
  events: string[];
};

export type ComponentSchemaMap = Record<string, ComponentSchema>;
