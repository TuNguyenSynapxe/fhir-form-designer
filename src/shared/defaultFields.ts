import type { TemplateField, FhirResourceType, FieldConfig } from './types';

// Generic primitive field types that work for all resource types
const getPrimitiveFieldConfigs = (): FieldConfig[] => [
  {
    type: 'text',
    label: 'Text Field',
    icon: '📝',
    description: 'Single line text input',
    defaultProps: {
      type: 'text',
      label: 'Text Field',
      fhirPath: '',
      required: false,
      order: 0
    }
  },
  {
    type: 'label',
    label: 'Label',
    icon: '🏷️',
    description: 'Display text label',
    defaultProps: {
      type: 'label',
      label: 'Label',
      fhirPath: '',
      fontSize: 'md',
      fontWeight: 'normal',
      required: false,
      order: 0
    }
  },
  {
    type: 'date',
    label: 'Date Field',
    icon: '📅',
    description: 'Date picker input',
    defaultProps: {
      type: 'date',
      label: 'Date Field',
      fhirPath: '',
      required: false,
      order: 0
    }
  },
  {
    type: 'select',
    label: 'Select Field',
    icon: '📋',
    description: 'Dropdown selection',
    defaultProps: {
      type: 'select',
      label: 'Select Field',
      fhirPath: '',
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' }
      ],
      required: false,
      order: 0
    }
  },
  {
    type: 'checkbox',
    label: 'Checkbox Field',
    icon: '☑️',
    description: 'Checkbox input',
    defaultProps: {
      type: 'checkbox',
      label: 'Checkbox Field',
      fhirPath: '',
      required: false,
      order: 0
    }
  },
  {
    type: 'text',
    label: 'Email Field',
    icon: '📧',
    description: 'Email input with validation',
    defaultProps: {
      type: 'text',
      label: 'Email',
      fhirPath: 'telecom.find(t => t.system === \'email\').value',
      inputType: 'email',
      required: false,
      order: 0
    }
  },
  {
    type: 'text',
    label: 'Phone Field',
    icon: '📞',
    description: 'Phone number input',
    defaultProps: {
      type: 'text',
      label: 'Phone Number',
      fhirPath: 'telecom.find(t => t.system === \'phone\').value',
      inputType: 'tel',
      required: false,
      order: 0
    }
  },
  {
    type: 'select',
    label: 'Gender Field',
    icon: '👤',
    description: 'Gender selection dropdown',
    defaultProps: {
      type: 'select',
      label: 'Gender',
      fhirPath: '',
      options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' },
        { value: 'unknown', label: 'Unknown' }
      ],
      required: false,
      order: 0
    }
  }
];

export const getFieldConfigsForResourceType = (resourceType: FhirResourceType): FieldConfig[] => {
  // Start with primitive field types
  const primitiveFields = getPrimitiveFieldConfigs();
  
  // Add resource-specific widget fields
  const widgetFields: FieldConfig[] = [];
  
  switch (resourceType) {
    case 'Patient':
    case 'HumanName':
    case 'ContactPoint':
    case 'Address':
    default:
      // Add generic nested resource widget for all resource types
      widgetFields.push(
        {
          type: 'widget',
          label: 'Nested Resource',
          icon: '🧩',
          description: 'Embed another template as a nested resource',
          defaultProps: {
            type: 'widget',
            label: 'Nested Resource',
            fhirPath: '',
            widgetResourceType: 'HumanName',
            widgetTemplateId: '',
            multiple: false,
            required: false,
            order: 0
          }
        }
      );
      break;
  }
  
  return [...primitiveFields, ...widgetFields];
};

export const getDefaultFieldsForResourceType = (_resourceType: FhirResourceType): TemplateField[] => {
  // No default fields - users will add what they need from the field palette
  return [];
};
