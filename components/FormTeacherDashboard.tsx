import { useState } from 'react';
import { useSession } from 'next-auth/react';
import StudentManagement from './FormTeacher/StudentManagement';
import ScoreView from './FormTeacher/ScoreView';
import ReportGeneration from './FormTeacher/ReportGeneration';

const FormTeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('students');
  const { data: session } = useSession();

  if (session?.user.role !== 'form_teacher') {
    return <div>Unauthorized access</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Form Teacher Dashboard</h1>
      
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 ${activeTab === 'students' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          Student Management
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'scores' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('scores')}
        >
          View Scores
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'reports' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Generate Reports
        </button>
      </div>

      {activeTab === 'students' && <StudentManagement />}
      {activeTab === 'scores' && <ScoreView />}
      {activeTab === 'reports' && <ReportGeneration />}
    </div>
  );
};

export default FormTeacherDashboard;