const { MongoClient } = require('mongodb');

// TODO: Replace with your actual MongoDB connection URI
const MONGO_URI = 'YOUR_MONGODB_URI_HERE'; 

const connectDB = async (app) => {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log('MongoDB Connected...');
    // TODO: Replace 'mydatabase' with your actual database name
    app.locals.db = client.db('mydatabase'); 
    console.log('Database object attached to app.locals.db');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
