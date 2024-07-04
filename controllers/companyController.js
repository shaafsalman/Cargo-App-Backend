const CompanyModel = require('../models/companyModel');
const { connectToDatabase } = require('../db');

let companyModel;

connectToDatabase().then(pool => {
    companyModel = new CompanyModel(pool);
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});

exports.getAllCompanies = async (req, res) => {
    try {
        console.log("reached here in controller");
        console.log("req at controller",req.body);
        const companies = await companyModel.getAllCompanies();

        console.log("companies at controller",companies); 

        if (!companies || companies.length === 0) {
            return res.status(404).json({ error: 'No companies found' });
        }
        
        res.json(companies);
    } catch (err) {
        console.error('Error fetching all companies:', err);
        
        if (err instanceof TypeError) {
            return res.status(400).json({ error: 'Invalid data received' });
        } else if (err.name === 'DatabaseError') {
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        
        res.status(500).json({ error: 'Error fetching companies: ' + err.message });
    }
};

exports.getSomeCompanies = async (req, res) => {
    try {
        console.log("reached here");
        const companies = await companyModel.getSomeCompanies();
        
        if (!companies || companies.length === 0) {
            return res.status(404).json({ error: 'No companies found' });
        }
        
        res.json(companies);
    } catch (err) {
        console.error('Error fetching some companies:', err);
        
        if (err instanceof TypeError) {
            return res.status(400).json({ error: 'Invalid data received' });
        } else if (err.name === 'DatabaseError') {
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        
        res.status(500).json({ error: 'Error fetching companies: ' + err.message });
    }
};

exports.createCompany = async (companyData) => {
    try {

      console.log('In company controller:', companyData);
  
      const result = await companyModel.createCompany(companyData);
  
      if (result) {
        return 'Company created successfully';
      } else {
        throw new Error('Failed to create company');
      }
    } catch (err) {
      console.error('Error creating company:', err.message);
      throw new Error('Failed to create company: ' + err.message);
    }
  };

exports.deleteCompany = async (id) => {
    try {
        console.log(`Deleting company from controller: ${id}`);
        const result = await companyModel.deleteCompany(id);
        if (result) 
        {
            return true;
        } 
        else 
        {
            return false;
        }
    } catch (err) {
        console.error(`Error in deleteCompany controller: ${err.message}`);
        res.status(500).json({ error: `Error deleting company: ${err.message}` });
    }
};

exports.getCompanyById = async (req, res) => {
    const { id } = req.params;
    try {
        const company = await companyModel.getCompanyById(id);
        if (company) {
            res.json(company);
        } else {
            res.status(404).json({ error: 'Company not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateCompany = async (companyId, newData) => {
    try {
        console.log("in controller");
        console.log(newData);
        // Destructure the newData object to get the updated fields
        const { name, address, telephone,email,city,country,whatsapp,status,postalcode,paymentterms } = newData;

        // Validate required fields
        // if (!name || !email || !status) {
        //     throw new Error('Name, email, and status are required fields.');
        // }

        // Check if adminId is valid (optional step depending on your model)
        // Example validation:
        const existtingCompany = await companyModel.getCompanyById(companyId);
        if (!existtingCompany) {
            throw new Error(`Company with ID ${companyId} not found.`);
        }

        // Update only the fields that are provided in newData
        const updatedCompanyData = {
            name, address, telephone,email,city,country,whatsapp,status,postalcode,paymentterms,
            updated_at: new Date() // Update the updated_at timestamp
        };

        // Call the model function to update admin details
        const result = await companyModel.updateCompany(companyId, updatedCompanyData);

        return result; // Return the result of the update operation (true/false or any relevant data)
    } catch (err) {
        console.error('Error in updateCompany function:', err.message);
        throw err; // Throw the error to be caught by the calling function or middleware
    }
};

exports.activateCompany = async (companyId) => {
    try {
        console.log(`activating company from controller: ${companyId}`);
        const result = await companyModel.activateCompany(companyId);
        return result;
      } 
      catch (err) 
      {
        console.error(`Error in activateCompany controller: ${err.message}`);
        throw err;
      }
  
};
exports.deactivateCompany = async (companyId) => {
    try {
        console.log(`deactivating company from controller: ${companyId}`);
        const result = await companyModel.deactivateCompany(companyId);
        return result;
      } 
      catch (err) 
      {
        console.error(`Error in deactivateCompany controller: ${err.message}`);
        throw err;
      }
  
};


exports.findByEmail = async (req, res) => {
    const { email } = req.params;
    try {
        const company = await companyModel.findByEmail(email);
        if (company) {
            res.json(company);
        } else {
            res.status(404).json({ error: 'Company not found' });
        }
    } catch (err) {
        console.error('Error fetching company by email:', err.message);
        res.status(500).json({ error: 'Error fetching company by email: ' + err.message });
    }
};