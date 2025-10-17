import React from 'react';
import type { FieldListProps, FieldConfig } from '../shared/types';
import { getFieldConfigsForResourceType } from '../shared/defaultFields';

const FieldList: React.FC<FieldListProps> = ({ onFieldDrag, resourceType = 'Patient' }) => {
  // Get all field configurations for this resource type (includes primitives + widgets)
  const fieldConfigs = getFieldConfigsForResourceType(resourceType);

  const handleDragStart = (e: React.DragEvent, fieldConfig: FieldConfig) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      fieldType: fieldConfig.type,
      defaultProps: fieldConfig.defaultProps
    }));
    e.dataTransfer.effectAllowed = 'copy';
    onFieldDrag(fieldConfig.type);
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Field Types</h3>
      <div className="space-y-2">
        {fieldConfigs.map((config) => (
          <div
            key={`${config.type}-${config.label}`}
            draggable
            onDragStart={(e) => handleDragStart(e, config)}
            className="p-3 bg-white border border-gray-200 rounded-lg cursor-move hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{config.icon}</span>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm">
                  {config.label}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {config.description}
                </p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-gray-400">Drag</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-700 text-sm mb-2">FHIR Path Examples</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div><code>name[0].given[0]</code> - First Name</div>
          <div><code>name[0].family</code> - Last Name</div>
          <div><code>birthDate</code> - Birth Date</div>
          <div><code>gender</code> - Gender</div>
          <div><code>telecom.find(t =&gt; t.system === 'email').value</code> - Email</div>
          <div><code>telecom.find(t =&gt; t.system === 'phone').value</code> - Phone</div>
          <div><code>address[0].city</code> - City</div>
          <div><code>address[0].state</code> - State</div>
        </div>
      </div>
    </div>
  );
};

export default FieldList;
