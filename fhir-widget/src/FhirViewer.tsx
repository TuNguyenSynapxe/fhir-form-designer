import React, { useState, useEffect } from 'react';
import get from 'lodash.get';

// FHIR Types for the widget
interface FhirPatient {
  resourceType: "Patient";
  id?: string;
  active?: boolean;
  name?: Array<{
    use?: string;
    family?: string;
    given?: string[];
    prefix?: string[];
    suffix?: string[];
  }>;
  telecom?: Array<{
    system?: string;
    value?: string;
    use?: string;
  }>;
  gender?: "male" | "female" | "other" | "unknown";
  birthDate?: string;
  address?: Array<{
    use?: string;
    type?: string;
    line?: string[];
    city?: string;
    district?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>;
  maritalStatus?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  };
  contact?: Array<{
    relationship?: Array<{
      coding?: Array<{
        system?: string;
        code?: string;
        display?: string;
      }>;
    }>;
    name?: {
      family?: string;
      given?: string[];
    };
    telecom?: Array<{
      system?: string;
      value?: string;
    }>;
  }>;
}

// Template Types
type FieldType = "text" | "label" | "date" | "select" | "checkbox" | "group" | "twoColumn";

interface BaseField {
  id: string;
  type: FieldType;
  label: string;
  fhirPath?: string;
  required?: boolean;
  order: number;
}

interface TextField extends BaseField {
  type: "text";
  placeholder?: string;
  maxLength?: number;
}

interface LabelField extends BaseField {
  type: "label";
  fontSize?: "sm" | "md" | "lg" | "xl";
  fontWeight?: "normal" | "bold";
  color?: string;
}

interface DateField extends BaseField {
  type: "date";
  format?: string;
}

interface SelectField extends BaseField {
  type: "select";
  options: Array<{
    value: string;
    label: string;
  }>;
  multiple?: boolean;
}

interface CheckboxField extends BaseField {
  type: "checkbox";
  defaultValue?: boolean;
}

interface GroupField extends BaseField {
  type: "group";
  children: TemplateField[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

interface TwoColumnField extends BaseField {
  type: "twoColumn";
  leftColumn: TemplateField[];
  rightColumn: TemplateField[];
  leftWidth: number;
  gap: number;
}

type TemplateField = TextField | LabelField | DateField | SelectField | CheckboxField | GroupField | TwoColumnField;

interface Template {
  id: string;
  name: string;
  description?: string;
  resourceType: "Patient";
  fields: TemplateField[];
  createdAt: string;
  updatedAt: string;
  version: string;
}

interface FhirViewerProps {
  template: Template;
  data: FhirPatient;
  mode?: "view" | "edit";
  onDataChange?: (data: FhirPatient) => void;
  className?: string;
  style?: React.CSSProperties;
}

const FhirViewer: React.FC<FhirViewerProps> = ({
  template,
  data,
  mode = "view",
  onDataChange,
  className = "",
  style = {},
}) => {
  const [editableData, setEditableData] = useState<FhirPatient>(data);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    setEditableData(data);
  }, [data]);

  const getFieldValue = (fhirPath: string, currentData: FhirPatient): any => {
    if (!fhirPath || !currentData) return '';
    
    try {
      // Handle special cases for telecom arrays
      if (fhirPath.includes("telecom.find(t => t.system === 'email').value")) {
        const telecom = currentData.telecom || [];
        const emailEntry = telecom.find((t) => t.system === 'email');
        return emailEntry?.value || '';
      }
      
      if (fhirPath.includes("telecom.find(t => t.system === 'phone').value")) {
        const telecom = currentData.telecom || [];
        const phoneEntry = telecom.find((t) => t.system === 'phone');
        return phoneEntry?.value || '';
      }
      
      // Handle special cases for contact arrays
      if (fhirPath.includes("contact[0].telecom.find(t => t.system === 'phone').value")) {
        const contact = currentData.contact?.[0];
        if (contact?.telecom) {
          const phoneEntry = contact.telecom.find((t) => t.system === 'phone');
          return phoneEntry?.value || '';
        }
        return '';
      }
      
      // Use lodash.get for other paths
      return get(currentData, fhirPath) || '';
    } catch (error) {
      console.error('Error resolving FHIR path:', fhirPath, error);
      return '';
    }
  };

  const setFieldValue = (fhirPath: string, value: any) => {
    if (!onDataChange || mode !== 'edit') return;

    const updatedData = { ...editableData };
    
    try {
      // Handle special cases for setting telecom values
      if (fhirPath.includes("telecom.find(t => t.system === 'email').value")) {
        if (!updatedData.telecom) updatedData.telecom = [];
        const emailIndex = updatedData.telecom.findIndex(t => t.system === 'email');
        if (emailIndex >= 0) {
          updatedData.telecom[emailIndex].value = value;
        } else {
          updatedData.telecom.push({ system: 'email', value, use: 'home' });
        }
      } else if (fhirPath.includes("telecom.find(t => t.system === 'phone').value")) {
        if (!updatedData.telecom) updatedData.telecom = [];
        const phoneIndex = updatedData.telecom.findIndex(t => t.system === 'phone');
        if (phoneIndex >= 0) {
          updatedData.telecom[phoneIndex].value = value;
        } else {
          updatedData.telecom.push({ system: 'phone', value, use: 'home' });
        }
      } else {
        // For simple paths, use direct assignment
        const pathParts = fhirPath.split('.');
        let current: any = updatedData;
        
        for (let i = 0; i < pathParts.length - 1; i++) {
          const part = pathParts[i];
          const match = part.match(/^(.+)\[(\d+)\]$/);
          
          if (match) {
            const [, prop, index] = match;
            if (!current[prop]) current[prop] = [];
            if (!current[prop][parseInt(index)]) current[prop][parseInt(index)] = {};
            current = current[prop][parseInt(index)];
          } else {
            if (!current[part]) current[part] = {};
            current = current[part];
          }
        }
        
        const lastPart = pathParts[pathParts.length - 1];
        const lastMatch = lastPart.match(/^(.+)\[(\d+)\]$/);
        
        if (lastMatch) {
          const [, prop, index] = lastMatch;
          if (!current[prop]) current[prop] = [];
          current[prop][parseInt(index)] = value;
        } else {
          current[lastPart] = value;
        }
      }
      
      setEditableData(updatedData);
      onDataChange(updatedData);
    } catch (error) {
      console.error('Error setting FHIR path:', fhirPath, error);
    }
  };

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const renderField = (field: TemplateField): React.ReactNode => {
    const value = field.fhirPath ? getFieldValue(field.fhirPath, editableData) : '';
    const isReadOnly = mode === 'view';

    switch (field.type) {
      case 'label':
        const labelField = field as LabelField;
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
        const textField = field as TextField;
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={typeof value === 'object' ? JSON.stringify(value) : (value || '')}
              onChange={(e) => setFieldValue(field.fhirPath || '', e.target.value)}
              readOnly={isReadOnly}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                isReadOnly ? 'bg-gray-50 text-gray-700' : 'bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              }`}
              placeholder={textField.placeholder || ''}
            />
          </div>
        );
        
      case 'date':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              value={value || ''}
              onChange={(e) => setFieldValue(field.fhirPath || '', e.target.value)}
              readOnly={isReadOnly}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                isReadOnly ? 'bg-gray-50 text-gray-700' : 'bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              }`}
            />
          </div>
        );
        
      case 'select':
        const selectField = field as SelectField;
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value || ''}
              onChange={(e) => setFieldValue(field.fhirPath || '', e.target.value)}
              disabled={isReadOnly}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                isReadOnly ? 'bg-gray-50 text-gray-700' : 'bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              }`}
            >
              <option value="">Select an option</option>
              {selectField.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
        
      case 'checkbox':
        return (
          <div key={field.id} className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => setFieldValue(field.fhirPath || '', e.target.checked)}
                readOnly={isReadOnly}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </label>
          </div>
        );
        
      case 'group':
        const groupField = field as GroupField;
        const isExpanded = expandedGroups.has(field.id) || groupField.defaultExpanded;
        
        return (
          <div key={field.id} className="mb-6 border border-gray-200 rounded-lg">
            <div
              className={`p-4 ${groupField.collapsible ? 'cursor-pointer hover:bg-gray-50' : ''} ${
                isExpanded ? 'bg-gray-50' : 'bg-white'
              }`}
              onClick={groupField.collapsible ? () => toggleGroup(field.id) : undefined}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {field.label}
                </h3>
                {groupField.collapsible && (
                  <span className="text-gray-400">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                )}
              </div>
            </div>
            
            {isExpanded && (
              <div className="p-4 border-t border-gray-200 bg-white">
                {groupField.children
                  .sort((a, b) => a.order - b.order)
                  .map(child => renderField(child))}
              </div>
            )}
          </div>
        );
        
      case "twoColumn":
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
                  .sort((a, b) => a.order - b.order)
                  .map(leftField => renderField(leftField))}
              </div>
              
              {/* Right Column */}
              <div className="space-y-4">
                {(twoColumnField.rightColumn || [])
                  .sort((a, b) => a.order - b.order)
                  .map(rightField => renderField(rightField))}
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

  // Initialize expanded groups based on defaultExpanded
  useEffect(() => {
    const defaultExpanded = new Set<string>();
    template.fields.forEach(field => {
      if (field.type === 'group' && (field as GroupField).defaultExpanded) {
        defaultExpanded.add(field.id);
      }
    });
    setExpandedGroups(defaultExpanded);
  }, [template]);

  return (
    <div 
      className={`fhir-viewer p-6 bg-white ${className}`}
      style={style}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              mode === 'edit' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {mode === 'edit' ? 'Edit Mode' : 'View Mode'}
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
              {template.resourceType}
            </span>
          </div>
        </div>
        
        {template.description && (
          <p className="text-gray-600">{template.description}</p>
        )}
      </div>

      {/* Fields */}
      <div className="space-y-4">
        {template.fields
          .sort((a, b) => a.order - b.order)
          .map(field => renderField(field))}
      </div>

      {/* Footer */}
      {data.id && (
        <div className="mt-8 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              Resource ID: <code className="bg-gray-100 px-1 py-0.5 rounded">{data.id}</code>
            </div>
            <div>
              Template v{template.version} • {template.fields.length} fields
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FhirViewer;