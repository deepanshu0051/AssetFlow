const mongoose = require('mongoose');

const enforceDatabaseStructure = async () => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      console.warn('Database connection not established. Skipping enforcement.');
      return;
    }


    // Get list of all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((col) => col.name);

    const allowedCollections = ['users', 'machines', 'deleted_machines'];

    // 1. Log disallowed collections (DO NOT DROP in production)
    for (const name of collectionNames) {
      if (!allowedCollections.includes(name)) {
        console.warn(`[SAFETY] Found unexpected collection: ${name}. Automatic deletion is disabled for safety.`);
        // try {
        //   await db.dropCollection(name);
        // } catch (dropErr) {
        //   console.error(`Failed to drop collection ${name}: ${dropErr.message}`);
        // }
      }
    }

    // 2. Perform Migration on existing machines
    if (collectionNames.includes('machines')) {
      const machinesColl = db.collection('machines');
      const allMachines = await machinesColl.find({}).toArray();

      let migratedCount = 0;

      for (const machine of allMachines) {
        let needsUpdate = false;
        const updateDoc = { $set: {}, $unset: {} };

        // Convert ObjectId references or missing fields to string fields
        if (machine.plant && !machine.plantName) {
          updateDoc.$set.plantName = 'Unknown Plant (Migrated)';
          updateDoc.$unset.plant = "";
          needsUpdate = true;
        } else if (machine.plant) {
          updateDoc.$unset.plant = "";
          needsUpdate = true;
        }

        if (machine.product || machine.productName) {
          updateDoc.$unset.product = "";
          updateDoc.$unset.productName = "";
          needsUpdate = true;
        }

        // Calculate missing GST attributes dynamically
        if (machine.cost !== undefined) {
          const cost = parseFloat(machine.cost) || 0;
          const gstPerc = parseFloat(machine.gstPercentage) || 18;
          
          if (machine.gstAmount === undefined) {
            updateDoc.$set.gstAmount = (cost * gstPerc) / 100;
            updateDoc.$set.gstPercentage = gstPerc;
            needsUpdate = true;
          }
        }

        // Run update query if mutations found
        if (needsUpdate) {
          const setKeys = Object.keys(updateDoc.$set).length > 0 ? updateDoc.$set : null;
          const unsetKeys = Object.keys(updateDoc.$unset).length > 0 ? updateDoc.$unset : null;
          
          const finalUpdate = {};
          if (setKeys) finalUpdate.$set = setKeys;
          if (unsetKeys) finalUpdate.$unset = unsetKeys;

          await machinesColl.updateOne({ _id: machine._id }, finalUpdate);
          migratedCount++;
        }
      }
      
      if (migratedCount > 0) {
      }
    }

  } catch (error) {
    console.error(`Database enforcement error: ${error.message}`);
  }
};

module.exports = enforceDatabaseStructure;
