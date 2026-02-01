import React, { useState, useEffect } from 'react';
import { membersAPI, paymentsAPI, attendanceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Members.css';

function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showMobileMembersModal, setShowMobileMembersModal] = useState(false);
  const [mobileFilterType, setMobileFilterType] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberLogs, setMemberLogs] = useState({ attendance: [], payments: [] });
  const [editingMember, setEditingMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    age: '',
    date_of_birth: '',
    gender: '',
    address: '',
    photo_url: '',
    membership_type: 'Monthly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: '',
    payment_amount: 0
  });

  const [membershipPrices, setMembershipPrices] = useState({
    Daily: 50,
    Monthly: 500,
    Quarterly: 1350,
    Annual: 5000
  });

  // Load prices from localStorage
  useEffect(() => {
    const savedPrices = localStorage.getItem('membershipPrices');
    if (savedPrices) {
      setMembershipPrices(JSON.parse(savedPrices));
    }

    // Listen for price updates
    const handlePricesUpdate = (event) => {
      setMembershipPrices(event.detail);
    };
    window.addEventListener('pricesUpdated', handlePricesUpdate);
    
    return () => {
      window.removeEventListener('pricesUpdated', handlePricesUpdate);
    };
  }, []);

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    // Auto-fill payment amount based on membership type
    if (formData.membership_type && !editingMember) {
      setFormData(prev => ({
        ...prev,
        payment_amount: membershipPrices[formData.membership_type] || 0
      }));
    }
  }, [formData.membership_type, editingMember, membershipPrices]);

  useEffect(() => {
    // Auto-calculate end date based on start date and membership type
    if (formData.start_date && formData.membership_type) {
      const startDate = new Date(formData.start_date);
      let endDate = new Date(startDate);

      switch (formData.membership_type) {
        case 'Daily':
          endDate.setDate(endDate.getDate() + 1);
          break;
        case 'Monthly':
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case 'Quarterly':
          endDate.setMonth(endDate.getMonth() + 3);
          break;
        case 'Annual':
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
        default:
          break;
      }

      setFormData(prev => ({
        ...prev,
        end_date: endDate.toISOString().split('T')[0]
      }));
    }
  }, [formData.start_date, formData.membership_type]);

  const loadMembers = async () => {
    try {
      const response = await membersAPI.getAll();
      setMembers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load members');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMember) {
        await membersAPI.update(editingMember._id, formData);
      } else {
        // Create member
        const memberResponse = await membersAPI.create(formData);
        
        // Create payment if amount is provided
        if (formData.payment_amount > 0) {
          await paymentsAPI.create({
            member_id: memberResponse.data._id,
            amount: formData.payment_amount,
            membership_plan: formData.membership_type
          });
        }
      }
      setShowModal(false);
      resetForm();
      loadMembers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save member');
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email || '',
      contact: member.contact,
      age: member.age || '',
      date_of_birth: member.date_of_birth ? member.date_of_birth.split('T')[0] : '',
      gender: member.gender || '',
      address: member.address || '',
      photo_url: member.photo_url || '',
      membership_type: member.membership_type,
      start_date: member.start_date.split('T')[0],
      end_date: member.end_date.split('T')[0],
      notes: member.notes || '',
      payment_amount: 0
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await membersAPI.delete(id);
        loadMembers();
      } catch (err) {
        alert('Failed to delete member');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      contact: '',
      age: '',
      date_of_birth: '',
      gender: '',
      address: '',
      photo_url: '',
      membership_type: 'Monthly',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      notes: '',
      payment_amount: membershipPrices.Monthly
    });
    setEditingMember(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleRowClick = async (member) => {
    setSelectedMember(member);
    setShowDetailsModal(true);
    
    // Load member logs
    try {
      const [attendanceRes, paymentsRes] = await Promise.all([
        attendanceAPI.getAll({ member_id: member._id }),
        paymentsAPI.getAll({ member_id: member._id })
      ]);
      setMemberLogs({
        attendance: attendanceRes.data,
        payments: paymentsRes.data
      });
    } catch (err) {
      console.error('Failed to load member logs:', err);
    }
  };

  const calculateDaysLeft = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleMobileCardClick = (filterType) => {
    setMobileFilterType(filterType);
    setShowMobileMembersModal(true);
  };

  const getMobileFilteredMembers = () => {
    switch(mobileFilterType) {
      case 'active':
        return filteredMembers.filter(m => m.status === 'Active');
      case 'expiring':
        return filteredMembers.filter(m => m.status === 'Expiring Soon');
      case 'expired':
        return filteredMembers.filter(m => m.status === 'Expired');
      default:
        return filteredMembers;
    }
  };

  const activeCount = members.filter(m => m.status === 'Active').length;
  const expiringCount = members.filter(m => m.status === 'Expiring Soon').length;
  const expiredCount = members.filter(m => m.status === 'Expired').length;

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.contact.includes(searchTerm)
  );

  if (loading) return <div className="loading">Loading members...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>Members</h1>
        {user.role === 'Admin' && (
          <button className="btn btn-primary" onClick={openAddModal}>
            + Add Member
          </button>
        )}
      </div>

      {/* Mobile Summary Cards - Only visible on mobile */}
      <div className="mobile-summary-cards">
        <div className="mobile-summary-card" onClick={() => handleMobileCardClick('all')}>
          <div className="summary-icon">👥</div>
          <div className="summary-content">
            <div className="summary-number">{members.length}</div>
            <div className="summary-label">Total Members</div>
          </div>
        </div>

        <div className="mobile-summary-card" onClick={() => handleMobileCardClick('active')}>
          <div className="summary-icon">✅</div>
          <div className="summary-content">
            <div className="summary-number">{activeCount}</div>
            <div className="summary-label">Active Members</div>
          </div>
        </div>

        {expiringCount > 0 && (
          <div className="mobile-summary-card" onClick={() => handleMobileCardClick('expiring')}>
            <div className="summary-icon">⚠️</div>
            <div className="summary-content">
              <div className="summary-number">{expiringCount}</div>
              <div className="summary-label">Expiring Soon</div>
            </div>
          </div>
        )}

        {expiredCount > 0 && (
          <div className="mobile-summary-card" onClick={() => handleMobileCardClick('expired')}>
            <div className="summary-icon">❌</div>
            <div className="summary-content">
              <div className="summary-number">{expiredCount}</div>
              <div className="summary-label">Expired</div>
            </div>
          </div>
        )}
      </div>

      <div className="card desktop-table">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <table>
          <thead>
            <tr>
              <th>Member ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Membership Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              {user.role === 'Admin' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => (
              <tr key={member._id} style={{ cursor: 'pointer' }}>
                <td onClick={() => handleRowClick(member)}>{member.member_id || 'N/A'}</td>
                <td onClick={() => handleRowClick(member)}>{member.name}</td>
                <td onClick={() => handleRowClick(member)}>{member.email || 'N/A'}</td>
                <td onClick={() => handleRowClick(member)}>{member.contact}</td>
                <td onClick={() => handleRowClick(member)}>{member.age || 'N/A'}</td>
                <td onClick={() => handleRowClick(member)}>{member.gender || 'N/A'}</td>
                <td onClick={() => handleRowClick(member)}>{member.membership_type}</td>
                <td onClick={() => handleRowClick(member)}>{new Date(member.start_date).toLocaleDateString()}</td>
                <td onClick={() => handleRowClick(member)}>{new Date(member.end_date).toLocaleDateString()}</td>
                <td onClick={() => handleRowClick(member)}>
                  <span className={`status-badge status-${member.status.toLowerCase().replace(' ', '-')}`}>
                    {member.status}
                  </span>
                </td>
                {user.role === 'Admin' && (
                  <td>
                    <button 
                      className="btn btn-sm btn-secondary" 
                      onClick={() => handleEdit(member)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => handleDelete(member._id)}
                      style={{ marginLeft: '5px' }}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {filteredMembers.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            No members found
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingMember ? 'Edit Member' : 'Add New Member'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contact Number *</label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    min="1"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Membership Details</h3>
              <div className="form-group">
                <label>Membership Type *</label>
                <select
                  value={formData.membership_type}
                  onChange={(e) => setFormData({ ...formData, membership_type: e.target.value })}
                  required
                >
                  <option value="Daily">Daily</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annual">Annual</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              {!editingMember && (
                <div className="form-group">
                  <label>Payment Amount (₱) *</label>
                  <input
                    type="number"
                    value={formData.payment_amount}
                    onChange={(e) => setFormData({ ...formData, payment_amount: e.target.value })}
                    required={!editingMember}
                    min="0"
                    step="0.01"
                  />
                  <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                    Suggested: Daily - ₱{membershipPrices.Daily}, Monthly - ₱{membershipPrices.Monthly}, Quarterly - ₱{membershipPrices.Quarterly.toLocaleString()}, Annual - ₱{membershipPrices.Annual.toLocaleString()}
                  </small>
                </div>
              )}

              <div className="form-group">
                <label>Notes / Remarks</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  placeholder="Any additional information..."
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingMember ? 'Update' : 'Add'} Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && selectedMember && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>Member Details</h2>
            
            {/* Member Info Section */}
            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                <div>
                  <strong>Member ID:</strong> {selectedMember.member_id}
                </div>
                <div>
                  <strong>Name:</strong> {selectedMember.name}
                </div>
                <div>
                  <strong>Email:</strong> {selectedMember.email || 'N/A'}
                </div>
                <div>
                  <strong>Contact:</strong> {selectedMember.contact}
                </div>
                <div>
                  <strong>Age:</strong> {selectedMember.age || 'N/A'}
                </div>
                <div>
                  <strong>Gender:</strong> {selectedMember.gender || 'N/A'}
                </div>
                <div>
                  <strong>Address:</strong> {selectedMember.address || 'N/A'}
                </div>
              </div>
            </div>

            {/* Membership Details Section */}
            <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Membership Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                <div>
                  <strong>Type:</strong> {selectedMember.membership_type}
                </div>
                <div>
                  <strong>Status:</strong>{' '}
                  <span className={`status-badge status-${selectedMember.status.toLowerCase().replace(' ', '-')}`}>
                    {selectedMember.status}
                  </span>
                </div>
                <div>
                  <strong>Start Date:</strong> {new Date(selectedMember.start_date).toLocaleDateString()}
                </div>
                <div>
                  <strong>End Date:</strong> {new Date(selectedMember.end_date).toLocaleDateString()}
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <strong>Days Left:</strong>{' '}
                  <span style={{ 
                    fontSize: '1.2em', 
                    fontWeight: 'bold',
                    color: calculateDaysLeft(selectedMember.end_date) <= 7 ? '#dc3545' : calculateDaysLeft(selectedMember.end_date) <= 30 ? '#ffc107' : '#28a745'
                  }}>
                    {calculateDaysLeft(selectedMember.end_date)} days
                  </span>
                </div>
              </div>
              {selectedMember.notes && (
                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #90caf9' }}>
                  <strong>Notes:</strong>
                  <p style={{ marginTop: '5px', color: '#666' }}>{selectedMember.notes}</p>
                </div>
              )}
            </div>

            {/* Attendance Logs Section */}
            <div style={{ marginBottom: '20px' }}>
              <h3>Attendance Logs ({memberLogs.attendance.length})</h3>
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px' }}>
                {memberLogs.attendance.length > 0 ? (
                  <table style={{ width: '100%', fontSize: '0.9em' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#fff' }}>
                      <tr>
                        <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Date</th>
                        <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Check In</th>
                        <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Check Out</th>
                        <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Staff</th>
                      </tr>
                    </thead>
                    <tbody>
                      {memberLogs.attendance.slice(0, 10).map((log) => (
                        <tr key={log._id}>
                          <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                            {new Date(log.check_in_time).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                            {new Date(log.check_in_time).toLocaleTimeString()}
                          </td>
                          <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                            {log.check_out_time ? new Date(log.check_out_time).toLocaleTimeString() : 'Still in'}
                          </td>
                          <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                            {log.staff_name}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No attendance records</p>
                )}
              </div>
            </div>

            {/* Payment History Section */}
            <div style={{ marginBottom: '20px' }}>
              <h3>Payment History ({memberLogs.payments.length})</h3>
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px' }}>
                {memberLogs.payments.length > 0 ? (
                  <table style={{ width: '100%', fontSize: '0.9em' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#fff' }}>
                      <tr>
                        <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Date</th>
                        <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Plan</th>
                        <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Amount</th>
                        <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Staff</th>
                      </tr>
                    </thead>
                    <tbody>
                      {memberLogs.payments.map((payment) => (
                        <tr key={payment._id}>
                          <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                            {new Date(payment.payment_date).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                            {payment.membership_plan}
                          </td>
                          <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                            ₱{payment.amount.toLocaleString()}
                          </td>
                          <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                            {payment.staff_name}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No payment records</p>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Members List Modal */}
      {showMobileMembersModal && (
        <div className="modal-overlay" onClick={() => setShowMobileMembersModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '95%', maxHeight: '85vh' }}>
            <h2>
              {mobileFilterType === 'all' && 'All Members'}
              {mobileFilterType === 'active' && 'Active Members'}
              {mobileFilterType === 'expiring' && 'Expiring Soon'}
              {mobileFilterType === 'expired' && 'Expired Members'}
              {' '}({getMobileFilteredMembers().length})
            </h2>
            
            <div style={{ maxHeight: '60vh', overflowY: 'auto', marginTop: '15px' }}>
              {getMobileFilteredMembers().map((member) => (
                <div 
                  key={member._id} 
                  onClick={() => { handleRowClick(member); setShowMobileMembersModal(false); }}
                  style={{
                    padding: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    background: '#f8f9fa',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong>{member.name}</strong>
                    <span className={`status-badge status-${member.status.toLowerCase().replace(' ', '-')}`}>
                      {member.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '5px' }}>
                    📱 {member.contact}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '5px' }}>
                    💳 {member.membership_type}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    📅 {new Date(member.start_date).toLocaleDateString()} - {new Date(member.end_date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-actions" style={{ marginTop: '15px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowMobileMembersModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Members;
