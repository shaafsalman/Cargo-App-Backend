const express = require('express');
const allotmentController = require('../controllers/allotmentController');

const router = express.Router();

// Route to allocate a booking
router.post('/allocate', async (req, res) => {
    const { bookingAwb, scheduleId } = req.body;
    console.log("inside allocate routing",req.body);
    const result = await allotmentController.allocateBooking(req.body);
    res.json(result);
});

// Route to deallocate a booking
router.post('/deallocate', async (req, res) => 
{
    console.log("inside deallocate routing",req.body);
    const result = await allotmentController.deallocateBooking(req.body);
    res.json(result);
});
router.post('/arrive', async (req, res) => {
    const { scheduleId } = req.body;
    console.log("inside arrive routing", req.body);
    const result = await allotmentController.arriveBookings(req.body);
    res.json(result);
});

router.post('/depart', async (req, res) => {
    const { scheduleId } = req.body;
    console.log("inside depart routing", req.body);
    const result = await allotmentController.departBookings(req.body);
    res.json(result);
});


// Route to get allocated bookings for a schedule
router.get('/allocated/:scheduleId', async (req, res) => {
    const { scheduleId } = req.params;
    const result = await allotmentController.getAllocatedBookings(Number(scheduleId));
    res.json(result);
});

// Route to get all allocations
router.get('/all', async (req, res) => {
    const result = await allotmentController.getAllAllocations();
    res.json(result);
});

module.exports = router;
