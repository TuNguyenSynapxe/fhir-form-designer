import type { Workspace, Template } from '../shared/types';

// Extended workspace type for exported workspaces that include templates
export interface ExportedWorkspace extends Workspace {
  templates: Template[];
}

/**
 * Decode a base64 encoded workspace
 */
export function decodeWorkspace(base64String: string): ExportedWorkspace {
  try {
    const decodedString = atob(base64String);
    const workspace = JSON.parse(decodedString) as ExportedWorkspace;
    
    if (!workspace || typeof workspace !== 'object') {
      throw new Error('Invalid workspace format');
    }
    
    if (!workspace.templates || !Array.isArray(workspace.templates)) {
      throw new Error('Workspace must contain a templates array');
    }
    
    return workspace;
  } catch (error) {
    throw new Error(`Failed to decode workspace: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Find a template by name within a workspace
 */
export function findTemplateByName(workspace: ExportedWorkspace, templateName: string): Template | null {
  if (!workspace.templates || !Array.isArray(workspace.templates)) {
    return null;
  }
  
  return workspace.templates.find((template: Template) => template.name === templateName) || null;
}

/**
 * Get all available template names from a workspace
 */
export function getAvailableTemplateNames(workspace: ExportedWorkspace): string[] {
  if (!workspace.templates || !Array.isArray(workspace.templates)) {
    return [];
  }
  
  return workspace.templates.map((template: Template) => template.name);
}

/**
 * Validate that a template is compatible with given FHIR data
 */
export function validateTemplateCompatibility(template: Template, data: any): boolean {
  if (!template || !data) return false;
  
  // Check if resourceType matches
  const dataResourceType = data.resourceType;
  if (template.resourceType && dataResourceType && template.resourceType !== dataResourceType) {
    console.warn(`Template resourceType "${template.resourceType}" doesn't match data resourceType "${dataResourceType}"`);
    return false;
  }
  
  return true;
}