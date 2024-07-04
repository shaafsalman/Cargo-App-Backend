const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/', async (req, res, next) => {
    console.log("inside Login route");
    console.log('Request body:', req.body); 
    const {email, password } = req.body;
    const authData = { email, password };

    try {
        const result = await authController.login(authData);
        res.json(result);
    } catch (error) {
        console.error('Error during login:', error);
        next(error); 
    }
});

router.use((err, req, res, next) => {
    console.error('Error:', err); 
    res.status(500).json({ error: 'Internal Server Error' }); 
});

module.exports = router;
