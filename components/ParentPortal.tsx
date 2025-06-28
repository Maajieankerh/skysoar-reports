import { useSession } from 'next-auth/react';
import { useState } from 'react';
import ReportCardView from './Parent/ReportCardView';

const ParentPortal = () => {
  const { data: session } = useSession();
  const [activeChild, setActiveChild] = useState(null);

  if (!session || session.user.role !== 'parent') {
    return <div>Unauthorized access</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Parent Portal</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Select Child</h2>
        <select 
          className="border p-2 rounded"
          onChange={(e) => setActiveChild(e.target.value)}
        >
          <option value="">Select a child</option>
          {/* Populate with children */}
        </select>
      </div>

      {activeChild && <ReportCardView studentId={activeChild} />}
    </div>
  );
};

export default ParentPortal;