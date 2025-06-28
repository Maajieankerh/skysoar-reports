import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { Calendar } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const AttendanceManagement = () => {
  const { data: session } = useSession();
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user.classes) {
      const teacherClasses = session.user.classes.map(c => c.class.id);
      fetchStudents(teacherClasses);
    }
  }, [session]);

  useEffect(() => {
    if (students.length > 0) {
      fetchAttendanceRecords();
    }
  }, [selectedDate, students]);

  const fetchStudents = async (classIds) => {
    try {
      const res = await axios.get(`/api/students?classId=${classIds.join(',')}`);
      setStudents(res.data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const res = await axios.get(`/api/attendance?dateFrom=${dateStr}&dateTo=${dateStr}`);
      
      const recordsMap = {};
      res.data.forEach(record => {
        recordsMap[record.studentId] = record.status;
      });
      
      setAttendanceRecords(recordsMap);
    } catch (error) {
      console.error('Failed to fetch attendance records:', error);
    }
  };

  const handleStatusChange = async (studentId, status) => {
    setIsLoading(true);
    try {
      await axios.post('/api/attendance', {
        date: selectedDate,
        studentId,
        status
      });
      
      setAttendanceRecords(prev => ({
        ...prev,
        [studentId]: status
      }));
    } catch (error) {
      console.error('Failed to update attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Attendance Management</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
        <Calendar
          date={selectedDate}
          onChange={date => setSelectedDate(date)}
          className="border rounded"
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map(student => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.first_name} {student.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.class?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={attendanceRecords[student.id] || 'present'}
                    onChange={(e) => handleStatusChange(student.id, e.target.value)}
                    disabled={isLoading}
                    className="border p-1 rounded"
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="excused">Excused</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceManagement;