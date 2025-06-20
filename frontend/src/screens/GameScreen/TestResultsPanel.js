import React from 'react';
import { Check, X, ChevronDown, ChevronRight } from 'lucide-react';

function TestResultsPanel({ results }) {
    if (!results) {
        return (
            <div className="test-results-panel">
                <div className="no-results">
                    <p>Run your code to see the test results.</p>
                </div>
            </div>
        );
    }
    
    const { status, tests } = results;

    // Handle compilation errors or other issues
    if (status !== 'success' && status !== 'failure') {
        return (
            <div className="test-results-panel">
                <div className="compilation-error">
                    <h3>{status === 'error' ? 'Compilation Error' : 'Error'}</h3>
                    <pre>{results.message}</pre>
                </div>
            </div>
        );
    }

    return (
        <div className="test-results-panel">
            <h3>Test Results</h3>
            <div className="results-summary">
                {Object.values(tests).filter(t => t.status === 'PASS').length} / {Object.keys(tests).length} tests passed
            </div>
            <div className="tests-list">
                {Object.entries(tests).map(([id, test]) => (
                    <div key={id} className={`test-case ${test.status.toLowerCase()}`}>
                        <div className="test-header">
                            {test.status === 'PASS' ? <Check size={18} /> : <X size={18} />}
                            <span>Test #{id}</span>
                        </div>
                        {test.status !== 'PASS' && test.message && (
                            <div className="test-details">
                                <pre>{test.message}</pre>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TestResultsPanel; 