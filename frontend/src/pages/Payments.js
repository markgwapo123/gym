import React, { useState, useEffect } from 'react';
import { paymentsAPI } from '../services/api';
import './Payments.css';

function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await paymentsAPI.getAll();
      setPayments(response.data);
      setLoading(false);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load data' });
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading payments...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>Payments</h1>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Member</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Staff</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment._id}>
                <td>{new Date(payment.payment_date).toLocaleString()}</td>
                <td>{payment.member_name}</td>
                <td>{payment.membership_plan}</td>
                <td>₱{payment.amount.toLocaleString()}</td>
                <td>{payment.staff_name}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {payments.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            No payment records found
          </div>
        )}
      </div>
    </div>
  );
}

export default Payments;
