import { useState } from 'react';
import { useSession } from 'next-auth/react';
import TeacherManagement from './Admin/TeacherManagement';
import ClassManagement from './Admin/ClassManagement';
import SubjectManagement from './Admin/SubjectManagement';
import Reports from './Admin/Reports';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('teachers');
  const { data: session } = useSession();

  if (session?.user.role !== 'admin') {
    return <div>Unauthorized access</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 ${activeTab === 'teachers' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('teachers')}
        >
          Teacher Management
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'classes' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('classes')}
        >
          Class Management
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'subjects' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('subjects')}
        >
          Subject Management
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'reports' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
      </div>

      {activeTab === 'teachers' && <TeacherManagement />}
      {activeTab === 'classes' && <ClassManagement />}
      {activeTab === 'subjects' && <SubjectManagement />}
      {activeTab === 'reports' && <Reports />}
    </div>
  );
};

export default AdminDashboard;