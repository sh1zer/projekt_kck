import React from 'react';

export default function ProblemPanel(props) {
  return (
    <div style={{
      background:'#101a28',
      borderRadius:'8px',
      padding:'1rem 1rem 1rem 1rem',
      maxWidth:'900px',
      width:'100%',
      boxSizing:'border-box',
      display:'flex',
      flexDirection:'column',
      height:'100%',
      margin:'0 auto',
      flex: 1,
      minHeight: 0,
      ...props?.style
    }}>
      <h1 className="text-xl font-bold mb-4" style={{color: '#fff'}}>Median of Two Sorted Arrays</h1>
      <div className="text-white space-y-4">
        <p>
          Given two sorted arrays <span style={{color:'#e53e3e'}}>nums1</span> and <span style={{color:'#e53e3e'}}>nums2</span> of size m and n respectively, 
          return the median of the two merged arrays.
        </p>
        <p>The overall run time complexity should be <span style={{color:'#ffd700'}}>O(log (m+n))</span>.</p>
        <div className="mt-6">
          <h3 className="font-semibold mb-2" style={{color: '#e53e3e'}}>Example 1:</h3>
          <div style={{background:'#101a28', color:'#fff', border:'1px solid #ffd700', borderRadius:'6px', padding:'0.75rem'}} className="font-mono text-sm">
            <div><span style={{color:'#ffd700'}}>Input:</span> nums1 = [1,3], nums2 = [2]</div>
            <div><span style={{color:'#ffd700'}}>Output:</span> 2.00000</div>
            <div><span style={{color:'#e53e3e'}}>Explanation:</span> merged array = [1,2,3] and median is 2.</div>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="font-semibold mb-2" style={{color: '#e53e3e'}}>Example 2:</h3>
          <div style={{background:'#101a28', color:'#fff', border:'1px solid #ffd700', borderRadius:'6px', padding:'0.75rem'}} className="font-mono text-sm">
            <div><span style={{color:'#ffd700'}}>Input:</span> nums1 = [1,2], nums2 = [3,4]</div>
            <div><span style={{color:'#ffd700'}}>Output:</span> 2.50000</div>
            <div><span style={{color:'#e53e3e'}}>Explanation:</span> merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
