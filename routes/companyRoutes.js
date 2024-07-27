const express = require('express');
const companyController = require('../controllers/companyController');

const router = express.Router();

// GET all companies
router.get('/', async (req, res, next) => {
    try {
        console.log("Route: GET / - Fetch all companies");
        console.log(req.body);
        await companyController.getAllCompanies(req, res);
    } 
    catch (err)
    {
        console.error('Error in companyRoutes:', err.message);
        next(err); 
    }


});

router.get('/get-payment-terms', async (req, res, next) => {
    try {

      const { companyPersonId } = req.query; 
      console.log("getting payment terms",companyPersonId);
  
      const paymentTerms = await companyController.getPaymentTerms(companyPersonId);
      console.log(paymentTerms);
      res.status(200).json({
        success: true,
        message: 'Payment terms retrieved successfully',
        paymentTerms: paymentTerms
      });
    } catch (error) {
      console.error('Error fetching payment terms:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payment terms',
        error: error.message
      });
    }
  });

router.get('/comp', async (req, res, next) => {
    try {
        console.log("Route: GET / - Fetch some companies");
        await companyController.getSomeCompanies(req, res);
    } catch (err) {
        console.error('Error in companyRoutes:', err.message);
        next(err); 
    }
});


// POST /add - Create new company
router.post('/add',  async (req, res, next) => {
    try {
      console.log("Route: POST /add - Create new company");
      console.log('Request body:', req.body);
      const { name, address, postalcode, telephone,city,country, email, whatsapp, paymentterms, status } = req.body;
      companyData ={ name, address, postalcode,city,country, telephone, email, whatsapp, paymentterms, status };
      
      const resultMessage = await companyController.createCompany(companyData);
       res.status(201).json({ message: resultMessage });
    } 
    catch (err) 
    {
        console.log("im here");
        console.error('Error creating company:', err.message);
        res.status(400).json({ error: err.message });
        next(err);
    }
  });



// GET company by ID
router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        console.log(`Route: GET /${id} - Fetch company by ID`);
        const company = await companyController.getCompanyById(id);
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }
        res.json(company);
    } catch (err) {
        console.error(`Error fetching company with ID ${id}:`, err.message);
        next(err);
    }
});

// PUT update a company
router.put('/:id', async (req, res, next) => {
    const { id } = req.params;
    const companyData = req.body;
    try {
        console.log(`Route: PUT /${id} - Update company`);
        const updatedCompany = await companyController.updateCompany(id, companyData);
        res.json(updatedCompany);
    } catch (err) {
        console.error('Error updating company:', err.message);
        res.status(400).json({ error: err.message });
        next(err);
    }
});
// DELETE a company
router.delete('/:id', async (req, res, next) => {
    const { id } = req.params;

    try {
        console.log(`Route: DELETE /${id} - Delete company`);
        const result = await companyController.deleteCompany(id);
        if (!result) {
            return res.status(404).json({ error: 'Company not found' });
        }
        res.json({ message: 'Company deleted successfully' });
    } catch (err) {
        console.error(`Error deleting company with ID ${id}:`, err.message);
        next(err);
    }
});

// PATCH activate an admin
router.patch('/:id/active', async (req, res, next) => {
    const { id } = req.params;
    try {
        console.log(`Route: PATCH /${id}/activate - Activate company`);
        const result = await companyController.activateCompany(id);
        if (!result) {
            return res.status(404).json({ error: 'Company not found' });
        }
        res.json({ message: 'Company activated successfully' });
    } catch (err) {
        console.error(`Error activating company with ID ${id}:`, err.message);
        next(err);
    }
});

// PATCH deactivate an admin
router.patch('/:id/inactive', async (req, res, next) => {
    const { id } = req.params;
    try {
        console.log(`Route: PATCH /${id}/deactivate - Deactivate company`);
        const result = await companyController.deactivateCompany(id);
        if (!result) {
            return res.status(404).json({ error: 'Company not found' });
        }
        res.json({ message: 'Company deactivated successfully' });
    } catch (err) {
        console.error(`Error deactivating company with ID ${id}:`, err.message);
        next(err);
    }
});

// Error handling middleware - this middleware should be defined last
router.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace
    res.status(500).json({ error: 'Internal Server Error' }); // Respond with a 500 Internal Server Error
});

module.exports = router;