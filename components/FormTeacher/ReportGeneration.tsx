import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReportCardPDF from '../ReportCardPDF';

const ReportGeneration = () => {
  const { data: session } = useSession();
  const [students, setStudents] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState('first');
  const [selectedSession, setSelectedSession] = useState(new Date().getFullYear() + '/' + (new Date().getFullYear() + 1));
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    if (session?.user.classes) {
      const formTeacherClass = session.user.classes.find(c => c.is_form_teacher)?.class;
      if (formTeacherClass) {
        fetchStudents(formTeacherClass.id);
      }
    }
  }, [session]);

  const fetchStudents = async (classId) => {
    try {
      const res = await axios.get(`/api/students?classId=${classId}`);
      setStudents(res.data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const fetchStudentScores = async (studentId) => {
    try {
      const res = await axios.get(`/api/scores?studentId=${studentId}&term=${selectedTerm}&session=${selectedSession}`);
      return res.data;
    } catch (error) {
      console.error('Failed to fetch scores:', error);
      return [];
    }
  };

  const generateReport = async (student) => {
    setIsGenerating(true);
    try {
      const scores = await fetchStudentScores(student.id);
      setReportData({ student, scores, term: selectedTerm, session: selectedSession });
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAllReports = async () => {
    setIsGenerating(true);
    try {
      for (const student of students) {
        const scores = await fetchStudentScores(student.id);
        // In a real app, you would save the generated PDFs to storage
        console.log(`Generated report for ${student.first_name} ${student.last_name}`);
      }
      alert('All reports generated successfully!');
    } catch (error) {
      console.error('Failed to generate reports:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const formTeacherClass = session?.user.classes?.find(c => c.is_form_teacher)?.class;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Report Card Generation</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <input
            type="text"
            value={formTeacherClass?.name || 'Not a form teacher'}
            readOnly
            className="w-full p-2 border rounded bg-gray-100"
          />
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
      
      <div className="mb-6">
        <button
          onClick={generateAllReports}
          disabled={isGenerating || !formTeacherClass}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-green-300 mr-4"
        >
          {isGenerating ? 'Generating All...' : 'Generate All Reports'}
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg. Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map(student => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.first_name} {student.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.registration_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => generateReport(student)}
                    disabled={isGenerating}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-blue-300 mr-2"
                  >
                    Preview
                  </button>
                  
                  {reportData?.student.id === student.id && (
                    <PDFDownloadLink
                      document={<ReportCardPDF {...reportData} />}
                      fileName={`${student.first_name}_${student.last_name}_report_${selectedTerm}_term_${selectedSession.replace('/', '_')}.pdf`}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      {({ loading }) => (loading ? 'Preparing...' : 'Download')}
                    </PDFDownloadLink>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {reportData && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-2">Report Preview</h3>
          <div className="border p-4">
            <ReportCardPDF {...reportData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGeneration;