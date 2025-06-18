import React from 'react';
import { Check, X, ChevronDown, ChevronRight } from 'lucide-react';

export default function TestResultsPanel({ testResults, expandedTests, toggleTestExpansion, runTests }) {
  return (
    <div className="bg-gray-850 p-4 overflow-y-auto min-w-0 w-full h-full">
      <h3 className="font-medium mb-4">Test Results</h3>
      <div className="space-y-2">
        {testResults.map((test) => (
          <div key={test.id} className="border border-gray-700 rounded">
            <div 
              className="flex items-center gap-2 text-sm p-2 cursor-pointer hover:bg-gray-700"
              onClick={() => toggleTestExpansion(test.id)}
            >
              {test.passed ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-red-500" />
              )}
              <span className={test.passed ? "text-green-400" : "text-red-400"}>
                {test.name}
              </span>
              <div className="ml-auto">
                {expandedTests.has(test.id) ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
            {expandedTests.has(test.id) && (
              <div className="px-4 pb-2 text-xs space-y-2">
                <div className="bg-gray-900 p-2 rounded">
                  <div className="text-gray-300 font-medium mb-1">Test Case:</div>
                  <div className="text-gray-400">{test.description}</div>
                </div>
                {!test.passed && (
                  <>
                    <div className="bg-gray-900 p-2 rounded">
                      <div className="text-red-300 font-medium mb-1">Expected:</div>
                      <div className="text-gray-400">{test.expected}</div>
                    </div>
                    <div className="bg-gray-900 p-2 rounded">
                      <div className="text-red-300 font-medium mb-1">Actual:</div>
                      <div className="text-gray-400">{test.actual}</div>
                    </div>
                    {test.error && (
                      <div className="bg-red-950 border border-red-800 p-2 rounded">
                        <div className="text-red-300 font-medium mb-1">Error Stack:</div>
                        <pre className="text-red-400 text-xs whitespace-pre-wrap">{test.error}</pre>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-400">
          {testResults.filter(t => t.passed).length} / {testResults.length} tests passed
        </div>
      </div>
    </div>
  );
} 