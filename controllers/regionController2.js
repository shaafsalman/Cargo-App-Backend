const RegionModel = require('../models/regionModel2.js');
const { connectToDatabase } = require('../db');

let regionModel;

connectToDatabase().then(pool => {
    regionModel = new RegionModel(pool);
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});

exports.getAllRegions = async (req, res) => {
    try {
        const regions = await regionModel.getAllRegions();
        
        if (!regions || regions.length === 0) {
            return res.status(404).json({ error: 'No regions found' });
        }
        
        res.json(regions);
    } catch (err) {
        console.error('Error fetching all regions:', err);
        
        if (err instanceof TypeError) {
            return res.status(400).json({ error: 'Invalid data received' });
        } else if (err.name === 'DatabaseError') {
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        
        res.status(500).json({ error: 'Error fetching regions: ' + err.message });
    }
};

exports.getRegionById = async (req, res) => {
    const { id } = req.params;
    try {
        const region = await regionModel.getRegionById(id);
        if (region) {
            res.json(region);
        } else {
            res.status(404).json({ error: 'Region not found' });
        }
    } catch (err) {
        console.error('Error in getRegionById function:', err.message);
        res.status(500).json({ error: 'Error fetching region: ' + err.message });
    }
};

exports.createRegion = async (regionData) => {
    try {
        const { name, code } = regionData;

        if (!name || !code) {
            return false;
        }

        const newRegionData = {
            name,
            code,
            created_at: new Date(),
            updated_at: new Date()
        };

        return await regionModel.createRegion(newRegionData);
    } catch (err) {
        console.error('Error in createRegion function:', err.message);
        res.status(500).json({ error: 'Error creating region: ' + err.message });
    }
};

exports.updateRegion = async (req, res) => {
    const { id } = req.params;
    const regionData = req.body;
    try {
        const updatedRegion = await regionModel.updateRegion(id, regionData);
        res.json(updatedRegion);
    } catch (err) {
        console.error('Error in updateRegion function:', err.message);
        res.status(500).json({ error: 'Error updating region: ' + err.message });
    }
};

exports.deleteRegion = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await regionModel.deleteRegion(id);
        if (!result) {
            return res.status(404).json({ error: 'Region not found' });
        }
        res.json({ message: 'Region deleted successfully' });
    } catch (err) {
        console.error('Error in deleteRegion function:', err.message);
        res.status(500).json({ error: 'Error deleting region: ' + err.message });
    }
};