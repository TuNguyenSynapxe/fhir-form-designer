import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { DesignCanvasProps, TemplateField, DragItem, FhirResourceType, TwoColumnField } from '../shared/types';
import { forceScrollbarVisibility } from '../shared/useScrollbarVisibility';

import { getAvailableFieldNames } from '../shared/expressionEvaluator';

interface SortableFieldProps {
  field: TemplateField;
  isSelected: boolean;
  onSelect: (field: TemplateField) => void;
  onDelete: (fieldId: string) => void;
  onEdit: (field: TemplateField) => void;
  resourceType: FhirResourceType;
  availableFields: string[];
}

interface DropZoneProps {
  position: number;
  onDrop: (e: React.DragEvent, position: number) => void;
  isActive?: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ position, onDrop, isActive = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event from bubbling to parent container
    setIsHovered(false);
    onDrop(e, position);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only hide if we're actually leaving the drop zone (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsHovered(false);
    }
  };

  return (
    <div
      className={`transition-all duration-200 ${
        isHovered || isActive
          ? 'h-16 my-2 border-2 border-dashed border-blue-400 bg-blue-50 rounded-lg' 
          : 'h-4 my-1'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {(isHovered || isActive) && (
        <div className="flex items-center justify-center h-full">
          <span className="text-blue-600 text-sm font-medium">📥 Drop field here</span>
        </div>
      )}
    </div>
  );
};

const getFieldIcon = (fieldType: string, fieldData?: any) => {
  // Check for specific field types first based on inputType or label
  if (fieldData) {
    const inputType = (fieldData as any).inputType;
    const label = fieldData.label?.toLowerCase() || '';
    
    if (inputType === 'email' || label.includes('email')) return '📧';
    if (inputType === 'tel' || label.includes('phone')) return '📞';
    if (label.includes('gender')) return '👤';
  }
  
  // Default icons by field type
  switch (fieldType) {
    case 'text': return '📝';
    case 'label': return '🏷️';
    case 'date': return '📅';
    case 'select': return '📋';
    case 'radio': return '🔘';
    case 'checkbox': return '☑️';
    case 'group': return '📦';
    case 'widget': return '🧩';
    case 'twoColumn': return '📐';
    default: return '❓';
  }
};

interface EditFieldModalProps {
  field: TemplateField;
  isOpen: boolean;
  onSave: (field: TemplateField) => void;
  onCancel: () => void;
  resourceType: FhirResourceType;
  availableFields: string[];
}

const EditFieldModal: React.FC<EditFieldModalProps> = ({
  field,
  isOpen,
  onSave,
  onCancel,
  resourceType,
  availableFields,
}) => {
  const [editedField, setEditedField] = useState(field);

  // Reset editedField when field changes or modal opens
  useEffect(() => {
    setEditedField(field);
  }, [field, isOpen]);

  const handleSave = () => {
    onSave(editedField);
  };

  const handleCancel = () => {
    setEditedField(field); // Reset to original field
    onCancel();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
           onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit {field.type === 'twoColumn' ? 'Two-Column Layout' : `${field.type} Field`}
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label
            </label>
            <input
              type="text"
              value={editedField.label}
              onChange={(e) => setEditedField({ ...editedField, label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Only show FHIR Path and Expression for fields that need data binding */}
          {field.type !== 'label' && field.type !== 'twoColumn' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  FHIR Path
                </label>
                <input
                  type="text"
                  value={editedField.fhirPath || ''}
                  onChange={(e) => setEditedField({ ...editedField, fhirPath: e.target.value })}
                  placeholder="e.g., name[0].given[0]"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expression
                  <span className="text-xs text-gray-500 ml-1">(overrides FHIR Path if provided)</span>
                </label>
                <input
                  type="text"
                  value={editedField.expression || ''}
                  onChange={(e) => setEditedField({ ...editedField, expression: e.target.value })}
                  placeholder="e.g., name[0].given[0] + ' ' + name[0].family"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="text-xs text-gray-500 mt-2 p-3 bg-gray-50 rounded">
                  <div className="mb-2">
                    <strong>Available field names:</strong> {availableFields.join(', ')}
                  </div>
                  <div className="mb-2">
                    <strong>FHIR Path Examples:</strong> 
                    {resourceType === 'Patient' && (
                      <>
                        <code className="bg-blue-100 px-1 rounded ml-1">name[0].given[0] + ' ' + name[0].family</code>
                        <code className="bg-blue-100 px-1 rounded ml-1">address[0].city + ', ' + address[0].state</code>
                      </>
                    )}
                    {resourceType === 'HumanName' && (
                      <>
                        <code className="bg-blue-100 px-1 rounded ml-1">prefix[0] + ' ' + given[0] + ' ' + family</code>
                        <code className="bg-blue-100 px-1 rounded ml-1">given[0] + ' ' + suffix[0]</code>
                      </>
                    )}
                    {resourceType === 'Address' && (
                      <>
                        <code className="bg-blue-100 px-1 rounded ml-1">city + ', ' + state</code>
                        <code className="bg-blue-100 px-1 rounded ml-1">line[0] + ', ' + city</code>
                      </>
                    )}
                    {resourceType === 'ContactPoint' && (
                      <>
                        <code className="bg-blue-100 px-1 rounded ml-1">system + ': ' + value</code>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Common field properties */}
          <div className="space-y-3 p-3 bg-gray-50 rounded">
            <h4 className="text-sm font-medium text-gray-700">Display Options</h4>
            
            {/* Hide Label option for all field types */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id={`hideLabel-${field.id}`}
                checked={editedField.hideLabel || false}
                onChange={(e) => setEditedField({ ...editedField, hideLabel: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor={`hideLabel-${field.id}`} className="text-sm text-gray-700">
                Hide label in preview
              </label>
            </div>

            {/* Required option for input fields */}
            {field.type !== 'label' && field.type !== 'twoColumn' && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`required-${field.id}`}
                  checked={editedField.required || false}
                  onChange={(e) => setEditedField({ ...editedField, required: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor={`required-${field.id}`} className="text-sm text-gray-700">
                  Required field
                </label>
              </div>
            )}

            {/* Hide if no value option for data-displaying fields */}
            {field.type !== 'label' && field.type !== 'twoColumn' && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`hideIfEmpty-${field.id}`}
                  checked={editedField.hideIfEmpty || false}
                  onChange={(e) => setEditedField({ ...editedField, hideIfEmpty: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor={`hideIfEmpty-${field.id}`} className="text-sm text-gray-700">
                  Hide if no value (unchecked = show "N/A")
                </label>
              </div>
            )}
          </div>

          {/* Label-specific fields */}
          {field.type === 'label' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font Size
                </label>
                <select
                  value={(editedField as any).fontSize || 'md'}
                  onChange={(e) => setEditedField({ ...editedField, fontSize: e.target.value as 'sm' | 'md' | 'lg' | 'xl' } as TemplateField)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                  <option value="xl">Extra Large</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font Weight
                </label>
                <select
                  value={(editedField as any).fontWeight || 'normal'}
                  onChange={(e) => setEditedField({ ...editedField, fontWeight: e.target.value as 'normal' | 'bold' } as TemplateField)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={(editedField as any).color || '#000000'}
                  onChange={(e) => setEditedField({ ...editedField, color: e.target.value } as TemplateField)}
                  className="w-full h-10 border border-gray-300 rounded-md"
                />
              </div>
            </>
          )}

          {/* Select field options */}
          {field.type === 'select' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Options (one per line, format: value|label)
              </label>
              <textarea
                value={(editedField as any).options?.map((opt: any) => `${opt.value}|${opt.label}`).join('\n') || ''}
                onChange={(e) => {
                  const lines = e.target.value.split('\n').filter(line => line.trim());
                  const options = lines.map(line => {
                    const [value, label] = line.split('|');
                    return { value: value?.trim() || '', label: label?.trim() || value?.trim() || '' };
                  });
                  setEditedField({ ...editedField, options } as TemplateField);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="option1|Option 1&#10;option2|Option 2"
              />
            </div>
          )}

          {/* Radio field options */}
          {field.type === 'radio' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Options (one per line, format: value|label)
                </label>
                <textarea
                  value={(editedField as any).options?.map((opt: any) => `${opt.value}|${opt.label}`).join('\n') || ''}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n').filter(line => line.trim());
                    const options = lines.map(line => {
                      const [value, label] = line.split('|');
                      return { value: value?.trim() || '', label: label?.trim() || value?.trim() || '' };
                    });
                    setEditedField({ ...editedField, options } as TemplateField);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="option1|Option 1&#10;option2|Option 2"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`inline-${field.id}`}
                  checked={(editedField as any).inline || false}
                  onChange={(e) => setEditedField({ ...editedField, inline: e.target.checked } as TemplateField)}
                  className="mr-2"
                />
                <label htmlFor={`inline-${field.id}`} className="text-sm text-gray-700">
                  Display options horizontally (inline)
                </label>
              </div>
            </>
          )}

          {/* Widget field options */}
          {field.type === 'widget' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Widget Resource Type
                </label>
                <select
                  value={(editedField as any).widgetResourceType || 'HumanName'}
                  onChange={(e) => setEditedField({ ...editedField, widgetResourceType: e.target.value as FhirResourceType } as TemplateField)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="HumanName">HumanName</option>
                  <option value="ContactPoint">ContactPoint</option>
                  <option value="Address">Address</option>
                  <option value="Patient">Patient</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`multiple-${field.id}`}
                  checked={(editedField as any).multiple || false}
                  onChange={(e) => setEditedField({ ...editedField, multiple: e.target.checked } as TemplateField)}
                  className="mr-2"
                />
                <label htmlFor={`multiple-${field.id}`} className="text-sm text-gray-700">
                  Allow multiple instances
                </label>
              </div>
            </>
          )}

          {/* Two Column field options */}
          {field.type === 'twoColumn' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Left Column Width (%)
                </label>
                <input
                  type="number"
                  min="20"
                  max="80"
                  value={(editedField as any).leftWidth || 50}
                  onChange={(e) => {
                    const twoColField = editedField as TwoColumnField;
                    setEditedField({ 
                      ...twoColField, 
                      leftWidth: parseInt(e.target.value) || 50,
                      leftColumn: twoColField.leftColumn || [],
                      rightColumn: twoColField.rightColumn || []
                    } as TemplateField);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gap Between Columns (px)
                </label>
                <input
                  type="number"
                  min="0"
                  max="48"
                  value={(editedField as any).gap || 16}
                  onChange={(e) => {
                    const twoColField = editedField as TwoColumnField;
                    setEditedField({ 
                      ...twoColField, 
                      gap: parseInt(e.target.value) || 16,
                      leftColumn: twoColField.leftColumn || [],
                      rightColumn: twoColField.rightColumn || []
                    } as TemplateField);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded">
                <p><strong>Note:</strong> Fields can be dragged into the left and right columns of this container after it's created.</p>
                <p className="mt-1"><strong>📱 Responsive:</strong> On mobile devices, columns will stack vertically for better readability.</p>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

interface TwoColumnContainerProps {
  field: TwoColumnField;
  onFieldUpdate: (field: TemplateField) => void;
  onFieldSelect: (field: TemplateField | null) => void;
  selectedField: TemplateField | null;
  resourceType: FhirResourceType;
  availableFields: string[];
}

const TwoColumnContainer: React.FC<TwoColumnContainerProps> = ({ 
  field, 
  onFieldUpdate, 
  onFieldSelect, 
  selectedField, 
  resourceType, 
  availableFields 
}) => {
  const handleColumnDrop = (e: React.DragEvent, column: 'left' | 'right', position: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const dragData = JSON.parse(e.dataTransfer.getData('application/json')) as DragItem;
      
      if (dragData.fieldType) {
        const newField: TemplateField = {
          ...dragData.defaultProps,
          id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: dragData.fieldType,
          order: position,
        } as TemplateField;

        const updatedField: TwoColumnField = {
          ...field,
          [column === 'left' ? 'leftColumn' : 'rightColumn']: [
            ...field[column === 'left' ? 'leftColumn' : 'rightColumn'].slice(0, position),
            newField,
            ...field[column === 'left' ? 'leftColumn' : 'rightColumn'].slice(position)
          ].map((f, index) => ({ ...f, order: index }))
        };

        onFieldUpdate(updatedField);
      }
    } catch (error) {
      console.error('Failed to parse drop data:', error);
    }
  };

  const handleFieldEdit = (columnField: TemplateField, column: 'left' | 'right') => {
    const updatedField: TwoColumnField = {
      ...field,
      [column === 'left' ? 'leftColumn' : 'rightColumn']: 
        field[column === 'left' ? 'leftColumn' : 'rightColumn']
          .map(f => f.id === columnField.id ? columnField : f)
    };
    onFieldUpdate(updatedField);
  };

  const handleFieldDelete = (fieldId: string, column: 'left' | 'right') => {
    const updatedField: TwoColumnField = {
      ...field,
      [column === 'left' ? 'leftColumn' : 'rightColumn']: 
        field[column === 'left' ? 'leftColumn' : 'rightColumn']
          .filter(f => f.id !== fieldId)
          .map((f, i) => ({ ...f, order: i }))
    };
    onFieldUpdate(updatedField);
  };

  const handleDragEnd = (event: any, column: 'left' | 'right') => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const columnFields = field[column === 'left' ? 'leftColumn' : 'rightColumn'];
      const oldIndex = columnFields.findIndex(field => field.id === active.id);
      const newIndex = columnFields.findIndex(field => field.id === over.id);

      const reorderedFields = arrayMove(columnFields, oldIndex, newIndex).map((f, index) => ({
        ...f,
        order: index
      }));

      const updatedField: TwoColumnField = {
        ...field,
        [column === 'left' ? 'leftColumn' : 'rightColumn']: reorderedFields
      };

      onFieldUpdate(updatedField);
    }
  };

  const renderColumn = (columnFields: TemplateField[], column: 'left' | 'right') => {
    return (
      <div className="border border-dashed border-gray-300 rounded bg-gray-50 min-h-[100px] p-2">
        <div className="text-xs text-gray-500 mb-2 text-center font-medium">
          <span className="md:hidden">
            {column === 'left' ? '📍 First Section' : '📍 Second Section'} ({columnFields.length} fields)
          </span>
          <span className="hidden md:inline">
            {column === 'left' ? 'Left Column' : 'Right Column'} ({columnFields.length} fields)
          </span>
        </div>
        
        <SortableContext 
          items={columnFields.map(field => field.id)} 
          strategy={verticalListSortingStrategy}
        >
          <DndContext onDragEnd={(event) => handleDragEnd(event, column)}>
            {/* Drop zone at the top */}
            <ColumnDropZone 
              position={0} 
              onDrop={(e, pos) => handleColumnDrop(e, column, pos)} 
            />
            
            {columnFields.map((columnField, index) => (
              <div key={columnField.id}>
                <SortableField
                  field={columnField}
                  isSelected={selectedField?.id === columnField.id}
                  onSelect={onFieldSelect}
                  onDelete={(fieldId) => handleFieldDelete(fieldId, column)}
                  onEdit={(editedField) => handleFieldEdit(editedField, column)}
                  resourceType={resourceType}
                  availableFields={availableFields}
                />
                {/* Drop zone after each field */}
                <ColumnDropZone 
                  position={index + 1} 
                  onDrop={(e, pos) => handleColumnDrop(e, column, pos)} 
                />
              </div>
            ))}
          </DndContext>
        </SortableContext>
        
        {columnFields.length === 0 && (
          <div className="text-center text-gray-400 text-xs py-4">
            Drop fields here
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-3 border-t pt-3">
      <div 
        className="flex flex-col md:grid md:gap-2 space-y-4 md:space-y-0" 
        style={{ 
          gridTemplateColumns: `${field.leftWidth || 50}% 1fr`,
          gap: `${field.gap || 16}px`
        }}
      >
        {renderColumn(field.leftColumn, 'left')}
        {renderColumn(field.rightColumn, 'right')}
      </div>
    </div>
  );
};

interface ColumnDropZoneProps {
  position: number;
  onDrop: (e: React.DragEvent, position: number) => void;
}

const ColumnDropZone: React.FC<ColumnDropZoneProps> = ({ position, onDrop }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHovered(false);
    onDrop(e, position);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsHovered(false);
    }
  };

  return (
    <div
      className={`transition-all duration-200 ${
        isHovered
          ? 'h-8 my-1 border border-dashed border-blue-400 bg-blue-100 rounded' 
          : 'h-2 my-0.5'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {isHovered && (
        <div className="flex items-center justify-center h-full">
          <div className="text-blue-600 text-xs">📥 Drop here</div>
        </div>
      )}
    </div>
  );
};

const SortableField: React.FC<SortableFieldProps> = ({
  field,
  isSelected,
  onSelect,
  onDelete,
  onEdit,
  resourceType,
  availableFields,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleSaveEdit = (updatedField: TemplateField) => {
    onEdit(updatedField);
    setIsEditModalOpen(false);
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
  };

  const renderAdditionalConfigs = () => {
    const configs: string[] = [];

    // Common configurations
    if (field.hideIfEmpty) {
      configs.push("Hide if no value");
    }

    // Label field configurations
    if (field.type === 'label') {
      const labelField = field as any;
      if (labelField.fontSize && labelField.fontSize !== 'md') {
        const sizeMap = { sm: 'Small', lg: 'Large', xl: 'Extra Large' };
        configs.push(`Font: ${sizeMap[labelField.fontSize as keyof typeof sizeMap] || labelField.fontSize}`);
      }
      if (labelField.fontWeight === 'bold') {
        configs.push("Bold");
      }
    }

    // Widget field configurations
    if (field.type === 'widget') {
      const widgetField = field as any;
      if (widgetField.widgetResourceType) {
        configs.push(`Resource: ${widgetField.widgetResourceType}`);
      }
      if (widgetField.widgetTemplateId) {
        // Get template name from localStorage
        try {
          const stored = localStorage.getItem('fhir-templates');
          if (stored) {
            const parsed = JSON.parse(stored);
            const template = (parsed.templates || []).find((t: any) => t.id === widgetField.widgetTemplateId);
            if (template) {
              configs.push(`Template: ${template.name}`);
            }
          }
        } catch (error) {
          // Ignore error, just don't show template name
        }
      }
      if (widgetField.multiple) {
        configs.push("Multiple instances");
      }
    }

    // Select field configurations
    if (field.type === 'select') {
      const selectField = field as any;
      if (selectField.options && selectField.options.length > 0) {
        configs.push(`${selectField.options.length} options`);
      }
      if (selectField.multiple) {
        configs.push("Multiple selection");
      }
    }

    // Radio field configurations
    if (field.type === 'radio') {
      const radioField = field as any;
      if (radioField.options && radioField.options.length > 0) {
        configs.push(`${radioField.options.length} options`);
      }
      if (radioField.inline) {
        configs.push("Inline layout");
      }
    }

    // Text field configurations
    if (field.type === 'text') {
      const textField = field as any;
      if (textField.inputType && textField.inputType !== 'text') {
        const typeMap = { email: 'Email', tel: 'Phone', url: 'URL', password: 'Password' };
        configs.push(`Type: ${typeMap[textField.inputType as keyof typeof typeMap] || textField.inputType}`);
      }
      if (textField.maxLength) {
        configs.push(`Max length: ${textField.maxLength}`);
      }
    }

    // Date field configurations
    if (field.type === 'date') {
      const dateField = field as any;
      if (dateField.format && dateField.format !== 'YYYY-MM-DD') {
        configs.push(`Format: ${dateField.format}`);
      }
    }

    // Checkbox field configurations
    if (field.type === 'checkbox') {
      const checkboxField = field as any;
      if (checkboxField.defaultValue) {
        configs.push("Default: checked");
      }
    }

    // Group field configurations
    if (field.type === 'group') {
      const groupField = field as any;
      if (groupField.children && groupField.children.length > 0) {
        configs.push(`${groupField.children.length} child fields`);
      }
      if (groupField.collapsible) {
        configs.push("Collapsible");
      }
      if (groupField.defaultExpanded) {
        configs.push("Expanded by default");
      }
    }

    // Two Column field configurations
    if (field.type === 'twoColumn') {
      const twoColField = field as any;
      const leftCount = twoColField.leftColumn?.length || 0;
      const rightCount = twoColField.rightColumn?.length || 0;
      configs.push(`Left: ${leftCount} fields`);
      configs.push(`Right: ${rightCount} fields`);
      if (twoColField.leftWidth && twoColField.leftWidth !== 50) {
        configs.push(`Split: ${twoColField.leftWidth}/${100 - twoColField.leftWidth}%`);
      }
    }

    if (configs.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mb-2">
        {configs.map((config, index) => (
          <span
            key={index}
            className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
          >
            {config}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border-2 rounded-lg p-3 mb-3 cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      } ${isDragging ? 'opacity-50' : ''}`}
      onClick={() => onSelect(field)}
    >
      <EditFieldModal
        field={field}
        isOpen={isEditModalOpen}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
        resourceType={resourceType}
        availableFields={availableFields}
      />
      
      <div 
        className="flex items-center justify-between mb-2"
      >
        <div 
          className="flex items-center space-x-2 flex-1 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <span className="text-gray-400">
            ⋮⋮
          </span>
          <span>{getFieldIcon(field.type, field)}</span>
          <div>
            <span className="font-medium text-gray-900">{field.label}</span>
          </div>
        </div>
        <div 
          className="flex space-x-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditModalOpen(true);
            }}
            className="text-gray-500 hover:text-blue-600 text-sm cursor-pointer"
            title={`Edit ${field.label}`}
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(field.id);
            }}
            className="text-gray-500 hover:text-red-600 text-sm cursor-pointer"
            title={`Delete ${field.label}`}
          >
            🗑️
          </button>
        </div>
      </div>

      {field.fhirPath && (
        <div className="text-xs text-gray-500 mb-2">
          <span className="font-medium">FHIR Path:</span> <code className="bg-gray-100 px-1 py-0.5 rounded">{field.fhirPath}</code>
        </div>
      )}

      {field.expression && (
        <div className="text-xs text-gray-500 mb-2">
          <span className="font-medium">Expression:</span> <code className="bg-blue-50 px-1 py-0.5 rounded text-blue-700">{field.expression}</code>
        </div>
      )}

      {renderAdditionalConfigs()}

      {/* Two Column Layout Interactive */}
      {field.type === 'twoColumn' && (
        <TwoColumnContainer 
          field={field as TwoColumnField}
          onFieldUpdate={onEdit}
          onFieldSelect={(selectedField) => selectedField && onSelect(selectedField)}
          selectedField={isSelected ? field : null}
          resourceType={resourceType}
          availableFields={availableFields}
        />
      )}
    </div>
  );
};

const DesignCanvas: React.FC<DesignCanvasProps> = ({
  fields,
  onFieldsChange,
  onFieldSelect,
  selectedField,
  resourceType = 'Patient', // Default to Patient if not provided
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeDropZone] = useState<number | null>(null);
  
  // Get available field names for the current resource type
  const availableFields = getAvailableFieldNames(resourceType);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Force scrollbar visibility when component mounts or fields change
  useEffect(() => {
    if (scrollContainerRef.current) {
      forceScrollbarVisibility(scrollContainerRef.current);
    }
  }, [fields.length]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);

      const reorderedFields = arrayMove(fields, oldIndex, newIndex).map((field, index) => ({
        ...field,
        order: index,
      }));

      onFieldsChange(reorderedFields);
    }
  };

  const handleDropAtPosition = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    
    try {
      const dragData = JSON.parse(e.dataTransfer.getData('application/json')) as DragItem;
      
      if (dragData.fieldType) {
        let newField: TemplateField = {
          ...dragData.defaultProps,
          id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: dragData.fieldType,
          order: position,
        } as TemplateField;

        // Special handling for twoColumn field
        if (dragData.fieldType === 'twoColumn') {
          newField = {
            ...newField,
            leftColumn: [],
            rightColumn: [],
            leftWidth: 50,
            gap: 16,
          } as TwoColumnField;
        }
        
        // Insert the new field at the specified position
        const updatedFields = [...fields];
        updatedFields.splice(position, 0, newField);
        
        // Update order for all fields
        const reorderedFields = updatedFields.map((field, index) => ({
          ...field,
          order: index,
        }));
        
        onFieldsChange(reorderedFields);
        onFieldSelect(newField);
      }
    } catch (error) {
      console.error('Failed to parse drop data:', error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFieldDelete = (fieldId: string) => {
    const updatedFields = fields.filter((field) => field.id !== fieldId);
    onFieldsChange(updatedFields);
    
    if (selectedField?.id === fieldId) {
      onFieldSelect(null);
    }
  };

  const handleFieldEdit = (updatedField: TemplateField) => {
    const updatedFields = fields.map((field) =>
      field.id === updatedField.id ? updatedField : field
    );
    onFieldsChange(updatedFields);
    onFieldSelect(updatedField);
  };

  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  return (
    <div className="flex-1 bg-gray-50 flex flex-col relative h-full">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h3 className="text-lg font-medium text-gray-900">Design Canvas</h3>
        <p className="text-sm text-gray-600">
          Drag fields from the left panel to add them to your template
        </p>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 design-canvas-scroll"
        onDragOver={handleDragOver}
      >
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortedFields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
            <DropZone position={0} onDrop={handleDropAtPosition} isActive={activeDropZone === 0} />
            
            {sortedFields.map((field, index) => (
              <div key={field.id}>
                <SortableField
                  field={field}
                  isSelected={selectedField?.id === field.id}
                  onSelect={onFieldSelect}
                  onDelete={handleFieldDelete}
                  onEdit={handleFieldEdit}
                  resourceType={resourceType}
                  availableFields={availableFields}
                />
                <DropZone 
                  position={index + 1} 
                  onDrop={handleDropAtPosition} 
                  isActive={activeDropZone === index + 1} 
                />
              </div>
            ))}
          </SortableContext>

          <DragOverlay>
            {activeId ? (
              <div className="bg-white border-2 border-blue-500 rounded-lg p-3 opacity-95 rotate-2 shadow-lg">
                {/* Simplified field preview */}
                <div className="flex items-center space-x-2">
                  <span>⋮⋮</span>
                  <span>{getFieldIcon(fields.find((f) => f.id === activeId)?.type || '', fields.find((f) => f.id === activeId))}</span>
                  <span className="font-medium">{fields.find((f) => f.id === activeId)?.label}</span>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {fields.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No fields yet</h3>
            <p className="text-gray-600">
              Drag fields from the left panel to start building your template
            </p>
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      {fields.length > 3 && (
        <div className="absolute bottom-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
          {fields.length} fields
        </div>
      )}
    </div>
  );
};

export default DesignCanvas;