import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';

const ScoreEntry = () => {
  const { data: session } = useSession();
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('first');
  const [selectedSession, setSelectedSession] = useState(new Date().getFullYear() + '/' + (new Date().getFullYear() + 1));
  const [scores, setScores] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
      fetchSubjects();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedSubject && selectedTerm && selectedSession) {
      fetchExistingScores();
    }
  }, [selectedClass, selectedSubject, selectedTerm, selectedSession]);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`/api/students?classId=${selectedClass}`);
      setStudents(res.data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`/api/subjects?classId=${selectedClass}`);
      setSubjects(res.data);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  };

  const fetchExistingScores = async () => {
    try {
      const res = await axios.get(`/api/scores?classId=${selectedClass}&subjectId=${selectedSubject}&term=${selectedTerm}&session=${selectedSession}`);
      
      const scoresMap = {};
      res.data.forEach(score => {
        scoresMap[score.student_id] = {
          ca1: score.ca1_score,
          ca2: score.ca2_score,
          exam: score.exam_score,
          assignment: score.assignment_score
        };
      });
      
      setScores(scoresMap);
    } catch (error) {
      console.error('Failed to fetch existing scores:', error);
    }
  };

  const handleScoreChange = (studentId, field, value) => {
    setScores(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [field]: value ? parseFloat(value) : null
      }
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setSuccessMessage('');
    
    try {
      const promises = Object.entries(scores).map(([studentId, scoreData]) => {
        if (!scoreData) return Promise.resolve();
        
        return axios.post('/api/scores', {
          studentId,
          subjectId: selectedSubject,
          term: selectedTerm,
          session: selectedSession,
          ca1: scoreData.ca1,
          ca2: scoreData.ca2,
          exam: scoreData.exam,
          assignment: scoreData.assignment
        });
      });
      
      await Promise.all(promises);
      setSuccessMessage('Scores saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save scores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Score Entry</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Class</option>
            {session?.user.classes?.map(cls => (
              <option key={cls.class.id} value={cls.class.id}>{cls.class.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={!selectedClass}
          >
            <option value="">Select Subject</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>{subject.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="first">First Term</option>
            <option value="second">Second Term</option>
            <option value="third">Third Term</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
          <input
            type="text"
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g., 2023/2024"
          />
        </div>
      </div>
      
      {selectedClass && selectedSubject && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CA 1 (20%)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CA 2 (20%)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam (60%)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map(student => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.first_name} {student.last_name}
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={scores[student.id]?.ca1 || ''}
                        onChange={(e) => handleScoreChange(student.id, 'ca1', e.target.value)}
                        className="w-20 p-1 border rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={scores[student.id]?.ca2 || ''}
                        onChange={(e) => handleScoreChange(student.id, 'ca2', e.target.value)}
                        className="w-20 p-1 border rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        min="0"
                        max="60"
                        step="0.5"
                        value={scores[student.id]?.exam || ''}
                        onChange={(e) => handleScoreChange(student.id, 'exam', e.target.value)}
                        className="w-20 p-1 border rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={scores[student.id]?.assignment || ''}
                        onChange={(e) => handleScoreChange(student.id, 'assignment', e.target.value)}
                        className="w-20 p-1 border rounded"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            {successMessage && (
              <div className="text-green-600">{successMessage}</div>
            )}
            <button
              onClick={handleSubmit}
              disabled={isLoading || !selectedClass || !selectedSubject}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isLoading ? 'Saving...' : 'Save All Scores'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ScoreEntry;