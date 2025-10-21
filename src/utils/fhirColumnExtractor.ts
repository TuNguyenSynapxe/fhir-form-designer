// FHIR Path Column Value Extractor for List Viewer tables
import { get } from 'lodash';
import type { FhirResource, ColumnConfig } from '../shared/types';

export interface ExtractedColumnData {
  [columnId: string]: string | number | boolean | Date | null;
}

export class FhirColumnExtractor {
  
  /**
   * Extract all column values from a FHIR resource
   */
  extractRowData(resource: FhirResource, columns: ColumnConfig[]): ExtractedColumnData {
    const rowData: ExtractedColumnData = {};

    columns.forEach(column => {
      try {
        const rawValue = this.extractColumnValue(resource, column);
        rowData[column.id] = this.formatValueByType(rawValue, column.type);
      } catch (error) {
        console.warn(`Error extracting column ${column.id}:`, error);
        rowData[column.id] = null;
      }
    });

    return rowData;
  }

  /**
   * Extract a single column value from a FHIR resource
   */
  private extractColumnValue(resource: FhirResource, column: ColumnConfig): any {
    const { fhirPath } = column;

    // Handle special FHIR path expressions
    if (fhirPath.includes('telecom.find(')) {
      return this.extractTelecomValue(resource, fhirPath);
    }

    if (fhirPath.includes(' + ')) {
      return this.evaluateStringConcatenation(resource, fhirPath);
    }

    // Use lodash.get for standard path extraction
    return get(resource, fhirPath);
  }

  /**
   * Extract telecom values (phone, email, etc.)
   */
  private extractTelecomValue(resource: any, fhirPath: string): string | null {
    try {
      // Handle patterns like: telecom.find(t => t.system === 'phone').value
      const systemMatch = fhirPath.match(/telecom\.find\([^)]*system\s*===\s*['"]([^'"]+)['"]/);
      if (!systemMatch) {
        return null;
      }

      const systemType = systemMatch[1];
      const telecom = resource.telecom || [];
      const telecomItem = telecom.find((item: any) => item.system === systemType);
      
      return telecomItem?.value || null;
    } catch (error) {
      console.warn('Error extracting telecom value:', error);
      return null;
    }
  }

  /**
   * Evaluate string concatenation expressions
   * Handles patterns like: "name[0].family + ', ' + name[0].given[0]"
   */
  private evaluateStringConcatenation(resource: any, expression: string): string {
    try {
      // Split by ' + ' and process each part
      const parts = expression.split(' + ');
      const values: string[] = [];

      parts.forEach(part => {
        const trimmed = part.trim();
        
        // Handle string literals (quoted strings)
        if ((trimmed.startsWith("'") && trimmed.endsWith("'")) ||
            (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
          values.push(trimmed.slice(1, -1)); // Remove quotes
        } else {
          // Handle FHIR path
          const pathValue = get(resource, trimmed);
          values.push(pathValue ? String(pathValue) : '');
        }
      });

      return values.filter(v => v).join('');
    } catch (error) {
      console.warn('Error evaluating string concatenation:', error);
      return '';
    }
  }

  /**
   * Format extracted value based on column type
   */
  private formatValueByType(value: any, type: ColumnConfig['type']): string | number | boolean | Date | null {
    if (value === null || value === undefined) {
      return null;
    }

    switch (type) {
      case 'text':
        return String(value);

      case 'number':
        const numValue = Number(value);
        return isNaN(numValue) ? null : numValue;

      case 'boolean':
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
          const lowerValue = value.toLowerCase();
          if (lowerValue === 'true' || lowerValue === 'yes' || lowerValue === '1') return true;
          if (lowerValue === 'false' || lowerValue === 'no' || lowerValue === '0') return false;
        }
        return Boolean(value);

      case 'date':
        try {
          const dateValue = new Date(value);
          return isNaN(dateValue.getTime()) ? null : dateValue;
        } catch {
          return null;
        }

      default:
        return String(value);
    }
  }

  /**
   * Format display value for table rendering
   */
  formatDisplayValue(value: any, type: ColumnConfig['type']): string {
    if (value === null || value === undefined) {
      return 'N/A';
    }

    switch (type) {
      case 'boolean':
        return value ? 'Yes' : 'No';

      case 'date':
        if (value instanceof Date) {
          return value.toLocaleDateString();
        }
        try {
          return new Date(value).toLocaleDateString();
        } catch {
          return String(value);
        }

      case 'number':
        return Number(value).toLocaleString();

      default:
        return String(value);
    }
  }

  /**
   * Validate FHIR path against sample data
   */
  validateFhirPath(fhirPath: string, sampleData: FhirResource): { 
    isValid: boolean; 
    error?: string; 
    sampleValue?: any;
  } {
    try {
      const extractedValue = this.extractColumnValue(sampleData, { 
        id: 'test', 
        header: 'test', 
        fhirPath, 
        sortable: false, 
        filterable: false,
        type: 'text',
        width: 'auto'
      });
      
      return {
        isValid: true,
        sampleValue: extractedValue
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Invalid FHIR path'
      };
    }
  }

  /**
   * Get suggested FHIR paths for a given resource type
   */
  getSuggestedPaths(resourceType: string): { path: string; label: string; type: ColumnConfig['type'] }[] {
    const suggestions: { path: string; label: string; type: ColumnConfig['type'] }[] = [];

    if (resourceType === 'Patient') {
      suggestions.push(
        { path: 'id', label: 'Patient ID', type: 'text' },
        { path: 'name[0].family', label: 'Last Name', type: 'text' },
        { path: 'name[0].given[0]', label: 'First Name', type: 'text' },
        { path: "name[0].family + ', ' + name[0].given[0]", label: 'Full Name', type: 'text' },
        { path: 'gender', label: 'Gender', type: 'text' },
        { path: 'birthDate', label: 'Birth Date', type: 'date' },
        { path: 'active', label: 'Active', type: 'boolean' },
        { path: "telecom.find(t => t.system === 'phone').value", label: 'Phone', type: 'text' },
        { path: "telecom.find(t => t.system === 'email').value", label: 'Email', type: 'text' },
        { path: 'address[0].city', label: 'City', type: 'text' },
        { path: 'address[0].state', label: 'State', type: 'text' },
        { path: 'address[0].postalCode', label: 'Postal Code', type: 'text' },
        { path: 'maritalStatus.coding[0].display', label: 'Marital Status', type: 'text' }
      );
    }

    return suggestions;
  }

  /**
   * Extract parameter value for detail URL construction
   */
  extractParameterValue(resource: FhirResource, paramFhirPath: string): string | null {
    try {
      const value = this.extractColumnValue(resource, {
        id: 'param',
        header: 'param',
        fhirPath: paramFhirPath,
        sortable: false,
        filterable: false,
        type: 'text',
        width: 'auto'
      });
      
      return value ? String(value) : null;
    } catch (error) {
      console.warn('Error extracting parameter value:', error);
      return null;
    }
  }
}

// Default extractor instance
export const fhirColumnExtractor = new FhirColumnExtractor();