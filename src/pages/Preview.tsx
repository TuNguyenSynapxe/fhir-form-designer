import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import get from 'lodash.get';
import type { Template, FhirResource, TemplateField, TwoColumnField } from '../shared/types';
import { getSampleDataByResourceType } from '../shared/sampleData';
import { evaluateExpression } from '../shared/expressionEvaluator';

const Preview: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');

  const getResourceIcon = (resourceType: string): string => {
    switch (resourceType) {
      case 'Patient': return '👤';
      case 'HumanName': return '📝';
      case 'ContactPoint': return '📞';
      case 'Address': return '🏠';
      default: return '📋';
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

  const [template, setTemplate] = useState<Template | null>(null);
  const [templatesOfSameType, setTemplatesOfSameType] = useState<Template[]>([]);
  const [sampleData, setSampleData] = useState<FhirResource | null>(null);
  const [jsonInput, setJsonInput] = useState('');
  const [templateError, setTemplateError] = useState<string>('');
  const [jsonError, setJsonError] = useState<string>('');

  useEffect(() => {
    if (templateId) {
      loadTemplate(templateId);
    }
  }, [templateId]);

  // Load appropriate sample data when template changes
  useEffect(() => {
    if (template) {
      const defaultData = getSampleDataByResourceType(template.resourceType);
      setSampleData(defaultData);
      setJsonInput(JSON.stringify(defaultData, null, 2));
    }
  }, [template]);

  const loadTemplate = (id: string) => {
    const stored = localStorage.getItem('fhir-templates');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const allTemplates = parsed.templates || [];
        const foundTemplate = allTemplates.find((t: Template) => t.id === id);
        
        if (foundTemplate) {
          setTemplate(foundTemplate);
          
          // Load all templates of the same resource type
          const sameTypeTemplates = allTemplates.filter((t: Template) => 
            t.resourceType === foundTemplate.resourceType
          );
          setTemplatesOfSameType(sameTypeTemplates);
        } else {
          setTemplateError('Template not found');
        }
      } catch (error) {
        console.error('Failed to load template:', error);
        setTemplateError('Failed to load template');
      }
    } else {
      setTemplateError('No templates found');
    }
  };

  const handleTemplateSwitch = (newTemplateId: string) => {
    // Update the URL to reflect the new template
    const url = new URL(window.location.href);
    url.searchParams.set('template', newTemplateId);
    window.history.pushState({}, '', url.toString());
    
    // Load the new template
    loadTemplate(newTemplateId);
  };

  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    setJsonError('');
    
    try {
      const parsed = JSON.parse(value);
      if (template && parsed.resourceType !== template.resourceType) {
        setJsonError(`Invalid resource type. Expected "${template.resourceType}", got "${parsed.resourceType || 'undefined'}".`);
        return;
      }
      setSampleData(parsed);
    } catch (err) {
      setJsonError('Invalid JSON format');
      setSampleData(null);
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonInput(formatted);
      setJsonError('');
      setSampleData(parsed);
    } catch (err) {
      setJsonError('Cannot format invalid JSON');
    }
  };

  const clearJson = () => {
    setJsonInput('');
    setJsonError('');
    setSampleData(null);
  };



  const getFieldValue = (fhirPath: string, data: FhirResource): any => {
    if (!fhirPath || !data) return '';
    
    try {
      // Handle complex find operations first
      if (fhirPath.includes('find(') && fhirPath.includes('system')) {
        // Handle patterns like "telecom.find(t => t.system === 'email').value"
        if (fhirPath.includes("'email'") || fhirPath.includes('"email"')) {
          // Only Patient resources have telecom arrays
          if (data.resourceType === 'Patient') {
            const emailItem = (data as any).telecom?.find((item: any) => item.system === 'email');
            return emailItem?.value || '';
          }
        }
        if (fhirPath.includes("'phone'") || fhirPath.includes('"phone"')) {
          // Only Patient resources have telecom arrays  
          if (data.resourceType === 'Patient') {
            const phoneItem = (data as any).telecom?.find((item: any) => item.system === 'phone');
            return phoneItem?.value || '';
          }
        }
      }

      // Use lodash.get for simple path resolution
      return get(data, fhirPath) || '';
    } catch (error) {
      console.error('Error resolving path:', fhirPath, error);
      return '';
    }
  };

  const renderNestedWidget = (field: any): React.ReactNode => {
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

    const renderNestedField = (nestedField: TemplateField, data: any): React.ReactNode => {
      const value = nestedField.fhirPath ? get(data, nestedField.fhirPath) || '' : '';

      switch (nestedField.type) {
        case 'label':
          const labelField = nestedField as any;
          return (
            <div
              key={nestedField.id}
              className={`mb-2 ${
                labelField.fontSize === 'xl' ? 'text-xl' :
                labelField.fontSize === 'lg' ? 'text-lg' :
                labelField.fontSize === 'sm' ? 'text-sm' : 'text-base'
              } ${
                labelField.fontWeight === 'bold' ? 'font-bold' : 'font-normal'
              } text-gray-900 flex items-center`}
            >
              <span className="mr-2">🏷️</span>
              {nestedField.label}
            </div>
          );

        case 'text':
          // Smart data binding for nested Email/Phone fields
          const getNestedSmartValue = () => {
            // If field has a value from fhirPath, use it
            if (value) return value;

            // Auto-detect Email/Phone fields and bind to telecom data if available
            const label = nestedField.label.toLowerCase();
            const inputType = (nestedField as any).inputType?.toLowerCase();

            // Auto-bind Email fields
            if (inputType === 'email' || label.includes('email')) {
              const emailItem = data?.telecom?.find((item: any) => item.system === 'email');
              if (emailItem) return emailItem.value;
            }

            // Auto-bind Phone fields
            if (inputType === 'tel' || label.includes('phone') || label.includes('tel')) {
              const phoneItem = data?.telecom?.find((item: any) => item.system === 'phone');
              if (phoneItem) return phoneItem.value;
            }

            return 'N/A';
          };

          const getNestedTextIcon = () => {
            const label = nestedField.label.toLowerCase();
            const inputType = (nestedField as any).inputType?.toLowerCase();
            if (inputType === 'email' || label.includes('email')) return '📧';
            if (inputType === 'tel' || label.includes('phone') || label.includes('tel')) return '📞';
            return '📝';
          };

          return (
            <div key={nestedField.id} className="mb-3">
              <div className="flex items-center space-x-2 mb-1">
                <span>{getNestedTextIcon()}</span>
                <dt className="text-sm font-medium text-gray-700">{nestedField.label}</dt>
              </div>
              <dd className="bg-gray-50 px-3 py-2 rounded border text-gray-900 ml-6">
                {getNestedSmartValue()}
              </dd>
            </div>
          );

        case 'date':
          const formattedDate = value ? new Date(value).toLocaleDateString() : 'N/A';
          return (
            <div key={nestedField.id} className="mb-3">
              <div className="flex items-center space-x-2 mb-1">
                <span>📅</span>
                <dt className="text-sm font-medium text-gray-700">{nestedField.label}</dt>
              </div>
              <dd className="bg-gray-50 px-3 py-2 rounded border text-gray-900 ml-6">
                {formattedDate}
              </dd>
            </div>
          );

        case 'select':
          const selectField = nestedField as any;
          const displayValue = selectField.options?.find((opt: any) => opt.value === value)?.label || value || 'N/A';
          return (
            <div key={nestedField.id} className="mb-3">
              <div className="flex items-center space-x-2 mb-1">
                <span>📋</span>
                <dt className="text-sm font-medium text-gray-700">{nestedField.label}</dt>
              </div>
              <dd className="ml-6">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {displayValue}
                </span>
              </dd>
            </div>
          );

        case 'radio':
          const radioField = nestedField as any;
          const radioDisplayValue = radioField.options?.find((opt: any) => opt.value === value)?.label || value || 'N/A';
          return (
            <div key={nestedField.id} className="mb-3">
              <div className="flex items-center space-x-2 mb-1">
                <span>🔘</span>
                <dt className="text-sm font-medium text-gray-700">{nestedField.label}</dt>
              </div>
              <dd className="ml-6">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {radioDisplayValue}
                </span>
              </dd>
            </div>
          );

        case 'checkbox':
          const isChecked = Boolean(value);
          return (
            <div key={nestedField.id} className="mb-3">
              <div className="flex items-center justify-between ml-6">
                <div className="flex items-center space-x-2">
                  <span>☑️</span>
                  <dt className="text-sm font-medium text-gray-700">{nestedField.label}</dt>
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

        default:
          return (
            <div key={nestedField.id} className="mb-3">
              <div className="flex items-center space-x-2 mb-1">
                <span>❓</span>
                <dt className="text-sm font-medium text-gray-700">{nestedField.label}</dt>
              </div>
              <dd className="bg-gray-50 px-3 py-2 rounded border text-gray-900 ml-6">
                {value || 'N/A'}
              </dd>
            </div>
          );
      }
    };

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
                  <div className="space-y-2">
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
          <div className="space-y-2">
            {nestedTemplate.fields
              .sort((a, b) => a.order - b.order)
              .map((nestedField) => renderNestedField(nestedField, nestedData))}
          </div>
        )}
      </React.Fragment>
    );
  };

  const renderField = (field: any): React.ReactNode => {
    if (!sampleData) return null;

    // Use expression if available, otherwise fall back to FHIR path
    const value = field.expression 
      ? evaluateExpression(field.expression, sampleData)
      : field.fhirPath 
        ? getFieldValue(field.fhirPath, sampleData) 
        : '';

    switch (field.type) {
      case 'label':
        return (
          <div
            className={`${
              field.fontSize === 'sm' ? 'text-sm' :
              field.fontSize === 'lg' ? 'text-lg' :
              field.fontSize === 'xl' ? 'text-xl' : 'text-base'
            } ${
              field.fontWeight === 'bold' ? 'font-bold' : 'font-normal'
            }`}
            style={{ color: field.color || 'inherit' }}
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

        // Smart data binding for Email/Phone fields
        const getSmartValue = () => {
          // If field has a FHIR path, use the regular value
          if (field.fhirPath && value) {
            return typeof value === 'object' ? JSON.stringify(value) : value;
          }

          // If no FHIR path, try to auto-detect Email/Phone based on inputType or label
          const label = field.label.toLowerCase();
          const inputType = field.inputType?.toLowerCase();

          // Auto-bind Email fields
          if (inputType === 'email' || label.includes('email')) {
            if (sampleData?.resourceType === 'Patient') {
              const emailItem = (sampleData as any).telecom?.find((item: any) => item.system === 'email');
              if (emailItem) return emailItem.value;
            } else if (sampleData?.resourceType === 'ContactPoint') {
              // ContactPoint has direct system/value properties
              if ((sampleData as any).system === 'email') {
                return (sampleData as any).value;
              }
            }
          }

          // Auto-bind Phone fields  
          if (inputType === 'tel' || label.includes('phone') || label.includes('tel')) {
            if (sampleData?.resourceType === 'Patient') {
              const phoneItem = (sampleData as any).telecom?.find((item: any) => item.system === 'phone');
              if (phoneItem) return phoneItem.value;
            } else if (sampleData?.resourceType === 'ContactPoint') {
              // ContactPoint has direct system/value properties
              if ((sampleData as any).system === 'phone') {
                return (sampleData as any).value;
              }
            }
          }

          // Return the original value or fallback
          return typeof value === 'object' ? JSON.stringify(value) : (value || 'Not specified');
        };

        return (
          <div className="flex items-start py-3 border-b border-gray-100 last:border-b-0">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
              <span className="text-lg">{getTextIcon()}</span>
            </div>
            <div className="ml-3 flex-1">
              {!field.hideLabel && (
                <dt className="text-sm font-medium text-gray-600">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </dt>
              )}
              <dd className={`${field.hideLabel ? '' : 'mt-1'} text-base text-gray-900 font-medium`}>
                {getSmartValue()}
              </dd>
            </div>
          </div>
        );
        
      case 'date':
        const formatDate = (dateValue: string) => {
          if (!dateValue) return 'Not specified';
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
          <div className="flex items-start py-3 border-b border-gray-100 last:border-b-0">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
              <span className="text-lg">📅</span>
            </div>
            <div className="ml-3 flex-1">
              {!field.hideLabel && (
                <dt className="text-sm font-medium text-gray-600">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </dt>
              )}
              <dd className={`${field.hideLabel ? '' : 'mt-1'} text-base text-gray-900 font-medium`}>
                {formatDate(value)}
              </dd>
            </div>
          </div>
        );
        
      case 'select':
        const getDisplayValue = () => {
          if (!value) return 'Not specified';
          const option = (field.options || []).find((opt: any) => opt.value === value);
          return option ? option.label : value;
        };
        
        const getSelectIcon = () => {
          if (field.label.toLowerCase().includes('gender')) {
            return value === 'male' ? '👨' : value === 'female' ? '👩' : '👤';
          }
          if (field.label.toLowerCase().includes('status')) return '📊';
          if (field.label.toLowerCase().includes('type')) return '🏷️';
          return '📋';
        };

        return (
          <div className="flex items-start py-3 border-b border-gray-100 last:border-b-0">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
              <span className="text-lg">{getSelectIcon()}</span>
            </div>
            <div className="ml-3 flex-1">
              {!field.hideLabel && (
                <dt className="text-sm font-medium text-gray-600">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </dt>
              )}
              <dd className={`${field.hideLabel ? '' : 'mt-1'}`}>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200 capitalize">
                  {getDisplayValue()}
                </span>
              </dd>
            </div>
          </div>
        );
        
      case 'radio':
        const getRadioDisplayValue = () => {
          if (!value) return 'Not selected';
          const option = (field.options || []).find((opt: any) => opt.value === value);
          return option ? option.label : value;
        };
        
        const getRadioIcon = () => {
          if (field.label.toLowerCase().includes('gender')) {
            return value === 'male' ? '👨' : value === 'female' ? '👩' : '👤';
          }
          if (field.label.toLowerCase().includes('priority')) return '⚡';
          if (field.label.toLowerCase().includes('rating')) return '⭐';
          return '🔘';
        };

        return (
          <div className="flex items-start py-3 border-b border-gray-100 last:border-b-0">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
              <span className="text-lg">{getRadioIcon()}</span>
            </div>
            <div className="ml-3 flex-1">
              {!field.hideLabel && (
                <dt className="text-sm font-medium text-gray-600">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </dt>
              )}
              <dd className={`${field.hideLabel ? '' : 'mt-1'}`}>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200 capitalize">
                  {getRadioDisplayValue()}
                </span>
              </dd>
            </div>
          </div>
        );
        
      case 'checkbox':
        const isActive = Boolean(value);
        return (
          <div className="flex items-start py-3 border-b border-gray-100 last:border-b-0">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
              <span className="text-lg">{isActive ? '✅' : '❌'}</span>
            </div>
            <div className="ml-3 flex-1">
              {!field.hideLabel && (
                <dt className="text-sm font-medium text-gray-600">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </dt>
              )}
              <dd className={`${field.hideLabel ? '' : 'mt-1'}`}>
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
        return (
          <div className="mb-6 border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="mr-2">📁</span>
                {field.label}
              </h3>
            </div>
            <div className="p-4">
              <dl className="space-y-0">
                {field.children?.map((child: any) => (
                  <div key={child.id}>
                    {renderField(child)}
                  </div>
                ))}
              </dl>
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
              className="flex flex-col md:grid md:gap-2 space-y-4 md:space-y-0" 
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
        return null;
    }
  };

  if (templateError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-red-800">Error</h3>
          <p className="mt-2 text-sm text-red-700">{templateError}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Back to Templates
          </button>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Templates
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Preview: {template.name}
              </h1>
              <div className="flex items-center space-x-3 mt-1">
                {template.description && (
                  <p className="text-sm text-gray-600">{template.description}</p>
                )}
                <div className="flex items-center space-x-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {template.resourceType}
                  </span>
                  {templatesOfSameType.length > 1 && (
                    <span className="text-xs text-gray-500">
                      {templatesOfSameType.length} templates available
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/create?template=${template.id}`)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Edit Template
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex" style={{ minHeight: 'calc(100vh - 140px)' }}>
        {/* Left Side - JSON Input */}
        <div className="w-1/2 bg-gray-50 border-r border-gray-200">
          <div className={`p-4 border-b ${jsonError ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className={`text-lg font-medium ${jsonError ? 'text-red-900' : 'text-gray-900'}`}>Sample FHIR Data</h2>
                {jsonError ? (
                  <p className="text-sm text-red-600 font-medium">
                    {jsonError}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">
                    Modify the JSON below to see how the template renders different data
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={formatJson}
                  className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                  title="Format JSON"
                >
                  Format
                </button>
                <button
                  onClick={clearJson}
                  className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
                  title="Clear JSON"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
          <div className="p-4" style={{ height: 'calc(100vh - 140px)' }}>
            <textarea
              value={jsonInput}
              onChange={(e) => handleJsonChange(e.target.value)}
              className={`w-full font-mono text-sm border rounded p-3 resize-none focus:ring-2 focus:border-transparent ${
                jsonError 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              style={{ height: 'calc(100% - 48px)' }}
              placeholder="Enter FHIR Patient JSON..."
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right Side - Rendered Template */}
        <div className="w-1/2 bg-white">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Rendered Template</h2>
                <p className="text-sm text-gray-600">
                  Live preview of how the template displays the FHIR data
                </p>
              </div>
              
              {/* Template Selector in Panel */}
              {templatesOfSameType.length > 1 && (
                <div className="ml-4 min-w-0 flex-shrink-0 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <label className="block text-xs text-blue-700 font-medium mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Switch Template ({templatesOfSameType.length} available):
                  </label>
                  <div className="relative">
                    <select
                      value={template.id}
                      onChange={(e) => handleTemplateSwitch(e.target.value)}
                      className="appearance-none px-3 py-2 pr-8 border border-blue-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer hover:border-blue-400 transition-colors min-w-52 shadow-sm"
                    >
                      {templatesOfSameType.map((tmpl) => (
                        <option key={tmpl.id} value={tmpl.id}>
                          {tmpl.name} {tmpl.description && `- ${tmpl.description.substring(0, 25)}${tmpl.description.length > 25 ? '...' : ''}`}
                        </option>
                      ))}
                    </select>
                    <svg className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="overflow-y-auto preview-scroll" style={{ height: 'calc(100vh - 140px)', paddingBottom: '48px' }}>
            <div className="p-6">
              {!sampleData ? (
                <div className="text-center text-gray-500 py-12">
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No sample data</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Provide sample FHIR data to see the preview.
                  </p>
                </div>
              ) : template.fields.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
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
                    This template doesn't have any fields yet.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8">
                  {/* Template Header */}
                  <div className="px-6 py-4 bg-blue-50 border-b border-blue-100 rounded-t-lg">
                    <h3 className="text-2xl font-bold text-blue-900 flex items-center">
                      <span className="mr-3">{getResourceIcon(template.resourceType)}</span>
                      {template.name}
                    </h3>
                    {template.description && (
                      <p className="mt-2 text-blue-700">{template.description}</p>
                    )}
                  </div>
                  
                  {/* Template Information Content */}
                  <div className="p-6">
                    <dl className="space-y-0">
                      {template.fields
                        .sort((a, b) => a.order - b.order)
                        .map((field) => renderField(field))}
                    </dl>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;