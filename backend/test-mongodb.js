const mongoose = require('mongoose');
const path = require('path');

// Load .env from backend folder
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('🔍 Testing MongoDB Atlas connection...\n');

// Debug: Check if .env is loaded
console.log('📁 Current directory:', __dirname);
console.log('📁 .env file path:', path.join(__dirname, '.env'));
console.log('🔑 MONGODB_URI exists:', !!process.env.MONGODB_URI);

const testConnection = async () => {
  try {
    // Check if MONGODB_URI exists
    if (!process.env.MONGODB_URI) {
      console.error('❌ ERROR: MONGODB_URI not found in .env file!\n');
      console.log('💡 Solution:');
      console.log('   1. Create .env file in backend folder (not in src)');
      console.log('   2. Add this line:');
      console.log('      MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-hiring\n');
      process.exit(1);
    }

    // Hide password in logs
    const safeUri = process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@');
    console.log('\n📍 Connecting to:', safeUri);
    console.log('⏳ Please wait...\n');

    // Connect with timeout
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000 // 5 second timeout
    });

    console.log('✅ SUCCESS! MongoDB Atlas Connected!\n');
    console.log('📊 Database Name:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔌 Connection State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected');

    // Test write operation
    console.log('\n📝 Testing write operation...');
    const TestSchema = new mongoose.Schema({ 
      message: String, 
      timestamp: Date 
    });
    const TestModel = mongoose.model('ConnectionTest', TestSchema);

    const testDoc = await TestModel.create({ 
      message: 'Hello from Atlas!', 
      timestamp: new Date() 
    });
    console.log('✅ Test document created with ID:', testDoc._id);

    // Cleanup
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('✅ Test document deleted');

    await mongoose.connection.close();
    console.log('\n👋 Connection closed successfully');
    console.log('\n🎉 Your MongoDB Atlas is ready to use!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ CONNECTION FAILED!\n');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    
    // Common error solutions
    console.log('\n💡 Troubleshooting:');
    if (error.message.includes('authentication failed')) {
      console.log('   → Check your username and password in .env');
      console.log('   → Password mein special characters? Encode karo');
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('timeout')) {
      console.log('   → Network Access mein 0.0.0.0/0 add karo');
      console.log('   → Internet connection check karo');
    } else if (error.message.includes('Invalid connection string')) {
      console.log('   → Connection string format check karo');
    }
    
    process.exit(1);
  }
};

testConnection();
