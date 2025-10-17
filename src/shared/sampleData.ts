import type { FhirPatient, FhirHumanName, FhirContactPoint, FhirAddress, FhirResource, FhirResourceType } from './types';

export const SAMPLE_PATIENT_DATA: FhirPatient = {
  "resourceType": "Patient",
  "id": "example-patient-001",
  "active": true,
  "name": [
    {
      "use": "official",
      "family": "Smith",
      "given": ["John", "Michael"],
      "prefix": ["Mr."]
    },
    {
      "use": "nickname",
      "given": ["Johnny"]
    }
  ],
  "telecom": [
    {
      "system": "phone",
      "value": "+1-555-123-4567",
      "use": "home"
    },
    {
      "system": "email",
      "value": "john.smith@email.com",
      "use": "work"
    },
    {
      "system": "phone",
      "value": "+1-555-987-6543",
      "use": "mobile"
    }
  ],
  "gender": "male",
  "birthDate": "1985-03-15",
  "address": [
    {
      "use": "home",
      "type": "both",
      "line": ["123 Main Street", "Apt 4B"],
      "city": "Springfield",
      "district": "Central",
      "state": "IL",
      "postalCode": "62701",
      "country": "US"
    },
    {
      "use": "work",
      "type": "physical",
      "line": ["456 Business Blvd"],
      "city": "Springfield",
      "state": "IL",
      "postalCode": "62702",
      "country": "US"
    }
  ],
  "maritalStatus": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/v3-MaritalStatus",
        "code": "M",
        "display": "Married"
      }
    ]
  },
  "contact": [
    {
      "relationship": [
        {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/v2-0131",
              "code": "E",
              "display": "Emergency Contact"
            }
          ]
        }
      ],
      "name": {
        "family": "Smith",
        "given": ["Jane"]
      },
      "telecom": [
        {
          "system": "phone",
          "value": "+1-555-111-2222"
        }
      ]
    }
  ]
};

export const SAMPLE_HUMAN_NAME_DATA: FhirHumanName = {
  "resourceType": "HumanName",
  "use": "official",
  "text": "Dr. Sarah Elizabeth Johnson-Brown",
  "family": "Johnson-Brown",
  "given": ["Sarah", "Elizabeth"],
  "prefix": ["Dr."],
  "suffix": ["MD", "PhD"]
};

export const SAMPLE_CONTACT_POINT_DATA: FhirContactPoint = {
  "resourceType": "ContactPoint",
  "system": "email",
  "value": "sarah.johnson@hospital.org",
  "use": "work",
  "rank": 1
};

export const SAMPLE_ADDRESS_DATA: FhirAddress = {
  "resourceType": "Address",
  "use": "home",
  "type": "both",
  "text": "789 Oak Avenue, Unit 12, Riverside, CA 92501",
  "line": ["789 Oak Avenue", "Unit 12"],
  "city": "Riverside",
  "district": "Riverside County",
  "state": "CA",
  "postalCode": "92501",
  "country": "US"
};

export const getSampleDataByResourceType = (resourceType: FhirResourceType): FhirResource => {
  switch (resourceType) {
    case 'Patient':
      return SAMPLE_PATIENT_DATA;
    case 'HumanName':
      return SAMPLE_HUMAN_NAME_DATA;
    case 'ContactPoint':
      return SAMPLE_CONTACT_POINT_DATA;
    case 'Address':
      return SAMPLE_ADDRESS_DATA;
    default:
      return SAMPLE_PATIENT_DATA;
  }
};

export const getSampleDataJson = (resourceType: FhirResourceType): string => {
  return JSON.stringify(getSampleDataByResourceType(resourceType), null, 2);
};

// Common FHIR Paths for different resource types
export const FHIR_PATHS_BY_RESOURCE_TYPE = {
  Patient: {
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
  },
  HumanName: {
    use: "use",
    text: "text",
    family: "family",
    firstName: "given[0]",
    secondName: "given[1]",
    allGiven: "given",
    prefix: "prefix[0]",
    suffix: "suffix[0]",
    fullName: "text || (given?.join(' ') + ' ' + family)"
  },
  ContactPoint: {
    system: "system",
    value: "value",
    use: "use",
    rank: "rank"
  },
  Address: {
    use: "use",
    type: "type",
    text: "text",
    line1: "line[0]",
    line2: "line[1]",
    allLines: "line",
    city: "city",
    district: "district",
    state: "state",
    postalCode: "postalCode",
    country: "country",
    fullAddress: "text || (line?.join(', ') + ', ' + city + ', ' + state + ' ' + postalCode)"
  }
} as const;