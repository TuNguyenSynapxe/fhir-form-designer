// FHIR Resource Types
export type FhirResourceType = "Patient" | "HumanName" | "ContactPoint" | "Address";

export interface FhirPatient {
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

export interface FhirHumanName {
  resourceType?: "HumanName";
  use?: "usual" | "official" | "temp" | "nickname" | "anonymous" | "old" | "maiden";
  text?: string;
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
}

export interface FhirContactPoint {
  resourceType?: "ContactPoint";
  system?: "phone" | "fax" | "email" | "pager" | "url" | "sms" | "other";
  value?: string;
  use?: "home" | "work" | "temp" | "old" | "mobile";
  rank?: number;
}

export interface FhirAddress {
  resourceType?: "Address";
  use?: "home" | "work" | "temp" | "old" | "billing";
  type?: "postal" | "physical" | "both";
  text?: string;
  line?: string[];
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export type FhirResource = FhirPatient | FhirHumanName | FhirContactPoint | FhirAddress;

// Template Field Types
export type FieldType = "text" | "label" | "date" | "select" | "checkbox" | "group" | "widget";

export interface BaseField {
  id: string;
  type: FieldType;
  label: string;
  fhirPath?: string; // Path to FHIR data using lodash.get format
  expression?: string; // Expression to compute values (e.g., "firstName + ' ' + lastName")
  required?: boolean;
  order: number;
  hideIfEmpty?: boolean; // If true, hide field when no value; if false, show "N/A"
}

export interface TextField extends BaseField {
  type: "text";
  placeholder?: string;
  maxLength?: number;
  inputType?: "text" | "email" | "tel" | "url" | "password";
}

export interface LabelField extends BaseField {
  type: "label";
  fontSize?: "sm" | "md" | "lg" | "xl";
  fontWeight?: "normal" | "bold";
  color?: string;
}

export interface DateField extends BaseField {
  type: "date";
  format?: string;
}

export interface SelectField extends BaseField {
  type: "select";
  options: Array<{
    value: string;
    label: string;
  }>;
  multiple?: boolean;
}

export interface CheckboxField extends BaseField {
  type: "checkbox";
  defaultValue?: boolean;
}

export interface GroupField extends BaseField {
  type: "group";
  children: TemplateField[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface WidgetField extends BaseField {
  type: "widget";
  widgetTemplateId: string; // ID of the template to use as nested widget
  widgetResourceType: FhirResourceType; // Type of resource this widget represents
  multiple?: boolean; // Whether this field can contain multiple instances
}

export type TemplateField = TextField | LabelField | DateField | SelectField | CheckboxField | GroupField | WidgetField;

// Template Definition
export interface Template {
  id: string;
  name: string;
  description?: string;
  resourceType: FhirResourceType;
  fields: TemplateField[];
  sampleData?: FhirResource;
  createdAt: string;
  updatedAt: string;
  version: string;
}

// Drag and Drop Types
export interface DragItem {
  fieldType: FieldType;
  sourceField?: TemplateField;
  isExisting?: boolean;
  defaultProps?: Partial<TemplateField>;
}

// Component Props
export interface FieldListProps {
  onFieldDrag: (fieldType: FieldType) => void;
  resourceType?: FhirResourceType;
}

export interface DesignCanvasProps {
  fields: TemplateField[];
  onFieldsChange: (fields: TemplateField[]) => void;
  onFieldSelect: (field: TemplateField | null) => void;
  selectedField: TemplateField | null;
  resourceType?: FhirResourceType;
}

export interface SampleJsonInputProps {
  value: string;
  onChange: (value: string) => void;
  resourceType: FhirResourceType;
}

export interface LivePreviewProps {
  template: Template;
  sampleData: FhirResource | null;
}

export interface ToolbarProps {
  template: Template;
  onSave: () => void;
  onExport: () => void;
  onImport: (template: Template) => void;
  onPreview?: () => void;
}

export interface FhirViewerProps {
  template: Template;
  data: FhirResource;
  mode?: "view" | "edit";
  onDataChange?: (data: FhirResource) => void;
}

// Storage Types
export interface TemplateStorage {
  templates: Template[];
  currentTemplate?: Template;
}

// Field Configuration Types
export interface FieldConfig {
  type: FieldType;
  label: string;
  icon: string;
  description: string;
  defaultProps: Partial<TemplateField>;
}

// Common FHIR Paths for Patient Resource
export const COMMON_FHIR_PATHS = {
  id: "id",
  active: "active",
  firstName: "name[0].given[0]",
  lastName: "name[0].family",
  fullName: "name[0]",
  gender: "gender",
  birthDate: "birthDate",
  email: "telecom.find(t => t.system === 'email').value",
  phone: "telecom.find(t => t.system === 'phone').value",
  addressLine1: "address[0].line[0]",
  addressCity: "address[0].city",
  addressState: "address[0].state",
  addressPostalCode: "address[0].postalCode",
  addressCountry: "address[0].country",
  maritalStatus: "maritalStatus.coding[0].display",
  emergencyContactName: "contact[0].name.given[0]",
  emergencyContactPhone: "contact[0].telecom.find(t => t.system === 'phone').value"
} as const;

// Utility Types
export type FhirPath = keyof typeof COMMON_FHIR_PATHS | string;

// Error Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface TemplateValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}