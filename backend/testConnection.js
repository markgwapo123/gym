const mongoose = require('mongoose');
require('dotenv').config();

console.log('Attempting to connect to MongoDB...');
console.log('Connection URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('\n✅ SUCCESS! MongoDB Connected');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    console.log('Port:', mongoose.connection.port);
    process.exit(0);
  })
  .catch((err) => {
    console.log('\n❌ ERROR: Could not connect to MongoDB');
    console.log('Error:', err.message);
    console.log('\nPossible solutions:');
    console.log('1. Make sure MongoDB service is running');
    console.log('2. Check if MongoDB is installed');
    console.log('3. Verify the connection string in .env file');
    process.exit(1);
  });
