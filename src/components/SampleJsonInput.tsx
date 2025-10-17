import React, { useState, useEffect } from 'react';
import type { SampleJsonInputProps } from '../shared/types';

const SampleJsonInput: React.FC<SampleJsonInputProps> = ({
  value,
  onChange,
  resourceType,
}) => {
  const [error, setError] = useState<string>('');
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    validateJson(value);
  }, [value]);

  const validateJson = (jsonString: string) => {
    if (!jsonString.trim()) {
      setError('');
      setIsValid(true);
      return;
    }

    try {
      const parsed = JSON.parse(jsonString);
      
      if (parsed.resourceType !== resourceType) {
        setError(`Invalid resource type. Expected "${resourceType}", got "${parsed.resourceType || 'undefined'}".`);
        setIsValid(false);
        return;
      }

      setError('');
      setIsValid(true);
    } catch (err) {
      setError('Invalid JSON format');
      setIsValid(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };



  const formatJson = () => {
    try {
      const parsed = JSON.parse(value);
      onChange(JSON.stringify(parsed, null, 2));
    } catch (err) {
      // Do nothing if JSON is invalid
    }
  };

  const clearJson = () => {
    onChange('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-900">
            Sample {resourceType} Data
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={formatJson}
              className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
              disabled={!isValid}
            >
              Format
            </button>
            <button
              onClick={clearJson}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              Clear
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Enter or paste FHIR {resourceType} JSON data to see how it renders in your template.
        </p>
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      <div className="flex-1 p-4">
        <textarea
          value={value}
          onChange={handleChange}
          className={`w-full h-full font-mono text-sm border rounded p-3 resize-none design-canvas-scroll ${
            isValid
              ? 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              : 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
          }`}
          placeholder={`{\n  "resourceType": "${resourceType}",\n  "id": "example",\n  // Add your FHIR data here...\n}`}
        />
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span className={`flex items-center ${isValid ? 'text-green-600' : 'text-red-600'}`}>
              <span className="mr-1">
                {isValid ? '✓' : '✗'}
              </span>
              {isValid ? 'Valid JSON' : 'Invalid JSON'}
            </span>
            <span>
              {value.length} characters
            </span>
            <span>
              {value.split('\n').length} lines
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Supports: Patient resource only (MVP1)
          </div>
        </div>
      </div>
    </div>
  );
};

export default SampleJsonInput;