import React from 'react';
import { useTheme } from './ThemeProvider';
import type { Template, FhirResource, TemplateField, TwoColumnField } from '../shared/types';
import get from 'lodash.get';
import { evaluateExpression } from '../shared/expressionEvaluator';

interface ThemedPreviewProps {
  template: Template;
  sampleData: FhirResource;
}

const ThemedPreview: React.FC<ThemedPreviewProps> = ({ template, sampleData }) => {
  const { theme, currentTheme } = useTheme();

  const getFieldValue = (fhirPath: string, data: FhirResource | null): any => {
    if (!fhirPath || !data) return '';
    
    try {
      // Handle special cases for telecom arrays (Patient resource only)
      if (fhirPath.includes('telecom.find(t => t.system === "email").value')) {
        const telecom = (data as any).telecom || [];
        const emailEntry = telecom.find((t: any) => t.system === 'email');
        return emailEntry?.value || '';
      }
      
      if (fhirPath.includes('telecom.find(t => t.system === "phone").value')) {
        const telecom = (data as any).telecom || [];
        const phoneEntry = telecom.find((t: any) => t.system === 'phone');
        return phoneEntry?.value || '';
      }
      
      // Handle special cases for contact arrays (Patient resource)
      if (fhirPath.includes("contact[0].telecom.find(t => t.system === 'phone').value")) {
        const contact = (data as any).contact?.[0];
        if (contact?.telecom) {
          const phoneEntry = contact.telecom.find((t: any) => t.system === 'phone');
          return phoneEntry?.value || '';
        }
        return '';
      }
      
      // Use lodash.get for other paths
      return get(data, fhirPath) || '';
    } catch (error) {
      console.error('Error resolving FHIR path:', fhirPath, error);
      return '';
    }
  };

  const renderField = (field: TemplateField): React.ReactNode => {
    const value = getFieldValue(field.fhirPath || '', sampleData);
    const shouldShowLabel = !field.hideLabel;

    switch (field.type) {
      case 'text':
      case 'date':
      case 'select':
      case 'radio':
        return (
          <div key={field.id} className="themed-component mb-4">
            {shouldShowLabel && (
              <label className="block text-sm font-medium mb-2 themed-text-secondary">
                {field.label}
              </label>
            )}
            <div 
              className="w-full px-3 py-2 border rounded-md themed-field"
              style={{
                backgroundColor: theme.colors.field.background,
                borderColor: theme.colors.field.border,
                color: theme.colors.text.primary,
              }}
            >
              {String(value) || 'N/A'}
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="themed-component mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={Boolean(value)}
                readOnly
                className="h-4 w-4 rounded"
                style={{
                  accentColor: theme.colors.primary,
                }}
              />
              {shouldShowLabel && (
                <label className="ml-2 text-sm themed-text-primary">
                  {field.label}
                </label>
              )}
            </div>
          </div>
        );

      case 'label':
        return (
          <div key={field.id} className="themed-component mb-4">
            <div 
              className="text-lg font-semibold themed-text-primary"
              style={{ color: theme.colors.text.primary }}
            >
              {field.label}
            </div>
          </div>
        );

      case 'group':
        const groupField = field as any; // GroupField type needs fixing
        return (
          <div key={field.id} className="themed-component mb-6">
            <div 
              className="border rounded-lg overflow-hidden"
              style={{
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
              }}
            >
              <div 
                className="px-4 py-3 border-b font-medium"
                style={{
                  backgroundColor: theme.colors.field.background,
                  borderBottomColor: theme.colors.border,
                  color: theme.colors.text.primary,
                }}
              >
                {field.label}
              </div>
              <div className="p-4">
                {groupField.children?.map((subField: TemplateField) => renderField(subField))}
              </div>
            </div>
          </div>
        );

      case 'twoColumn':
        const twoColField = field as TwoColumnField;
        return (
          <div key={field.id} className="themed-component mb-6">
            <div 
              className="border rounded-lg p-4"
              style={{
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  {twoColField.leftColumn?.map(subField => renderField(subField))}
                </div>
                <div>
                  {twoColField.rightColumn?.map(subField => renderField(subField))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div key={field.id} className="themed-component mb-4">
            {shouldShowLabel && (
              <label className="block text-sm font-medium mb-2 themed-text-secondary">
                {field.label}
              </label>
            )}
            <div 
              className="w-full px-3 py-2 border rounded-md themed-field"
              style={{
                backgroundColor: theme.colors.field.background,
                borderColor: theme.colors.field.border,
                color: theme.colors.text.primary,
              }}
            >
              {String(value) || 'N/A'}
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      className="themed-component min-h-full p-6"
      data-theme={currentTheme}
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.text.primary,
      }}
    >
      <div 
        className="max-w-2xl mx-auto p-6 rounded-lg shadow-lg themed-surface"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }}
      >
        <div className="mb-6">
          <h1 
            className="text-2xl font-bold mb-2"
            style={{ color: theme.colors.text.primary }}
          >
            {template.name}
          </h1>
          {template.description && (
            <p 
              className="text-sm themed-text-muted"
              style={{ color: theme.colors.text.muted }}
            >
              {template.description}
            </p>
          )}
        </div>
        
        <div className="space-y-4">
          {template.fields?.map(field => renderField(field))}
        </div>
      </div>
    </div>
  );
};

export default ThemedPreview;