const mongoose = require('mongoose');
const Member = require('./models/Member');
require('dotenv').config();

async function testDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB!\n');

    // Create a test member with all fields
    const testMember = new Member({
      name: 'John Doe',
      email: 'john.doe@example.com',
      contact: '09123456789',
      age: 25,
      date_of_birth: new Date('1999-01-15'),
      gender: 'Male',
      address: '123 Main Street, Manila',
      emergency_contact: {
        name: 'Jane Doe',
        phone: '09987654321',
        relationship: 'Spouse'
      },
      id_number: 'DL-123456',
      membership_type: 'Monthly',
      start_date: new Date(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      notes: 'Test member with all fields'
    });

    console.log('Creating test member...');
    await testMember.save();
    
    console.log('✅ Test member created successfully!');
    console.log('\nMember Details:');
    console.log('- Member ID:', testMember.member_id);
    console.log('- Name:', testMember.name);
    console.log('- Email:', testMember.email);
    console.log('- Contact:', testMember.contact);
    console.log('- Age:', testMember.age);
    console.log('- Gender:', testMember.gender);
    console.log('- Address:', testMember.address);
    console.log('- Emergency Contact:', testMember.emergency_contact.name);
    console.log('- Status:', testMember.status);
    console.log('\n✅ All fields are working in MongoDB!\n');

    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Database Collections:');
    collections.forEach(col => console.log('  -', col.name));

    // Count members
    const count = await Member.countDocuments();
    console.log('\nTotal Members:', count);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testDatabase();
