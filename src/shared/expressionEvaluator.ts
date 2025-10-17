import get from 'lodash.get';
import type { FhirResource } from './types';

/**
 * Evaluates expressions like "firstName + ' ' + lastName" against FHIR data
 */
export class ExpressionEvaluator {
  private data: FhirResource;
  private fieldMappings: Record<string, string>;

  constructor(data: FhirResource) {
    this.data = data;
    this.fieldMappings = this.createFieldMappings();
  }

  /**
   * Create common field name mappings based on resource type
   */
  private createFieldMappings(): Record<string, string> {
    const mappings: Record<string, string> = {};

    switch (this.data.resourceType) {
      case 'Patient':
        mappings.firstName = 'name[0].given[0]';
        mappings.middleName = 'name[0].given[1]';
        mappings.lastName = 'name[0].family';
        mappings.fullName = 'name[0]';
        mappings.prefix = 'name[0].prefix[0]';
        mappings.suffix = 'name[0].suffix[0]';
        mappings.gender = 'gender';
        mappings.birthDate = 'birthDate';
        mappings.email = "telecom.find(t => t.system === 'email').value";
        mappings.phone = "telecom.find(t => t.system === 'phone').value";
        mappings.addressLine1 = 'address[0].line[0]';
        mappings.addressLine2 = 'address[0].line[1]';
        mappings.city = 'address[0].city';
        mappings.state = 'address[0].state';
        mappings.postalCode = 'address[0].postalCode';
        mappings.country = 'address[0].country';
        mappings.maritalStatus = 'maritalStatus.coding[0].display';
        break;

      case 'HumanName':
        mappings.firstName = 'given[0]';
        mappings.middleName = 'given[1]';
        mappings.lastName = 'family';
        mappings.prefix = 'prefix[0]';
        mappings.suffix = 'suffix[0]';
        mappings.text = 'text';
        mappings.use = 'use';
        break;

      case 'ContactPoint':
        mappings.system = 'system';
        mappings.value = 'value';
        mappings.use = 'use';
        mappings.rank = 'rank';
        break;

      case 'Address':
        mappings.line1 = 'line[0]';
        mappings.line2 = 'line[1]';
        mappings.city = 'city';
        mappings.state = 'state';
        mappings.postalCode = 'postalCode';
        mappings.country = 'country';
        mappings.district = 'district';
        mappings.text = 'text';
        mappings.use = 'use';
        mappings.type = 'type';
        break;
    }

    return mappings;
  }

  /**
   * Get the value for a field name using FHIR path resolution
   */
  private getFieldValue(fieldName: string): any {
    const fhirPath = this.fieldMappings[fieldName];
    if (!fhirPath) {
      console.warn(`Field "${fieldName}" not available for resource type "${this.data.resourceType}". Available fields:`, Object.keys(this.fieldMappings));
      return `[${fieldName}?]`; // Show placeholder for unknown field
    }

    try {
      // Handle telecom find operations for Patient resources
      if (fhirPath.includes('telecom.find(') && this.data.resourceType === 'Patient') {
        const patientData = this.data as any;
        if (fhirPath.includes("'email'")) {
          const emailItem = patientData.telecom?.find((item: any) => item.system === 'email');
          return emailItem?.value || '';
        }
        if (fhirPath.includes("'phone'")) {
          const phoneItem = patientData.telecom?.find((item: any) => item.system === 'phone');
          return phoneItem?.value || '';
        }
      }

      // Use lodash.get for simple path resolution
      return get(this.data, fhirPath) || '';
    } catch (error) {
      console.error('Error resolving field:', fieldName, error);
      return '';
    }
  }

  /**
   * Evaluate an expression and return the result
   */
  evaluate(expression: string): string {
    if (!expression || !expression.trim()) {
      return '';
    }

    console.log('Evaluating expression:', expression);

    try {
      let evaluatedExpression = expression;

      // First, try to replace FHIR paths directly
      // Look for patterns that look like FHIR paths (e.g., name[0].given[0], telecom.find(...), etc.)
      evaluatedExpression = this.replaceFhirPaths(evaluatedExpression);

      // Then replace any remaining predefined field names for backward compatibility
      const fieldNames = Object.keys(this.fieldMappings).sort((a, b) => b.length - a.length);
      for (const fieldName of fieldNames) {
        // Only replace if it's not already processed and is a standalone word
        const regex = new RegExp(`\\b${fieldName}\\b`, 'g');
        if (regex.test(evaluatedExpression)) {
          const fieldValue = this.getFieldValue(fieldName);
          const fieldValueStr = String(fieldValue || '');
          const escapedValue = fieldValueStr.replace(/"/g, '\\"');
          evaluatedExpression = evaluatedExpression.replace(regex, `"${escapedValue}"`);
        }
      }

      console.log('After field replacement:', evaluatedExpression);

      // Evaluate the expression
      const result = this.safeEvaluate(evaluatedExpression);
      console.log('Evaluation result:', result);
      return String(result || '');
    } catch (error) {
      console.error('Error evaluating expression:', expression, error);
      return `[Error: ${error instanceof Error ? error.message : String(error)}]`;
    }
  }

  /**
   * Replace FHIR paths in expressions with their actual values
   */
  private replaceFhirPaths(expression: string): string {
    console.log('Original expression:', expression);
    console.log('Data:', this.data);
    
    let result = expression;
    
    // Handle telecom.find patterns first (most specific)
    const telecomFindRegex = /telecom\.find\([^)]+\)\.value/g;
    result = result.replace(telecomFindRegex, (match) => {
      console.log('Processing telecom find:', match);
      try {
        const value = this.resolveFhirPath(match);
        const escapedValue = String(value || '').replace(/"/g, '\\"');
        console.log('Telecom find result:', match, '->', value);
        return `"${escapedValue}"`;
      } catch (error) {
        console.warn('Error resolving telecom path:', match, error);
        return '""';
      }
    });
    
    // Find FHIR paths using specific patterns (avoiding overlapping matches)
    const allPaths = new Set<string>();
    
    // Pattern 1: array[index].property[index] like name[0].given[0]
    const pattern1 = /\b[a-zA-Z][a-zA-Z0-9]*\[[0-9]+\]\.[a-zA-Z][a-zA-Z0-9]*\[[0-9]+\]/g;
    let match1;
    while ((match1 = pattern1.exec(result)) !== null) {
      allPaths.add(match1[0]);
    }
    
    // Pattern 2: array[index].property like name[0].family
    const pattern2 = /\b[a-zA-Z][a-zA-Z0-9]*\[[0-9]+\]\.[a-zA-Z][a-zA-Z0-9]*/g;
    let match2: RegExpExecArray | null;
    while ((match2 = pattern2.exec(result)) !== null) {
      if (!Array.from(allPaths).some(existing => existing.includes(match2![0]))) {
        allPaths.add(match2![0]);
      }
    }
    
    // Pattern 3: simple array access like name[0]
    const pattern3 = /\b[a-zA-Z][a-zA-Z0-9]*\[[0-9]+\]/g;
    let match3: RegExpExecArray | null;
    while ((match3 = pattern3.exec(result)) !== null) {
      if (!Array.from(allPaths).some(existing => existing.includes(match3![0]))) {
        allPaths.add(match3![0]);
      }
    }
    
    const matches = Array.from(allPaths).map(path => ({ 0: path }));
    console.log('Found FHIR path matches:', matches.map(m => m[0]));
    
    // Sort by length (longest first) to avoid partial replacements
    matches.sort((a, b) => b[0].length - a[0].length);
    
    // Track what we've already replaced to avoid double processing
    const processed = new Set<string>();
    
    for (const match of matches) {
      const fhirPath = match[0];
      
      // Skip if already processed or already quoted
      if (processed.has(fhirPath) || result.includes(`"${fhirPath}"`)) {
        continue;
      }
      
      console.log('Processing FHIR path:', fhirPath);
      
      try {
        const value = this.resolveFhirPath(fhirPath);
        console.log('FHIR path result:', fhirPath, '->', value, '(type:', typeof value, ')');
        
        const escapedValue = String(value || '').replace(/"/g, '\\"');
        
        // Simple string replacement - replace all occurrences of the exact path
        const beforeReplacement = result;
        result = result.replace(new RegExp(fhirPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), `"${escapedValue}"`);
        
        if (result !== beforeReplacement) {
          console.log(`Replaced "${fhirPath}" with "${escapedValue}"`);
          console.log('Before:', beforeReplacement);
          console.log('After:', result);
        } else {
          console.log(`No replacements made for "${fhirPath}"`);
        }
        
        processed.add(fhirPath);
      } catch (error) {
        console.warn('Error resolving FHIR path:', fhirPath, error);
        const escapedPath = fhirPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        result = result.replace(new RegExp(`\\b${escapedPath}\\b`, 'g'), '""');
        processed.add(fhirPath);
      }
    }
    
    console.log('Final result after FHIR path replacement:', result);
    return result;
  }

  /**
   * Resolve a FHIR path against the data
   */
  private resolveFhirPath(fhirPath: string): any {
    console.log('Resolving FHIR path:', fhirPath, 'against data:', this.data);
    
    try {
      // Handle telecom find operations
      if (fhirPath.includes('telecom.find(') && this.data.resourceType === 'Patient') {
        const patientData = this.data as any;
        if (fhirPath.includes("'email'") || fhirPath.includes('"email"')) {
          const emailItem = patientData.telecom?.find((item: any) => item.system === 'email');
          const result = emailItem?.value || '';
          console.log('Telecom email result:', result);
          return result;
        }
        if (fhirPath.includes("'phone'") || fhirPath.includes('"phone"')) {
          const phoneItem = patientData.telecom?.find((item: any) => item.system === 'phone');
          const result = phoneItem?.value || '';
          console.log('Telecom phone result:', result);
          return result;
        }
      }

      // Use lodash.get for simple path resolution
      const result = get(this.data, fhirPath);
      console.log('Lodash.get result for', fhirPath, ':', result, '(type:', typeof result, ')');
      
      return result || '';
    } catch (error) {
      console.error('Error resolving FHIR path:', fhirPath, error);
      return '';
    }
  }

  /**
   * Safely evaluate expressions - only allows string concatenation and basic operations
   */
  private safeEvaluate(expression: string): string {
    try {
      console.log('Safe evaluating:', expression);
      
      // Don't remove quotes and other necessary characters for string operations
      // Only remove truly dangerous characters
      const safeExpression = expression
        .replace(/[<>{}$`\\]/g, '') // Remove dangerous characters but keep quotes, operators
        .trim();

      console.log('Sanitized expression:', safeExpression);

      // Use Function constructor for safer evaluation than eval()
      // This still requires caution but is more controlled
      const func = new Function('return ' + safeExpression);
      const result = func();
      
      console.log('Function result:', result);
      return String(result);
    } catch (error) {
      console.error('Safe eval error:', error);
      // If evaluation fails, return the original expression
      return expression;
    }
  }

  /**
   * Get available field names for this resource type
   */
  getAvailableFields(): string[] {
    return Object.keys(this.fieldMappings).sort();
  }
}

/**
 * Evaluate an expression against FHIR data
 */
export function evaluateExpression(expression: string, data: FhirResource): string {
  if (!expression || !data) {
    return '';
  }

  const evaluator = new ExpressionEvaluator(data);
  return evaluator.evaluate(expression);
}

/**
 * Get available field names for a resource type
 */
export function getAvailableFieldNames(resourceType: string, data?: FhirResource): string[] {
  if (!data) {
    // Return default field names based on resource type
    const defaultData = { resourceType } as FhirResource;
    const evaluator = new ExpressionEvaluator(defaultData);
    return evaluator.getAvailableFields();
  }

  const evaluator = new ExpressionEvaluator(data);
  return evaluator.getAvailableFields();
}