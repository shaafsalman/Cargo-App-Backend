const bcrypt = require('bcrypt');
const ConnectionModel = require('./../models/regionConnectionModel');
const { connectToDatabase } = require('../db');

const saltRounds = parseInt(process.env.SALT) || 10;

let connectionModel;

connectToDatabase().then(pool => {
    connectionModel = new ConnectionModel(pool);
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});

exports.getAllConnections = async (req, res) => {
    try {
        const connections = await connectionModel.getAllConnections();
        
        if (!connections || connections.length === 0) {
            return res.status(404).json({ error: 'No connections found' });
        }
        res.json(connections);
    } catch (err) {
        console.error('Error fetching all connections:', err);
        
        if (err instanceof TypeError) {
            return res.status(400).json({ error: 'Invalid data received' });
        } else if (err.name === 'DatabaseError') {
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        
        res.status(500).json({ error: 'Error fetching connections: ' + err.message });
    }
};

exports.addConnection = async (regionData) => {
    const { fromRegionId, toRegionId, distance } = regionData;


    try {
        // Hash the distance (if necessary, though this is not typical for distance)
        // const hashedDistance = await bcrypt.hash(distance.toString(), saltRounds);

        // Create new connection object
        const newConnection = {
            fromRegionId,
            toRegionId,
            distance // use hashed distance if necessary
        };

        // Save new connection to the database
        const result = await connectionModel.addConnection(newConnection);

        return { success: true, message: 'connection created successfully.' };
    } catch (err) {
        console.error('Error adding connection:', err);
        
        return { success: false, message: 'connection not created successfully.' };
    }
};

exports.deleteConnection = async (id) => {
    try {
        console.log("in controller");
        const result = await connectionModel.deleteConnection(id);
        if (!result) {
            return { success: false, message: 'Route not found' }; // No `err.message` here
        }
        return { success: true, message: 'Route deleted successfully' }; // No `err.message` here
    } catch (err) {
        console.error('Error in deleteRoute function:', err.message);
        return { success: false, message: 'Error deleting Route: ' + err.message };
    }
};
