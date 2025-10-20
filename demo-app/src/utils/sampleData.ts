// Sample FHIR data for currently supported types
export interface SampleDataOption {
  id: string;
  name: string;
  resourceType: string;
  description: string;
  data: any;
}

export const sampleDataOptions: SampleDataOption[] = [
  // Patient samples
  {
    id: 'patient-basic',
    name: 'Basic Patient',
    resourceType: 'Patient',
    description: 'Simple patient with basic demographics',
    data: {
      resourceType: 'Patient',
      id: 'patient-001',
      name: [
        {
          use: 'official',
          family: 'Smith',
          given: ['John', 'Michael']
        }
      ],
      gender: 'male',
      birthDate: '1985-03-15',
      active: true
    }
  },
  {
    id: 'patient-detailed',
    name: 'Complete Patient Record',
    resourceType: 'Patient',
    description: 'Patient with multiple names, addresses, and contact points',
    data: {
      resourceType: 'Patient',
      id: 'patient-002',
      name: [
        {
          use: 'official',
          family: 'Johnson',
          given: ['Emily', 'Rose'],
          prefix: ['Dr.']
        },
        {
          use: 'nickname',
          given: ['Emmy']
        }
      ],
      gender: 'female',
      birthDate: '1990-07-22',
      active: true,
      telecom: [
        {
          system: 'phone',
          value: '+1-555-123-4567',
          use: 'home',
          rank: 1
        },
        {
          system: 'phone',
          value: '+1-555-987-6543',
          use: 'work',
          rank: 2
        },
        {
          system: 'email',
          value: 'emily.johnson@email.com',
          use: 'work'
        },
        {
          system: 'email',
          value: 'emmy.personal@gmail.com',
          use: 'home'
        }
      ],
      address: [
        {
          use: 'home',
          type: 'physical',
          line: ['123 Main Street', 'Apt 4B'],
          city: 'Springfield',
          state: 'IL',
          postalCode: '62701',
          country: 'US',
          period: {
            start: '2020-01-01'
          }
        },
        {
          use: 'work',
          type: 'physical',
          line: ['456 Business Ave', 'Suite 200'],
          city: 'Springfield',
          state: 'IL',
          postalCode: '62702',
          country: 'US'
        }
      ]
    }
  },
  {
    id: 'patient-international',
    name: 'International Patient',
    resourceType: 'Patient',
    description: 'Patient with international contact information',
    data: {
      resourceType: 'Patient',
      id: 'patient-003',
      name: [
        {
          use: 'official',
          family: 'Chen',
          given: ['Wei', 'Ming'],
          suffix: ['Jr.']
        }
      ],
      gender: 'male',
      birthDate: '1988-12-05',
      active: true,
      telecom: [
        {
          system: 'phone',
          value: '+86-138-0013-8000',
          use: 'mobile'
        },
        {
          system: 'email',
          value: 'wei.chen@company.com',
          use: 'work'
        }
      ],
      address: [
        {
          use: 'home',
          line: ['No. 88 Zhongshan Road'],
          city: 'Shanghai',
          postalCode: '200001',
          country: 'CN'
        }
      ]
    }
  },

  // HumanName samples
  {
    id: 'humanname-simple',
    name: 'Simple Name',
    resourceType: 'HumanName',
    description: 'Basic first and last name structure',
    data: {
      use: 'official',
      family: 'Williams',
      given: ['Sarah']
    }
  },
  {
    id: 'humanname-complex',
    name: 'Complex Name',
    resourceType: 'HumanName',
    description: 'Name with prefix, suffix, and multiple given names',
    data: {
      use: 'official',
      family: 'Rodriguez-Martinez',
      given: ['Maria', 'Carmen', 'Isabella'],
      prefix: ['Dr.'],
      suffix: ['PhD', 'MD'],
      period: {
        start: '2010-01-01'
      }
    }
  },
  {
    id: 'humanname-maiden',
    name: 'Maiden Name',
    resourceType: 'HumanName',
    description: 'Previous name with maiden use',
    data: {
      use: 'maiden',
      family: 'Thompson',
      given: ['Jennifer', 'Anne'],
      period: {
        start: '1985-06-15',
        end: '2010-08-20'
      }
    }
  },

  // Address samples
  {
    id: 'address-home',
    name: 'Home Address',
    resourceType: 'Address',
    description: 'Residential home address',
    data: {
      use: 'home',
      type: 'physical',
      line: ['789 Oak Street'],
      city: 'Denver',
      state: 'CO',
      postalCode: '80202',
      country: 'US',
      period: {
        start: '2018-03-01'
      }
    }
  },
  {
    id: 'address-work',
    name: 'Work Address',
    resourceType: 'Address',
    description: 'Business office address',
    data: {
      use: 'work',
      type: 'physical',
      line: ['1000 Corporate Blvd', 'Floor 15', 'Suite 1500'],
      city: 'Austin',
      state: 'TX',
      postalCode: '73301',
      country: 'US'
    }
  },
  {
    id: 'address-postal',
    name: 'Postal Address',
    resourceType: 'Address',
    description: 'Mailing address (P.O. Box)',
    data: {
      use: 'home',
      type: 'postal',
      line: ['P.O. Box 12345'],
      city: 'Miami',
      state: 'FL',
      postalCode: '33101',
      country: 'US'
    }
  },

  // ContactPoint samples
  {
    id: 'contactpoint-mobile',
    name: 'Mobile Phone',
    resourceType: 'ContactPoint',
    description: 'Mobile phone contact',
    data: {
      system: 'phone',
      value: '+1-555-234-5678',
      use: 'mobile',
      rank: 1,
      period: {
        start: '2020-01-01'
      }
    }
  },
  {
    id: 'contactpoint-work-email',
    name: 'Work Email',
    resourceType: 'ContactPoint',
    description: 'Business email contact',
    data: {
      system: 'email',
      value: 'contact@healthcare-clinic.com',
      use: 'work',
      rank: 2
    }
  },
  {
    id: 'contactpoint-fax',
    name: 'Fax Number',
    resourceType: 'ContactPoint',
    description: 'Office fax number',
    data: {
      system: 'fax',
      value: '+1-555-987-6543',
      use: 'work'
    }
  },
  {
    id: 'contactpoint-emergency',
    name: 'Emergency Contact',
    resourceType: 'ContactPoint',
    description: 'Emergency contact phone number',
    data: {
      system: 'phone',
      value: '+1-555-911-0000',
      use: 'home',
      rank: 3
    }
  }
];

export const getResourceTypes = (): string[] => {
  const types = [...new Set(sampleDataOptions.map(option => option.resourceType))];
  return types.sort();
};

export const getSamplesByResourceType = (resourceType: string): SampleDataOption[] => {
  return sampleDataOptions.filter(option => option.resourceType === resourceType);
};

export const getSampleById = (id: string): SampleDataOption | undefined => {
  return sampleDataOptions.find(option => option.id === id);
};