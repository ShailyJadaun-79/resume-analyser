import React, { useMemo } from 'react';
import { TemplateRegistry } from '../templates/TemplateRegistry';
import { getSampleDataForTemplate } from '../templates/SampleResumeData';

const TemplatePreview = React.memo(({ slug }) => {
  const TemplateComponent = TemplateRegistry[slug] || TemplateRegistry['modern-ats'];
  
  // Memoize the sample data so it doesn't recalculate on every render
  const sampleData = useMemo(() => getSampleDataForTemplate(slug), [slug]);
  
  // Default styles for the preview
  const styles = useMemo(() => ({
    color: '#4f6bff',
    fontFamily: slug.includes('professional') || slug.includes('executive') || slug.includes('mba') || slug.includes('teacher') || slug.includes('finance') ? 'serif' 
      : slug.includes('software') ? 'mono' 
      : 'sans-serif'
  }), [slug]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100 dark:bg-dark-950 select-none pointer-events-none">
      <div 
        className="absolute top-2 left-1/2 origin-top" 
        style={{ 
          width: '816px',
          height: '1056px',
          transform: 'translateX(-50%) scale(0.18)'
        }}
      >
        <TemplateComponent resume={sampleData} styles={styles} />
      </div>
    </div>
  );
});

export default TemplatePreview;
