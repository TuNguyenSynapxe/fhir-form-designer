import React, { useState } from 'react';
import { evaluateExpression } from '../shared/expressionEvaluator';
import type { FhirResource } from '../shared/types';
import get from 'lodash.get';

interface ExpressionTestProps {
  sampleData: FhirResource | null;
}

export default function ExpressionTest({ sampleData }: ExpressionTestProps) {
  const [expression, setExpression] = useState('name[0].given[0]');
  const [result, setResult] = useState('');
  const [directResult, setDirectResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testExpression = () => {
    if (!expression.trim()) {
      setResult('Please enter an expression');
      setDirectResult('');
      return;
    }

    if (!sampleData) {
      setResult('No sample data available');
      setDirectResult('');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log(`\n=== Testing Expression: ${expression} ===`);
      console.log('Sample data:', sampleData);
      
      const evalResult = evaluateExpression(expression, sampleData);
      console.log(`Result: "${evalResult}"`);
      console.log(`Result length: ${evalResult.length}`);
      console.log(`Result type: ${typeof evalResult}`);
      
      // Test direct lodash.get if it's a simple path
      let directGetResult = '';
      if (/^[a-zA-Z][a-zA-Z0-9\[\]\.]*$/.test(expression.trim())) {
        try {
          const directValue = get(sampleData, expression.trim());
          directGetResult = String(directValue || '');
          console.log(`Direct lodash.get result: "${directGetResult}"`);
        } catch (e) {
          directGetResult = 'N/A (not a simple path)';
        }
      } else {
        directGetResult = 'N/A (complex expression)';
      }
      
      setResult(evalResult);
      setDirectResult(directGetResult);
    } catch (error) {
      console.error('Test error:', error);
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
      setDirectResult('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      testExpression();
    }
  };

  if (!sampleData) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded p-3">
        <h4 className="text-sm font-medium text-gray-600 mb-2">Expression Test Panel</h4>
        <p className="text-xs text-gray-500">No sample data available. Please enter sample JSON data to test expressions.</p>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
      <h4 className="text-sm font-medium text-yellow-800 mb-3">
        Expression Test Panel - {sampleData.resourceType}
      </h4>
      
      {/* Input and Button */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter FHIR expression (e.g., name[0].given[0])"
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={testExpression}
          disabled={isLoading}
          className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Testing...' : 'Test'}
        </button>
      </div>

      {/* Quick Test Buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={() => setExpression('name[0].given[0]')}
          className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          name[0].given[0]
        </button>
        <button
          onClick={() => setExpression('name[0].given[0] + " " + name[0].family')}
          className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Full Name
        </button>
        <button
          onClick={() => setExpression('firstName + " " + lastName')}
          className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Field Names
        </button>
      </div>

      {/* Results */}
      {(result || directResult) && (
        <div className="space-y-2">
          <div>
            <label className="text-xs font-medium text-gray-600">Expression Result:</label>
            <div className="mt-1 p-2 bg-white border border-gray-200 rounded text-sm font-mono">
              {result ? `"${result}"` : '(empty)'}
            </div>
          </div>
          
          {directResult && directResult !== 'N/A (complex expression)' && directResult !== 'N/A (not a simple path)' && (
            <div>
              <label className="text-xs font-medium text-gray-600">Direct lodash.get Result:</label>
              <div className="mt-1 p-2 bg-white border border-gray-200 rounded text-sm font-mono">
                {directResult ? `"${directResult}"` : '(empty)'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}