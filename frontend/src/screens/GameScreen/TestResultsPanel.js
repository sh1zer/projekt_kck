import React, { useState } from 'react';
import { Check, X, ChevronDown, ChevronRight } from 'lucide-react';

export default function TestResultsPanel({ results }) {
    const [expanded, setExpanded] = useState(new Set());

    // Placeholder when no submission yet
    if (!results) {
        return (
            <div className="test-results-panel flex items-center justify-center">
                <p>Run your code to see the test results.</p>
            </div>
        );
    }

    const { status, tests, message } = results;

    // Results can come either as { status, tests: {...} } or as an array of objects
    let entries = [];
    if (Array.isArray(results)) {
        // Legacy array format
        entries = results.map((t, idx) => [idx + 1, {
            status: t.passed ? 'PASS' : 'FAIL',
            ...t,
        }]);
    } else if (tests) {
        entries = Object.entries(tests);
    }

    // If tests are missing and we have an error only, show the error
    if (entries.length === 0) {
        return (
            <div className="test-results-panel">
                <h3 className="font-medium mb-2">{status === 'error' ? 'Compilation Error' : 'Error'}</h3>
                {message && (
                    <pre className="text-red-400 whitespace-pre-wrap text-xs bg-gray-900 p-2 rounded">{message}</pre>
                )}
            </div>
        );
    }

    const passedCount = entries.filter(([, t]) => (t.status === 'PASS') || t.passed).length;

    const toggle = (id) => {
        const newSet = new Set(expanded);
        newSet.has(id) ? newSet.delete(id) : newSet.add(id);
        setExpanded(newSet);
    };

    return (
        <div className="test-results-panel w-full h-full min-w-0">
            <h3 className="font-medium mb-4">Test Results</h3>

            <div className="space-y-2">
                {entries.map(([id, test]) => (
                    <div key={id} className="border border-gray-700 rounded">
                        <div
                            className="flex items-center gap-2 text-sm p-2 cursor-pointer hover:bg-gray-700"
                            onClick={() => toggle(id)}
                        >
                            {test.status === 'PASS' ? (
                                <Check className="w-4 h-4 text-green-500" />
                            ) : (
                                <X className="w-4 h-4 text-red-500" />
                            )}
                            <span className={test.status === 'PASS' ? 'text-green-400' : 'text-red-400'}>
                                Test #{id}
                            </span>
                            <div className="ml-auto">
                                {expanded.has(id) ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                            </div>
                        </div>
                        {expanded.has(id) && (
                            <div className="px-4 pb-2 text-xs space-y-2">
                                {test.input && (
                                    <div className="bg-gray-900 p-2 rounded">
                                        <div className="text-gray-300 font-medium mb-1">Input:</div>
                                        <div className="text-gray-400 whitespace-pre-wrap">{test.input}</div>
                                    </div>
                                )}
                                {test.expected && (
                                    <div className="bg-gray-900 p-2 rounded">
                                        <div className="text-gray-300 font-medium mb-1">Expected:</div>
                                        <div className="text-gray-400 whitespace-pre-wrap">{test.expected}</div>
                                    </div>
                                )}
                                {test.actual && (
                                    <div className="bg-gray-900 p-2 rounded">
                                        <div className="text-gray-300 font-medium mb-1">Actual:</div>
                                        <div className="text-gray-400 whitespace-pre-wrap">{test.actual}</div>
                                    </div>
                                )}
                                {test.message && (
                                    <div className="bg-red-950 border border-red-800 p-2 rounded">
                                        <div className="text-red-300 font-medium mb-1">Error:</div>
                                        <pre className="text-red-400 text-xs whitespace-pre-wrap">{test.message}</pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-400">
                {passedCount} / {entries.length} tests passed
            </div>
        </div>
    );
} 