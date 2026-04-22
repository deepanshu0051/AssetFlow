const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function fixIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    console.log('Connected to DB. Dropping plants collection...');
    try {
      await db.collection('plants').drop();
      console.log('Collection dropped. Indexes cleared.');
    } catch (e) {
      console.log('Collection already empty or not found: ' + e.message);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixIndex();
