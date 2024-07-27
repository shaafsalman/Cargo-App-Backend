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
