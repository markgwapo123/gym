from flask import request, jsonify
from app import app, bcrypt, users_collection, members_collection, attendance_collection, payments_collection
from app.models import Member, Attendance, Payment, User
from bson import ObjectId
from datetime import datetime, timedelta
from functools import wraps
import jwt

# Helper function to convert ObjectId to string
def serialize_doc(doc):
    if doc and '_id' in doc:
        doc['_id'] = str(doc['_id'])
    return doc

# JWT Token decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            current_user = users_collection.find_one({'_id': ObjectId(data['user_id'])})
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

# Admin only decorator
def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user['role'] != 'Admin':
            return jsonify({'message': 'Admin access required'}), 403
        return f(current_user, *args, **kwargs)
    return decorated


# ==================== AUTH ROUTES ====================

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register new user (Admin only - but first user can self-register)"""
    data = request.get_json()
    
    # Check if username already exists
    if users_collection.find_one({'username': data['username']}):
        return jsonify({'message': 'Username already exists'}), 400
    
    # Hash password
    password_hash = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    # Create user
    user = User.create(data, password_hash)
    result = users_collection.insert_one(user)
    
    return jsonify({
        'message': 'User registered successfully',
        'user_id': str(result.inserted_id)
    }), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user"""
    data = request.get_json()
    
    user = users_collection.find_one({'username': data['username']})
    
    if not user or not bcrypt.check_password_hash(user['password'], data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401
    
    # Generate JWT token
    token = jwt.encode({
        'user_id': str(user['_id']),
        'exp': datetime.utcnow() + timedelta(days=1)
    }, app.config['JWT_SECRET_KEY'], algorithm='HS256')
    
    return jsonify({
        'token': token,
        'user': {
            'id': str(user['_id']),
            'name': user['name'],
            'username': user['username'],
            'role': user['role']
        }
    }), 200


@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """Get current user info"""
    return jsonify({
        'id': str(current_user['_id']),
        'name': current_user['name'],
        'username': current_user['username'],
        'role': current_user['role']
    }), 200


# ==================== MEMBER ROUTES ====================

@app.route('/api/members', methods=['GET'])
@token_required
def get_members(current_user):
    """Get all members"""
    members = list(members_collection.find())
    
    # Update status for each member
    for member in members:
        member['status'] = Member.update_status(member)
        members_collection.update_one(
            {'_id': member['_id']},
            {'$set': {'status': member['status']}}
        )
        serialize_doc(member)
    
    return jsonify(members), 200


@app.route('/api/members/<member_id>', methods=['GET'])
@token_required
def get_member(current_user, member_id):
    """Get single member"""
    member = members_collection.find_one({'_id': ObjectId(member_id)})
    
    if not member:
        return jsonify({'message': 'Member not found'}), 404
    
    member['status'] = Member.update_status(member)
    serialize_doc(member)
    
    return jsonify(member), 200


@app.route('/api/members', methods=['POST'])
@token_required
@admin_required
def create_member(current_user):
    """Create new member (Admin only)"""
    data = request.get_json()
    
    member = Member.create(data)
    result = members_collection.insert_one(member)
    
    return jsonify({
        'message': 'Member created successfully',
        'member_id': str(result.inserted_id)
    }), 201


@app.route('/api/members/<member_id>', methods=['PUT'])
@token_required
@admin_required
def update_member(current_user, member_id):
    """Update member (Admin only)"""
    data = request.get_json()
    
    update_data = {
        'name': data.get('name'),
        'contact': data.get('contact'),
        'membership_type': data.get('membership_type'),
        'start_date': data.get('start_date'),
        'end_date': data.get('end_date'),
        'updated_at': datetime.utcnow()
    }
    
    # Remove None values
    update_data = {k: v for k, v in update_data.items() if v is not None}
    
    result = members_collection.update_one(
        {'_id': ObjectId(member_id)},
        {'$set': update_data}
    )
    
    if result.matched_count == 0:
        return jsonify({'message': 'Member not found'}), 404
    
    return jsonify({'message': 'Member updated successfully'}), 200


@app.route('/api/members/<member_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_member(current_user, member_id):
    """Delete member (Admin only)"""
    result = members_collection.delete_one({'_id': ObjectId(member_id)})
    
    if result.deleted_count == 0:
        return jsonify({'message': 'Member not found'}), 404
    
    return jsonify({'message': 'Member deleted successfully'}), 200


# ==================== ATTENDANCE ROUTES ====================

@app.route('/api/attendance/checkin', methods=['POST'])
@token_required
def checkin(current_user):
    """Check-in member"""
    data = request.get_json()
    member_id = data['member_id']
    
    # Get member
    member = members_collection.find_one({'_id': ObjectId(member_id)})
    
    if not member:
        return jsonify({'message': 'Member not found'}), 404
    
    # Update member status
    member['status'] = Member.update_status(member)
    
    # Check if member is active
    if member['status'] == 'Expired':
        return jsonify({'message': 'Member subscription has expired. Please renew.'}), 400
    
    # Check if already checked in today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    existing_checkin = attendance_collection.find_one({
        'member_id': member_id,
        'check_in_time': {'$gte': today_start},
        'check_out_time': None
    })
    
    if existing_checkin:
        return jsonify({'message': 'Member is already checked in'}), 400
    
    # Create check-in
    attendance = Attendance.create_checkin(member_id, current_user['name'])
    result = attendance_collection.insert_one(attendance)
    
    return jsonify({
        'message': 'Check-in successful',
        'attendance_id': str(result.inserted_id),
        'member_name': member['name'],
        'check_in_time': attendance['check_in_time'].isoformat()
    }), 201


@app.route('/api/attendance/checkout', methods=['POST'])
@token_required
def checkout(current_user):
    """Check-out member"""
    data = request.get_json()
    member_id = data['member_id']
    
    # Find active check-in
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    attendance = attendance_collection.find_one({
        'member_id': member_id,
        'check_in_time': {'$gte': today_start},
        'check_out_time': None
    })
    
    if not attendance:
        return jsonify({'message': 'No active check-in found for this member'}), 404
    
    # Update check-out time
    result = attendance_collection.update_one(
        {'_id': attendance['_id']},
        {'$set': {'check_out_time': datetime.utcnow()}}
    )
    
    return jsonify({
        'message': 'Check-out successful',
        'check_out_time': datetime.utcnow().isoformat()
    }), 200


@app.route('/api/attendance', methods=['GET'])
@token_required
def get_attendance(current_user):
    """Get attendance records"""
    # Get query parameters
    member_id = request.args.get('member_id')
    date = request.args.get('date')
    
    query = {}
    
    if member_id:
        query['member_id'] = member_id
    
    if date:
        date_obj = datetime.fromisoformat(date)
        start = date_obj.replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=1)
        query['check_in_time'] = {'$gte': start, '$lt': end}
    
    attendance_records = list(attendance_collection.find(query).sort('check_in_time', -1).limit(100))
    
    # Get member names
    for record in attendance_records:
        member = members_collection.find_one({'_id': ObjectId(record['member_id'])})
        if member:
            record['member_name'] = member['name']
        serialize_doc(record)
    
    return jsonify(attendance_records), 200


@app.route('/api/attendance/today', methods=['GET'])
@token_required
def get_today_attendance(current_user):
    """Get today's attendance"""
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    attendance_records = list(attendance_collection.find({
        'check_in_time': {'$gte': today_start}
    }).sort('check_in_time', -1))
    
    # Get member details
    for record in attendance_records:
        member = members_collection.find_one({'_id': ObjectId(record['member_id'])})
        if member:
            record['member_name'] = member['name']
            record['member_contact'] = member['contact']
        serialize_doc(record)
    
    return jsonify(attendance_records), 200


# ==================== PAYMENT ROUTES ====================

@app.route('/api/payments', methods=['GET'])
@token_required
def get_payments(current_user):
    """Get all payments"""
    member_id = request.args.get('member_id')
    
    query = {}
    if member_id:
        query['member_id'] = member_id
    
    payments = list(payments_collection.find(query).sort('payment_date', -1).limit(100))
    
    # Get member names
    for payment in payments:
        member = members_collection.find_one({'_id': ObjectId(payment['member_id'])})
        if member:
            payment['member_name'] = member['name']
        serialize_doc(payment)
    
    return jsonify(payments), 200


@app.route('/api/payments', methods=['POST'])
@token_required
def create_payment(current_user):
    """Record payment and activate/extend membership"""
    data = request.get_json()
    
    member_id = data['member_id']
    membership_plan = data['membership_plan']
    
    # Get member
    member = members_collection.find_one({'_id': ObjectId(member_id)})
    
    if not member:
        return jsonify({'message': 'Member not found'}), 404
    
    # Calculate new end date based on plan
    start_date = datetime.utcnow()
    
    if membership_plan == 'Monthly':
        end_date = start_date + timedelta(days=30)
    elif membership_plan == 'Quarterly':
        end_date = start_date + timedelta(days=90)
    elif membership_plan == 'Annual':
        end_date = start_date + timedelta(days=365)
    else:
        return jsonify({'message': 'Invalid membership plan'}), 400
    
    # Update member
    members_collection.update_one(
        {'_id': ObjectId(member_id)},
        {'$set': {
            'membership_type': membership_plan,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'status': 'Active',
            'updated_at': datetime.utcnow()
        }}
    )
    
    # Create payment record
    payment_data = {
        'member_id': member_id,
        'amount': data['amount'],
        'membership_plan': membership_plan,
        'staff_name': current_user['name']
    }
    
    payment = Payment.create(payment_data)
    result = payments_collection.insert_one(payment)
    
    return jsonify({
        'message': 'Payment recorded and membership activated',
        'payment_id': str(result.inserted_id),
        'end_date': end_date.isoformat()
    }), 201


# ==================== DASHBOARD ROUTES ====================

@app.route('/api/dashboard/stats', methods=['GET'])
@token_required
def get_dashboard_stats(current_user):
    """Get dashboard statistics"""
    
    # Total members
    total_members = members_collection.count_documents({})
    
    # Active members
    active_members = members_collection.count_documents({'status': 'Active'})
    
    # Expiring soon
    expiring_soon = members_collection.count_documents({'status': 'Expiring Soon'})
    
    # Today's attendance
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_attendance = attendance_collection.count_documents({
        'check_in_time': {'$gte': today_start}
    })
    
    # Currently checked in
    currently_checked_in = attendance_collection.count_documents({
        'check_in_time': {'$gte': today_start},
        'check_out_time': None
    })
    
    # This month's revenue
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    payments = list(payments_collection.find({
        'payment_date': {'$gte': month_start}
    }))
    monthly_revenue = sum(payment['amount'] for payment in payments)
    
    return jsonify({
        'total_members': total_members,
        'active_members': active_members,
        'expiring_soon': expiring_soon,
        'today_attendance': today_attendance,
        'currently_checked_in': currently_checked_in,
        'monthly_revenue': monthly_revenue
    }), 200


# ==================== HEALTH CHECK ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'}), 200
