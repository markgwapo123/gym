import React, { useState, useEffect } from 'react';
import { attendanceAPI, membersAPI } from '../services/api';
import './Attendance.css';

function Attendance() {
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedMemberLogs, setSelectedMemberLogs] = useState([]);
  const [selectedMemberName, setSelectedMemberName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [attendanceRes, membersRes] = await Promise.all([
        attendanceAPI.getToday(),
        membersAPI.getAll()
      ]);
      setTodayAttendance(attendanceRes.data);
      setMembers(membersRes.data.filter(m => m.status !== 'Expired'));
      setLoading(false);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load data' });
      setLoading(false);
    }
  };

  const handleCheckIn = async (memberId) => {
    try {
      const response = await attendanceAPI.checkIn(memberId);
      setMessage({ type: 'success', text: response.data.message });
      loadData();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Check-in failed' 
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleCheckOut = async (memberId) => {
    try {
      const response = await attendanceAPI.checkOut(memberId);
      setMessage({ type: 'success', text: response.data.message });
      loadData();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Check-out failed' 
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const isCheckedIn = (memberId) => {
    return todayAttendance.some(
      record => record.member_id === memberId && !record.check_out_time
    );
  };

  const handleShowLogs = (memberName) => {
    const memberLogs = todayAttendance.filter(
      record => record.member_name === memberName
    );
    setSelectedMemberLogs(memberLogs);
    setSelectedMemberName(memberName);
    setShowLogsModal(true);
  };

  // Group attendance by member and get unique members
  const getUniqueAttendance = () => {
    const memberMap = new Map();
    todayAttendance.forEach(record => {
      if (!memberMap.has(record.member_name)) {
        memberMap.set(record.member_name, record);
      }
    });
    return Array.from(memberMap.values());
  };

  const uniqueAttendance = getUniqueAttendance();

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.contact.includes(searchTerm)
  );

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <h1>Attendance Management</h1>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="attendance-grid">
        <div className="card">
          <h2>Quick Check-In/Out</h2>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search member by name or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          <div className="members-list">
            {filteredMembers.map((member) => {
              const checkedIn = isCheckedIn(member._id);
              return (
                <div key={member._id} className="member-item">
                  <div className="member-info">
                    <div className="member-name">{member.name}</div>
                    <div className="member-contact">{member.contact}</div>
                    <span className={`status-badge status-${member.status.toLowerCase().replace(' ', '-')}`}>
                      {member.status}
                    </span>
                  </div>
                  <div className="member-actions">
                    {!checkedIn ? (
                      <button 
                        className="btn btn-success"
                        onClick={() => handleCheckIn(member._id)}
                      >
                        Check In
                      </button>
                    ) : (
                      <button 
                        className="btn btn-warning"
                        onClick={() => handleCheckOut(member._id)}
                      >
                        Check Out
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredMembers.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                No active members found
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h2>Today's Attendance ({uniqueAttendance.length})</h2>
          <div className="attendance-list">
            {uniqueAttendance.map((record) => (
              <div key={record._id} className="attendance-item">
                <div className="attendance-info">
                  <div 
                    className="attendance-name" 
                    style={{ 
                      cursor: 'pointer', 
                      color: '#007bff',
                      textDecoration: 'underline'
                    }}
                    onClick={() => handleShowLogs(record.member_name)}
                  >
                    {record.member_name}
                  </div>
                  <div className="attendance-time">
                    In: {new Date(record.check_in_time).toLocaleTimeString()}
                    {record.check_out_time && (
                      <> | Out: {new Date(record.check_out_time).toLocaleTimeString()}</>
                    )}
                  </div>
                  <div className="attendance-staff">Staff: {record.staff_name}</div>
                </div>
                <div className="attendance-status">
                  {record.check_out_time ? (
                    <span className="status-badge status-expired">Checked Out</span>
                  ) : (
                    <span className="status-badge status-active">In Gym</span>
                  )}
                </div>
              </div>
            ))}

            {uniqueAttendance.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                No attendance records today
              </div>
            )}
          </div>
        </div>
      </div>

      {showLogsModal && (
        <div className="modal-overlay" onClick={() => setShowLogsModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <h2>Attendance Logs - {selectedMemberName}</h2>
            <div style={{ maxHeight: '400px', overflowY: 'auto', marginTop: '20px' }}>
              {selectedMemberLogs.map((log, index) => (
                <div 
                  key={log._id} 
                  style={{ 
                    padding: '15px',
                    marginBottom: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: '#f9f9f9'
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                    Session #{index + 1}
                  </div>
                  <div style={{ marginBottom: '5px' }}>
                    <strong>Check In:</strong> {new Date(log.check_in_time).toLocaleString()}
                  </div>
                  {log.check_out_time && (
                    <div style={{ marginBottom: '5px' }}>
                      <strong>Check Out:</strong> {new Date(log.check_out_time).toLocaleString()}
                    </div>
                  )}
                  <div style={{ marginBottom: '5px' }}>
                    <strong>Staff:</strong> {log.staff_name}
                  </div>
                  <div>
                    <span className={`status-badge ${log.check_out_time ? 'status-expired' : 'status-active'}`}>
                      {log.check_out_time ? 'Completed' : 'In Gym'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowLogsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Attendance;
