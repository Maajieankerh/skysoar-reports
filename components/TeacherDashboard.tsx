import { useState } from 'react';
import { useSession } from 'next-auth/react';
import ScoreEntry from './Teacher/ScoreEntry';
import ViewScores from './Teacher/ViewScores';
import ClassPerformance from './Teacher/ClassPerformance';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('entry');
  const { data: session } = useSession();

  if (session?.user.role !== 'teacher') {
    return <div>Unauthorized access</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Teacher Dashboard</h1>
      
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 ${activeTab === 'entry' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('entry')}
        >
          Score Entry
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'view' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('view')}
        >
          View Scores
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'performance' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          Class Performance
        </button>
      </div>

      {activeTab === 'entry' && <ScoreEntry />}
      {activeTab === 'view' && <ViewScores />}
      {activeTab === 'performance' && <ClassPerformance />}
    </div>
  );
};

export default TeacherDashboard;