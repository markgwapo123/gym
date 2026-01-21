from datetime import datetime
from bson import ObjectId

class Member:
    @staticmethod
    def create(data):
        """Create a new member"""
        member = {
            'name': data['name'],
            'contact': data['contact'],
            'membership_type': data['membership_type'],
            'start_date': data['start_date'],
            'end_date': data['end_date'],
            'status': 'Active',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        return member
    
    @staticmethod
    def update_status(member):
        """Update member status based on end_date"""
        end_date = datetime.fromisoformat(member['end_date']) if isinstance(member['end_date'], str) else member['end_date']
        now = datetime.utcnow()
        
        if end_date < now:
            return 'Expired'
        elif (end_date - now).days <= 3:
            return 'Expiring Soon'
        else:
            return 'Active'


class Attendance:
    @staticmethod
    def create_checkin(member_id, staff_name):
        """Create check-in record"""
        attendance = {
            'member_id': member_id,
            'check_in_time': datetime.utcnow(),
            'check_out_time': None,
            'staff_name': staff_name,
            'created_at': datetime.utcnow()
        }
        return attendance


class Payment:
    @staticmethod
    def create(data):
        """Create payment record"""
        payment = {
            'member_id': data['member_id'],
            'amount': data['amount'],
            'payment_date': datetime.utcnow(),
            'payment_method': data.get('payment_method', 'Cash'),
            'membership_plan': data['membership_plan'],
            'staff_name': data['staff_name'],
            'created_at': datetime.utcnow()
        }
        return payment


class User:
    @staticmethod
    def create(data, password_hash):
        """Create new user"""
        user = {
            'name': data['name'],
            'username': data['username'],
            'password': password_hash,
            'role': data['role'],  # 'Admin' or 'Staff'
            'created_at': datetime.utcnow()
        }
        return user
