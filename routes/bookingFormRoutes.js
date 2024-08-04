const express = require('express');
const bookingFormController = require('../controllers/bookingFormController');

const router = express.Router();

// GET all booking forms
router.get('/', async (req, res, next) => {
    try {
        console.log("Route: GET / - Fetch all booking forms");
        const bookingForms = await bookingFormController.getAllBookingForms();
        res.json(bookingForms);
    } catch (err) {
        console.error('Error in bookingFormRoutes:', err.message);
        next(err); 
    }
});

// Example route handling booking creation
router.post('/add', async (req, res, next) => {
    try {
        const bookingData = req.body;
        // console.log("Route: POST /add - Create new booking form");
        // console.log('Request body:', req.body);
       
        const result = await bookingFormController.createBooking(bookingData);
        
        if (result.success) {
            res.status(201).json({
                success: true,
                message: 'Booking form created successfully',
                awb: result.awb  
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Failed to create booking form'
            });
        }
    } catch (err) {
        console.error('Error creating booking form:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        next(err);
    }
});

router.get('/get-from-to', async (req, res, next) => {
    try {
        const { routeID } = req.query; 
        console.log(`Route: POST /bookings-routeID - Get bookings for routeID: ${routeID}`);

        const bookings = await bookingFormController.getBookingsByRouteID(routeID);
        if (bookings !== null) {
            res.status(200).json({
                success: true,
                message: 'Bookings retrieved successfully',
                bookings: bookings
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No bookings found for the provided fromId and toId'
            });
        }
    } catch (err) {
        console.error('Error retrieving bookings by fromId and toId:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        next(err);
    }
});

router.post('/bookings-stats', async (req, res, next) => {
    try {
        const { createdById, userEmail } = req.body; 
        console.log(`Route: POST /getBookingStatistics - Get all bookings for id: ${createdById}, email: ${userEmail}`);

        const stats = await bookingFormController.getBookingStatistics(createdById, userEmail);

        if (Object.keys(stats).length > 0) {
            res.status(200).json({
                success: true,
                message: 'Active bookings retrieved successfully',
                bookings: stats
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No active bookings found'
            });
        }
    } catch (err) {
        console.error('Error retrieving stats:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        next(err);
    }
});

router.post('/active-bookings', async (req, res, next) => {
    try {
        const { createdById, userEmail } = req.body; 
        console.log(`Route: POST /active-bookings - Get all bookings for id: ${createdById}, email: ${userEmail}`);

        const activeBookings = await bookingFormController.getActiveBooking(createdById, userEmail);

        if (Object.keys(activeBookings).length > 0) {
            res.status(200).json({
                success: true,
                message: 'Active bookings retrieved successfully',
                bookings: activeBookings
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No active bookings found'
            });
        }
    } catch (err) {
        console.error('Error retrieving active bookings:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        next(err);
    }
});


router.post('/all-bookings', async (req, res, next) => {
    try {
        const { createdById, userEmail } = req.body; 
        console.log(`Route: POST /all-bookings - Get all bookings for id: ${createdById}, email: ${userEmail}`);

        const allBookings = await bookingFormController.getAllBooking(createdById, userEmail);

        if (Object.keys(allBookings).length > 0) {
            res.status(200).json({
                success: true,
                message: 'All bookings retrieved successfully',
                bookings: allBookings
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No bookings found'
            });
        }
    } catch (err) {
        console.error('Error retrieving all bookings:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        next(err);
    }
});




router.get('/total-bookings', async (req, res, next) => {
    try {
        const { createdById, userEmail } = req.body; 
        console.log(`Route: POST /all-bookings - Get all bookings for id:`);

        const allBookings = await bookingFormController.getTotalBooking();

        if (Object.keys(allBookings).length > 0) {
            res.status(200).json({
                success: true,
                message: 'All bookings retrieved successfully',
                bookings: allBookings
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No bookings found'
            });
        }
    } catch (err) {
        console.error('Error retrieving all bookings:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        next(err);
    }
});

router.get('/bookings-by-toId', async (req, res, next) => {
    const { toId } = req.query; 
    console.log(`Fetching bookings for toId: ${toId}`);
    
    try {
      const bookings = await bookingFormController.getBookingsByToId(toId);
      console.log("Bookings: ", bookings.bookings);
      
      if (bookings.bookings && bookings.bookings.length > 0) {
        res.status(200).json({
          success: true,
          message: 'Bookings retrieved successfully',
          bookings: bookings.bookings
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'No bookings found for the specified toId'
        });
      }
    } catch (err) {
      console.error(`Error retrieving bookings by toId ${toId}:`, err.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
      next(err);
    }
  });



  router.get('/track-awb', async (req, res, next) => {
    console.log("search by awb");
    const { awb } = req.query;
    
    if (!awb) {
        return res.status(400).json({
            success: false,
            message: 'AWB number is required'
        });
    }

    console.log(`Fetching bookings for AWB: ${awb}`);

    try {
        const bookings = await bookingFormController.getBookingByAwb(req);

        if (bookings.success && bookings.bookings.length > 0) {
            res.status(200).json({
                success: true,
                message: 'Bookings retrieved successfully',
                bookings: bookings.bookings
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No bookings found for the specified AWB'
            });
        }
    } catch (err) {
        console.error(`Error retrieving bookings by AWB ${awb}:`, err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        next(err);
    }
});


  // PUT update a booking form
router.get('/deliver', async (req, res, next) => {
    const { awb } = req.query;
    try {
        console.log(`Route: PUT /${awb} - Update status`);
        const updatedBookingForm = await bookingFormController.updateBookingStatusToDelivered(awb);
        res.json(updatedBookingForm);
    } catch (err) {
        console.error(`Error updating booking  with ID ${awb}:`, err.message);
        next(err);
    }
});

  



// PUT update a booking form
router.put('/:id', async (req, res, next) => {
    const { id } = req.params;
    const bookingData = req.body;
    try {
        console.log(`Route: PUT /${id} - Update booking form`);
        const updatedBookingForm = await bookingFormController.updateBookingForm(id, bookingData);
        res.json(updatedBookingForm);
    } catch (err) {
        console.error(`Error updating booking form with ID ${id}:`, err.message);
        next(err);
    }
});

// DELETE a booking form
router.delete('/:awb', async (req, res, next) => {
    const { awb } = req.params;

    try {
        console.log(`Route: DELETE /${awb} - Delete booking form`);
        const result = await bookingFormController.deleteBookingForm(awb);
        if (!result) {
            return res.status(404).json({ error: 'Booking form not found' });
        }
        res.json({ message: 'Booking form deleted successfully' });
    } catch (err) {
        console.error(`Error deleting booking form with AWB ${awb}:`, err.message);
        next(err);
    }
});




// GET shippers by user
router.post('/shippers', async (req, res, next) => {
    try {
        const { createdById, userEmail } = req.body;
        console.log(`Route: POST /shippers - Get all shippers for id: ${createdById}, email: ${userEmail}`);

        const shippers = await bookingFormController.getShippersDetails(createdById, userEmail);

        if (Object.keys(shippers).length > 0) {
            res.status(200).json({
                success: true,
                message: 'Shippers retrieved successfully',
                shippers: shippers
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No shippers found'
            });
        }
    } catch (err) {
        console.error('Error retrieving shippers:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        next(err);
    }
});

// GET receivers by user
router.post('/consignees', async (req, res, next) => {
    try {
        const { createdById, userEmail } = req.body;
        console.log(`Route: POST /receivers - Get all receivers for id: ${createdById}, email: ${userEmail}`);

        const consignees = await bookingFormController.getConsigneeDetails(createdById, userEmail);

        if (Object.keys(consignees).length > 0) {
            res.status(200).json({
                success: true,
                message: 'Consignees retrieved successfully',
                consignees: consignees
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No Consignee found'
            });
        }
    } catch (err) {
        console.error('Error retrieving Cosignees:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        next(err);
    }
});

// GET all cargo categories
router.get('/goods-categories', async (req, res, next) => {
    try {
        console.log('Route: GET /cargo-categories - Get all cargo categories');
        const cargoCategories = await bookingFormController.getAllCargoCategories();

        if (Object.keys(cargoCategories).length > 0) {
            res.status(200).json({
                success: true,
                message: 'Cargo categories retrieved successfully',
                cargoCategories: cargoCategories
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No cargo categories found'
            });
        }
    } catch (err) {
        console.error('Error retrieving cargo categories:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        next(err);
    }
});


// POST to add a cargo category
router.post('/goods-categories', async (req, res, next) => {
    try {
        const { code, category } = req.body;
        const result = await bookingFormController.addCargoCategory(code, category);
        res.status(201).json({
            success: true,
            message: 'Cargo category added successfully',
            result: result
        });
    } catch (err) {
        console.error('Error adding cargo category:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        next(err);
    }
});

// DELETE a cargo category
router.delete('/goods-categories/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const result = await bookingFormController.deleteCargoCategory(code);
        res.status(200).json({
            success: true,
            message: 'Cargo category deleted successfully',
            result: result
        });
    } catch (err) {
        console.error('Error deleting cargo category:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        next(err);
    }
});


// GET all special handling codes
router.get('/special-handling', async (req, res, next) => {
    try {
        const specialHandlingCodes = await bookingFormController.getAllSpecialHandlingCodes();

        if (Object.keys(specialHandlingCodes).length > 0) {
            res.status(200).json({
                success: true,
                message: 'Special handling codes retrieved successfully',
                specialHandlingCodes: specialHandlingCodes
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No special handling codes found'
            });
        }
    } catch (err) {
        console.error('Error retrieving special handling codes:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        next(err);
    }
});

// POST to add a special handling code
router.post('/special-handling', async (req, res, next) => {
    try {
        const { code, description } = req.body;
        const result = await bookingFormController.addSpecialHandlingCode(code, description);
        res.status(201).json({
            success: true,
            message: 'Special handling code added successfully',
            result: result
        });
    } catch (err) {
        console.error('Error adding special handling code:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        next(err);
    }
});

// DELETE a special handling code
router.delete('/special-handling/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const result = await bookingFormController.deleteSpecialHandlingCode(code);
        res.status(200).json({
            success: true,
            message: 'Special handling code deleted successfully',
            result: result
        });
    } catch (err) {
        console.error('Error deleting special handling code:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        next(err);
    }
});


// GET all cargo descriptions
router.get('/dangerous-goods', async (req, res, next) => {
    try {
        const dangerousGoods = await bookingFormController.getDangerousGoods();
        // console.log("here",dangerousGoods);

        if (Object.keys(dangerousGoods).length > 0) {
            res.status(200).json({
                success: true,
                message: 'Dangerous Goods retrieved successfully',
                dangerousGoods: dangerousGoods
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No Dangerous Goods found'
            });
        }
    } catch (err) {
        console.error('Error retrieving Dangerous Goods :', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        next(err);
    }
});
// POST to add dangerous goods
router.post('/dangerous-goods', async (req, res, next) => {
    try {
        const { code, description } = req.body;
        const result = await bookingFormController.addDangerousGoods(code, description);
        res.status(201).json({
            success: true,
            message: 'Dangerous goods added successfully',
            result: result
        });
    } catch (err) {
        console.error('Error adding dangerous goods:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        next(err);
    }
});

// DELETE dangerous goods
router.delete('/dangerous-goods/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const result = await bookingFormController.deleteDangerousGoods(code);
        res.status(200).json({
            success: true,
            message: 'Dangerous goods deleted successfully',
            result: result
        });
    } catch (err) {
        console.error('Error deleting dangerous goods:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        next(err);
    }
});

router.post('/add-master-awb', async (req, res, next) => {
    console.log("request",req)
    try {
        console.log("Route: POST /add-master-awb - Add master AWB");
        await bookingFormController.addMasterAwb(req, res, next);
    } catch (err) {
        console.error('Error in bookingFormRoutes:', err.message);
        next(err);
    }
});



// Error handling middleware - this middleware should be defined last
router.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace
    res.status(500).json({ error: 'Internal Server Error' }); // Respond with a 500 Internal Server Error
});

module.exports = router;
