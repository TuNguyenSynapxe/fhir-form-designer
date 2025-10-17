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
  },
  {
    type: 'twoColumn',
    label: '2-Column Layout',
    icon: '📐',
    description: 'Two-column container for side-by-side layout',
    defaultProps: {
      type: 'twoColumn',
      label: '2-Column Layout',
      leftColumn: [],
      rightColumn: [],
      leftWidth: 50,
      gap: 16,
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

export const getDefaultFieldsForResourceType = (resourceType: FhirResourceType): TemplateField[] => {
  const generateId = () => Math.random().toString(36).substr(2, 9);

  switch (resourceType) {
    case 'Patient':
      return [
        {
          id: generateId(),
          type: 'label',
          label: 'Patient Information',
          fhirPath: '',
          required: false,
          order: 0,
          fontSize: 'lg',
          fontWeight: 'bold'
        },
        {
          id: generateId(),
          type: 'text',
          label: 'First Name',
          fhirPath: 'name[0].given[0]',
          required: true,
          order: 1
        },
        {
          id: generateId(),
          type: 'text',
          label: 'Last Name',
          fhirPath: 'name[0].family',
          required: true,
          order: 2
        },
        {
          id: generateId(),
          type: 'date',
          label: 'Date of Birth',
          fhirPath: 'birthDate',
          required: false,
          order: 3
        },
        {
          id: generateId(),
          type: 'select',
          label: 'Gender',
          fhirPath: 'gender',
          required: false,
          order: 4,
          options: [
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
            { label: 'Other', value: 'other' },
            { label: 'Unknown', value: 'unknown' }
          ]
        },
        {
          id: generateId(),
          type: 'text',
          label: 'Email',
          fhirPath: "telecom.find(t => t.system === 'email').value",
          required: false,
          order: 5
        },
        {
          id: generateId(),
          type: 'text',
          label: 'Phone',
          fhirPath: "telecom.find(t => t.system === 'phone').value",
          required: false,
          order: 6
        }
      ];

    case 'HumanName':
      return [
        {
          id: generateId(),
          type: 'label',
          label: 'Name Details',
          fhirPath: '',
          required: false,
          order: 0,
          fontSize: 'lg',
          fontWeight: 'bold'
        },
        {
          id: generateId(),
          type: 'select',
          label: 'Name Use',
          fhirPath: 'use',
          required: false,
          order: 1,
          options: [
            { label: 'Usual', value: 'usual' },
            { label: 'Official', value: 'official' },
            { label: 'Temp', value: 'temp' },
            { label: 'Nickname', value: 'nickname' },
            { label: 'Anonymous', value: 'anonymous' },
            { label: 'Old', value: 'old' },
            { label: 'Maiden', value: 'maiden' }
          ]
        },
        {
          id: generateId(),
          type: 'text',
          label: 'Prefix',
          fhirPath: 'prefix[0]',
          required: false,
          order: 2
        },
        {
          id: generateId(),
          type: 'text',
          label: 'First Name',
          fhirPath: 'given[0]',
          required: true,
          order: 3
        },
        {
          id: generateId(),
          type: 'text',
          label: 'Middle Name',
          fhirPath: 'given[1]',
          required: false,
          order: 4
        },
        {
          id: generateId(),
          type: 'text',
          label: 'Family Name',
          fhirPath: 'family',
          required: true,
          order: 5
        },
        {
          id: generateId(),
          type: 'text',
          label: 'Suffix',
          fhirPath: 'suffix[0]',
          required: false,
          order: 6
        }
      ];

    case 'ContactPoint':
      return [
        {
          id: generateId(),
          type: 'label',
          label: 'Contact Information',
          fhirPath: '',
          required: false,
          order: 0,
          fontSize: 'lg',
          fontWeight: 'bold'
        },
        {
          id: generateId(),
          type: 'select',
          label: 'Contact System',
          fhirPath: 'system',
          required: true,
          order: 1,
          options: [
            { label: 'Phone', value: 'phone' },
            { label: 'Fax', value: 'fax' },
            { label: 'Email', value: 'email' },
            { label: 'Pager', value: 'pager' },
            { label: 'URL', value: 'url' },
            { label: 'SMS', value: 'sms' },
            { label: 'Other', value: 'other' }
          ]
        },
        {
          id: generateId(),
          type: 'text',
          label: 'Contact Value',
          fhirPath: 'value',
          required: true,
          order: 2
        },
        {
          id: generateId(),
          type: 'select',
          label: 'Use',
          fhirPath: 'use',
          required: false,
          order: 3,
          options: [
            { label: 'Home', value: 'home' },
            { label: 'Work', value: 'work' },
            { label: 'Temp', value: 'temp' },
            { label: 'Old', value: 'old' },
            { label: 'Mobile', value: 'mobile' }
          ]
        },
        {
          id: generateId(),
          type: 'text',
          label: 'Rank',
          fhirPath: 'rank',
          required: false,
          order: 4
        }
      ];

    case 'Address':
      return [
        {
          id: generateId(),
          type: 'label',
          label: 'Address Information',
          fhirPath: '',
          required: false,
          order: 0,
          fontSize: 'lg',
          fontWeight: 'bold'
        },
        {
          id: generateId(),
          type: 'select',
          label: 'Address Use',
          fhirPath: 'use',
          required: false,
          order: 1,
          options: [
            { label: 'Home', value: 'home' },
            { label: 'Work', value: 'work' },
            { label: 'Temp', value: 'temp' },
            { label: 'Old', value: 'old' },
            { label: 'Billing', value: 'billing' }
          ]
        },
        {
          id: generateId(),
          type: 'select',
          label: 'Address Type',
          fhirPath: 'type',
          required: false,
          order: 2,
          options: [
            { label: 'Postal', value: 'postal' },
            { label: 'Physical', value: 'physical' },
            { label: 'Both', value: 'both' }
          ]
        },
        {
          id: generateId(),
          type: 'text',
          label: 'Street Address',
          fhirPath: 'line[0]',
          required: true,
          order: 3
        },
        {
          id: generateId(),
          type: 'text',
          label: 'Address Line 2',
          fhirPath: 'line[1]',
          required: false,
          order: 4
        },
        {
          id: generateId(),
          type: 'text',
          label: 'City',
          fhirPath: 'city',
          required: true,
          order: 5
        },
        {
          id: generateId(),
          type: 'text',
          label: 'State/Province',
          fhirPath: 'state',
          required: false,
          order: 6
        },
        {
          id: generateId(),
          type: 'text',
          label: 'Postal Code',
          fhirPath: 'postalCode',
          required: false,
          order: 7
        },
        {
          id: generateId(),
          type: 'text',
          label: 'Country',
          fhirPath: 'country',
          required: false,
          order: 8
        }
      ];

    default:
      return [];
  }
};
