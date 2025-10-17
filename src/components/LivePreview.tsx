import React from 'react';
import get from 'lodash.get';
import type { LivePreviewProps, TemplateField, FhirResource, Template, TwoColumnField } from '../shared/types';
import { evaluateExpression } from '../shared/expressionEvaluator';

const LivePreview: React.FC<LivePreviewProps> = ({ template, sampleData }) => {
  const getResourceIcon = (resourceType: string): string => {
    switch (resourceType) {
      case 'Patient': return '👤';
      case 'HumanName': return '📝';
      case 'ContactPoint': return '📞';
      case 'Address': return '🏠';
      default: return '📋';
    }
  };

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

  const generateItemLabel = (item: any, resourceType: string, index: number): string => {
    if (!item) return `Item ${index + 1}`;
    
    try {
      switch (resourceType) {
        case 'HumanName':
          // Try to create a label from name components
          const given = item.given?.[0] || item.firstName;
          const family = item.family || item.lastName;
          if (given || family) {
            return [given, family].filter(Boolean).join(' ');
          }
          // Fallback to use/prefix if available
          if (item.use) return `${item.use.charAt(0).toUpperCase() + item.use.slice(1)} Name`;
          if (item.prefix) return `${item.prefix} Name`;
          break;
          
        case 'ContactPoint':
          // Try to create a label from system and value
          const system = item.system || 'Contact';
          const value = item.value;
          if (value) {
            const systemLabel = system.charAt(0).toUpperCase() + system.slice(1);
            return `${systemLabel}: ${value}`;
          }
          if (item.use) return `${item.use.charAt(0).toUpperCase() + item.use.slice(1)} ${system}`;
          return `${system.charAt(0).toUpperCase() + system.slice(1)} Contact`;
          
        case 'Address':
          // Try to create a label from address components
          const line1 = item.line?.[0] || item.street;
          const city = item.city;
          const state = item.state;
          
          if (line1 && city) {
            return `${line1}, ${city}`;
          } else if (city && state) {
            return `${city}, ${state}`;
          } else if (city) {
            return city;
          } else if (line1) {
            return line1;
          }
          
          // Fallback to use if available
          if (item.use) return `${item.use.charAt(0).toUpperCase() + item.use.slice(1)} Address`;
          if (item.type) return `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Address`;
          break;
          
        case 'Patient':
          // For patient, try to get name
          const patientName = item.name?.[0];
          if (patientName) {
            const firstName = patientName.given?.[0];
            const lastName = patientName.family;
            if (firstName || lastName) {
              return [firstName, lastName].filter(Boolean).join(' ');
            }
          }
          if (item.id) return `Patient ${item.id}`;
          break;
      }
    } catch (error) {
      console.warn('Error generating item label:', error);
    }
    
    // Fallback to generic numbering
    return `${resourceType} ${index + 1}`;
  };

  const renderNestedWidget = (field: TemplateField): React.ReactNode => {
    const widgetField = field as any;
    const templateId = widgetField.widgetTemplateId;
    const resourceType = widgetField.widgetResourceType;
    
    if (!templateId) {
      return (
        <div key={field.id} className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <span>🧩</span>
            <h4 className="font-medium text-gray-700">{field.label}</h4>
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
              {resourceType}
            </span>
          </div>
          <p className="text-sm text-gray-500">No template selected</p>
        </div>
      );
    }

    // Load the nested template from localStorage
    let nestedTemplate: Template | null = null;
    try {
      const stored = localStorage.getItem('fhir-templates');
      if (stored) {
        const parsed = JSON.parse(stored);
        nestedTemplate = (parsed.templates || []).find((t: Template) => t.id === templateId) || null;
      }
    } catch (error) {
      console.error('Failed to load nested template:', error);
    }

    if (!nestedTemplate) {
      return (
        <div key={field.id} className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <span>🧩</span>
            <h4 className="font-medium text-gray-700">{field.label}</h4>
            <span className="text-xs bg-red-200 text-red-600 px-2 py-1 rounded">
              Error
            </span>
          </div>
          <p className="text-sm text-red-600">Template not found: {templateId}</p>
        </div>
      );
    }

    // Extract nested data from the main data using the field's fhirPath
    let nestedData = null;
    if (field.fhirPath && sampleData) {
      try {
        nestedData = getFieldValue(field.fhirPath, sampleData);
      } catch (error) {
        console.error('Error extracting nested data:', error);
      }
    }
    
    // If no nested data found in main sample data, use nested template's saved sample data
    if (!nestedData && nestedTemplate.sampleData) {
      nestedData = nestedTemplate.sampleData;
    }

    return (
      <React.Fragment key={field.id}>
        {widgetField.multiple && Array.isArray(nestedData) ? (
          // Render multiple instances
          nestedData.length > 0 ? (
            <div className="space-y-4">
              {nestedData.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-700">{generateItemLabel(item, resourceType, index)}</div>
                    <div className="text-xs text-gray-500">{resourceType}</div>
                  </div>
                  <div className="space-y-3">
                    {nestedTemplate!.fields
                      .sort((a, b) => a.order - b.order)
                      .map((nestedField) => renderNestedField(nestedField, item))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
              <span className="block text-2xl mb-2">📭</span>
              <p className="text-sm">No items to display</p>
            </div>
          )
        ) : (
          // Render single instance
          <div className="space-y-3">
            {nestedTemplate.fields
              .sort((a, b) => a.order - b.order)
              .map((nestedField) => renderNestedField(nestedField, nestedData))}
          </div>
        )}
      </React.Fragment>
    );
  };

  const shouldHideField = (field: TemplateField, value: any): boolean => {
    if (!field.hideIfEmpty) return false; // If hideIfEmpty is false/undefined, always show
    
    // Check if value is empty/null/undefined
    if (value === null || value === undefined || value === '') return true;
    
    // For arrays, hide if empty
    if (Array.isArray(value) && value.length === 0) return true;
    
    // For objects, hide if empty object
    if (typeof value === 'object' && Object.keys(value).length === 0) return true;
    
    return false;
  };

  const getDisplayValue = (field: TemplateField, value: any): string => {
    // If field should be hidden, return empty (this shouldn't be called)
    if (shouldHideField(field, value)) return '';
    
    // If no value and hideIfEmpty is false/undefined, show N/A
    if (!value && value !== 0 && value !== false) return 'N/A';
    
    return String(value);
  };

  const renderNestedField = (field: TemplateField, data: any): React.ReactNode => {
    const value = field.fhirPath ? get(data, field.fhirPath) || '' : '';
    
    // Hide field if hideIfEmpty is true and value is empty
    if (shouldHideField(field, value)) return null;

    switch (field.type) {
      case 'label':
        const labelField = field as any;
        return (
          <div
            key={field.id}
            className={`mb-2 ${
              labelField.fontSize === 'xl' ? 'text-xl' :
              labelField.fontSize === 'lg' ? 'text-lg' :
              labelField.fontSize === 'sm' ? 'text-sm' : 'text-base'
            } ${
              labelField.fontWeight === 'bold' ? 'font-bold' : 'font-normal'
            } text-gray-900 flex items-center`}
          >
            <span className="mr-2">🏷️</span>
            {field.label}
          </div>
        );

      case 'text':
        return (
          <div key={field.id} className="mb-4 bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <span>📝</span>
              <dt className="text-sm font-medium text-gray-700">{field.label}</dt>
            </div>
            <dd className="bg-gray-50 px-3 py-2 rounded border text-gray-900">
              {getDisplayValue(field, value)}
            </dd>
          </div>
        );

      case 'date':
        const formattedDate = value ? new Date(value).toLocaleDateString() : getDisplayValue(field, value);
        return (
          <div key={field.id} className="mb-4 bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <span>📅</span>
              <dt className="text-sm font-medium text-gray-700">{field.label}</dt>
            </div>
            <dd className="bg-gray-50 px-3 py-2 rounded border text-gray-900">
              {formattedDate}
            </dd>
          </div>
        );

      case 'select':
        const selectField = field as any;
        const displayValue = selectField.options?.find((opt: any) => opt.value === value)?.label || value || getDisplayValue(field, value);
        return (
          <div key={field.id} className="mb-4 bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <span>📋</span>
              <dt className="text-sm font-medium text-gray-700">{field.label}</dt>
            </div>
            <dd className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {displayValue}
            </dd>
          </div>
        );

      case 'checkbox':
        const isChecked = Boolean(value);
        return (
          <div key={field.id} className="mb-4 bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span>☑️</span>
                <dt className="text-sm font-medium text-gray-700">{field.label}</dt>
              </div>
              <dd className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isChecked 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {isChecked ? '✓ Yes' : '✗ No'}
              </dd>
            </div>
          </div>
        );

      case 'group':
        const groupField = field as any;
        return (
          <div key={field.id} className="mb-6 border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
              <h4 className="text-md font-semibold text-gray-900 flex items-center">
                <span className="mr-2">📁</span>
                {field.label}
              </h4>
            </div>
            <div className="p-4 space-y-2">
              {(groupField.children || [])
                .sort((a: TemplateField, b: TemplateField) => a.order - b.order)
                .map((child: TemplateField) => renderNestedField(child, data))}
            </div>
          </div>
        );

      default:
        return (
          <div key={field.id} className="mb-4 bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <span>❓</span>
              <dt className="text-sm font-medium text-gray-700">{field.label}</dt>
            </div>
            <dd className="bg-gray-50 px-3 py-2 rounded border text-gray-900">
              {getDisplayValue(field, value)}
            </dd>
          </div>
        );
    }
  };

  const renderField = (field: TemplateField): React.ReactNode => {
    // Use expression if available, otherwise fall back to FHIR path
    const value = (field as any).expression && sampleData
      ? evaluateExpression((field as any).expression, sampleData)
      : field.fhirPath 
        ? getFieldValue(field.fhirPath, sampleData) 
        : '';
    
    // Hide field if hideIfEmpty is true and value is empty
    if (shouldHideField(field, value)) return null;

    switch (field.type) {
      case 'label':
        const labelField = field as any;
        return (
          <div
            key={field.id}
            className={`mb-2 ${
              labelField.fontSize === 'sm' ? 'text-sm' :
              labelField.fontSize === 'lg' ? 'text-lg' :
              labelField.fontSize === 'xl' ? 'text-xl' : 'text-base'
            } ${
              labelField.fontWeight === 'bold' ? 'font-bold' : 'font-normal'
            }`}
            style={{ color: labelField.color || 'inherit' }}
          >
            {field.label}
          </div>
        );
        
      case 'text':
        const getTextIcon = () => {
          const label = field.label.toLowerCase();
          if (label.includes('name') || label.includes('first') || label.includes('last')) return '👤';
          if (label.includes('email')) return '📧';
          if (label.includes('phone') || label.includes('tel')) return '📞';
          if (label.includes('address')) return '🏠';
          if (label.includes('city')) return '🏙️';
          if (label.includes('state')) return '🗺️';
          if (label.includes('zip') || label.includes('postal')) return '📮';
          if (label.includes('id')) return '🆔';
          return '📝';
        };

        const formatTextValue = () => {
          if (!value) return getDisplayValue(field, value);
          if (typeof value === 'object') return JSON.stringify(value);
          
          // Format email
          if (field.label.toLowerCase().includes('email') && value.includes('@')) {
            return value;
          }
          
          // Format phone
          if (field.label.toLowerCase().includes('phone') && value.match(/^\+?[\d\s\-\(\)]+$/)) {
            return value;
          }
          
          return value;
        };

        return (
          <div key={field.id} className="flex items-start py-3 border-b border-gray-100 last:border-b-0">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
              <span className="text-lg">{getTextIcon()}</span>
            </div>
            <div className="ml-3 flex-1">
              <dt className="text-sm font-medium text-gray-600">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </dt>
              <dd className="mt-1 text-base text-gray-900 font-medium">
                {formatTextValue()}
              </dd>
            </div>
          </div>
        );
        
      case 'date':
        const formatDate = (dateValue: string) => {
          if (!dateValue) return getDisplayValue(field, dateValue);
          try {
            const date = new Date(dateValue);
            const formatted = date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            
            // Calculate age if this is a birth date
            if (field.label.toLowerCase().includes('birth')) {
              const today = new Date();
              const age = today.getFullYear() - date.getFullYear();
              const monthDiff = today.getMonth() - date.getMonth();
              const finalAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate()) ? age - 1 : age;
              return `${formatted} (Age: ${finalAge})`;
            }
            
            return formatted;
          } catch {
            return dateValue;
          }
        };
        
        return (
          <div key={field.id} className="flex items-start py-3 border-b border-gray-100 last:border-b-0">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
              <span className="text-lg">📅</span>
            </div>
            <div className="ml-3 flex-1">
              <dt className="text-sm font-medium text-gray-600">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </dt>
              <dd className="mt-1 text-base text-gray-900 font-medium">
                {formatDate(value)}
              </dd>
            </div>
          </div>
        );
        
      case 'select':
        const selectField = field as any;
        const getSelectDisplayValue = () => {
          if (!value) return getDisplayValue(field, value);
          const option = (selectField.options || []).find((opt: any) => opt.value === value);
          return option ? option.label : value;
        };
        
        const getIcon = () => {
          if (field.label.toLowerCase().includes('gender')) {
            return value === 'male' ? '👨' : value === 'female' ? '👩' : '👤';
          }
          if (field.label.toLowerCase().includes('status')) return '📊';
          if (field.label.toLowerCase().includes('type')) return '🏷️';
          return '📋';
        };
        
        return (
          <div key={field.id} className="flex items-start py-3 border-b border-gray-100 last:border-b-0">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
              <span className="text-lg">{getIcon()}</span>
            </div>
            <div className="ml-3 flex-1">
              <dt className="text-sm font-medium text-gray-600">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </dt>
              <dd className="mt-1">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200 capitalize">
                  {getSelectDisplayValue()}
                </span>
              </dd>
            </div>
          </div>
        );
        
      case 'checkbox':
        const isActive = Boolean(value);
        return (
          <div key={field.id} className="flex items-start py-3 border-b border-gray-100 last:border-b-0">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
              <span className="text-lg">{isActive ? '✅' : '❌'}</span>
            </div>
            <div className="ml-3 flex-1">
              <dt className="text-sm font-medium text-gray-600">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </dt>
              <dd className="mt-1">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  isActive 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}>
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </dd>
            </div>
          </div>
        );
        
      case 'group':
        const groupField = field as any;
        return (
          <div key={field.id} className="mb-6 border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="mr-2">📁</span>
                {field.label}
              </h3>
            </div>
            <div className="p-4 space-y-4">
              {(groupField.children || [])
                .sort((a: TemplateField, b: TemplateField) => a.order - b.order)
                .map((child: TemplateField) => renderField(child))}
            </div>
          </div>
        );
        
      case 'widget':
        return renderNestedWidget(field);
        
      case 'twoColumn':
        const twoColumnField = field as TwoColumnField;
        return (
          <div key={field.id} className="mb-6">
            <div 
              className="grid gap-2" 
              style={{ 
                gridTemplateColumns: `${twoColumnField.leftWidth || 50}% 1fr`,
                gap: `${twoColumnField.gap || 16}px`
              }}
            >
              {/* Left Column */}
              <div className="space-y-4">
                {(twoColumnField.leftColumn || [])
                  .sort((a: TemplateField, b: TemplateField) => a.order - b.order)
                  .map((leftField: TemplateField) => renderField(leftField))}
              </div>
              
              {/* Right Column */}
              <div className="space-y-4">
                {(twoColumnField.rightColumn || [])
                  .sort((a: TemplateField, b: TemplateField) => a.order - b.order)
                  .map((rightField: TemplateField) => renderField(rightField))}
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div key={(field as any).id} className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <span className="text-sm text-yellow-700">
              Unsupported field type: {(field as any).type}
            </span>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h3 className="text-lg font-medium text-gray-900">Live Preview</h3>
        <p className="text-sm text-gray-600">
          Real-time preview of how your template renders with the sample data
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-8 bg-white design-canvas-scroll">
        {!sampleData ? (
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No sample data</h3>
            <p className="mt-1 text-sm text-gray-500">
              Provide sample FHIR data to see the preview.
            </p>
          </div>
        ) : template.fields.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No fields</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add fields to your template to see the preview.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Template Header */}
            {template.name && (
              <div className="px-6 py-4 bg-blue-50 border-b border-blue-100 rounded-t-lg">
                <h2 className="text-2xl font-bold text-blue-900 flex items-center">
                  <span className="mr-3">{getResourceIcon(template.resourceType)}</span>
                  {template.name}
                </h2>
                {template.description && (
                  <p className="mt-2 text-blue-700">{template.description}</p>
                )}
              </div>
            )}

            {/* Patient Information Content */}
            <div className="p-6">
              <dl className="space-y-4">
                {template.fields
                  .sort((a, b) => a.order - b.order)
                  .map((field) => renderField(field))}
              </dl>
            </div>
          </div>
        )}
      </div>

      {/* Footer with Data Info */}
      {sampleData && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="text-xs text-gray-600 space-x-3">
              <span className="flex items-center text-green-600">
                <span className="mr-1">✓</span>
                {(sampleData as any).resourceType || template.resourceType} Resource
              </span>
              {(sampleData as any).id && (
                <span>ID: {(sampleData as any).id}</span>
              )}
              {(sampleData as any).active !== undefined && (
                <span>Active: {(sampleData as any).active ? 'Yes' : 'No'}</span>
              )}
            </div>
            <div className="text-xs">
              {template.fields.length} fields rendered
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LivePreview;