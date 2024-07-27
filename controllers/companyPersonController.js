const bcrypt = require('bcrypt');
const CompanyPersonModel = require('../models/companyPersonModel');
const { connectToDatabase } = require('../db');

const saltRounds = parseInt(process.env.SALT) || 10;

let companyPersonModel;

connectToDatabase().then(pool => {
    companyPersonModel = new CompanyPersonModel(pool);
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});


exports.getCompanyDetails = async (id) => {
    try {
        console.log("Getting company details in controller");
      const result = await companyPersonModel.getCompanyDetails(id);
      return result;
    } 
    catch (err) 
    {
      console.error('Error in getCompanyDetails function:', err.message);
      return false;
    }
  };

exports.getAllCompanyPersons = async (req, res) => {
    try {
        const companyPersons = await companyPersonModel.getAllCompanyPersons();
        
        if (!companyPersons || companyPersons.length === 0) {
            return res.status(404).json({ error: 'No company persons found' });
        }
        
        res.json(companyPersons);
    } catch (err) {
        console.error('Error fetching all company persons:', err);
        
        if (err instanceof TypeError) {
            return res.status(400).json({ error: 'Invalid data received' });
        } else if (err.name === 'DatabaseError') {
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        
        res.status(500).json({ error: 'Error fetching company persons: ' + err.message });
    }
};

exports.createCompanyPerson = async (companyPersonData) => {
    try {
        // console.log("in companyPersonData controller");
        // console.log(companyPersonData);
        const { name, email, password, companyname, companyid,status } = companyPersonData;


        if (!name || !email || !password || !companyname || !companyid) {
            return false;
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        let temp;
        if(status==='Active'||status==='active'){
            temp=1;
        }
        else{
            temp=0;
        }
        const newCompanyPersonData = {
            name,
            email,
            RealPassword:password,
            password: hashedPassword,
            companyid,
            companyname,
            created_at: new Date(),
            updated_at: new Date(),
            password_reset_token: null,
            remember_token: null,
            email_verified_at: new Date(),
            Deactive: temp
        };

        return result = await companyPersonModel.createCompanyPerson(newCompanyPersonData);
         
    } catch (err) {
        console.error('Error in createCompanyPerson function:', err.message);
        throw new Error(err.message);
    }
};

exports.deleteCompanyPerson = async (id) => {
    try {
        const result = await companyPersonModel.deleteCompanyPerson(id);
        return result;
    
    } catch (err) {
        console.error('Error in deleteCompanyPerson function:', err.message);
        res.status(500).json({ error: 'Error deleting company person: ' + err.message });
    }
};

exports.getCompanyPersonById = async (req, res) => {
    const { id } = req.params;
    try {
        const companyPerson = await companyPersonModel.getCompanyPersonById(id);
        if (companyPerson) {
            res.json(companyPerson);
        } else {
            res.status(404).json({ error: 'Company person not found' });
        }
    } catch (err) {
        console.error('Error in getCompanyPersonById function:', err.message);
        res.status(500).json({ error: 'Error fetching company person: ' + err.message });
    }
};

exports.activateCompanyPerson = async (id) => {
    try {
        // console.log(`activating person from controller: ${id}`);
        const result = await companyPersonModel.activateCompanyPerson(id);
        return result;
      } 
      catch (err) 
      {
        console.error(`Error in activateCompanyPerson controller: ${err.message}`);
        throw err;
      }
};

exports.deactivateCompanyPerson = async (id) => {
    try {
        // console.log(`deactivating person from controller: ${id}`);
        const result = await companyPersonModel.deactivateCompanyPerson(id);
        return result;
      } 
      catch (err) 
      {
        console.error(`Error in deactivateCompanyPerson controller: ${err.message}`);
        throw err;
      }
};



exports.getDetails = async (id) => {
    try {
        const result = await companyPersonModel.getDetails(id);

       if (!result || result.length === 0) {
        return {}; 
    }

    return result; 
    } 
    catch (err)
    {
        console.error('Error in getDetailsModel function:', err.message);
        return {}; 
    }
};


exports.updateCustomerDetails = async (id, name, email, companyName) => {
    try {
        const success = await companyPersonModel.updateCustomerDetails(id, name, email, companyName);
        if (success) {
            return { success: true, message: 'Customer details updated successfully' };
        }
        return { success: false, message: 'Failed to update customer details' };
    } catch (err) {
        console.error('Error in updateCustomerDetails function:', err.message);
        return { success: false, message: 'Error updating customer details' };
    }
};

exports.changePassword = async (id, oldPassword, newPassword) => {
    try 
    {
        hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
        const result = await companyPersonModel.changePassword(id, oldPassword, hashedNewPassword );
        return result;
    } catch (err) {
        console.error('Error in changePassword function:', err.message);
        return { success: false, message: 'Error changing password' };
    }
};

// Function to update company person details
exports.updateCompanyPerson = async (personId, newData) => {
  try {
    // Destructure the newData object to get the updated fields
    var { name, email, status,password, companyid, companyname } = newData;

    // Validate required fields
    if (!name || !email || !status || !companyid || !companyname) {
      throw new Error('Name, email, status, companyid, and companyname are required fields.');
    }

    // Check if personId is valid (optional step depending on your model)
    // Example validation:
    const existingPerson = await companyPersonModel.getCompanyPersonById(personId);
    if (!existingPerson) {
      throw new Error(`Company person with ID ${personId} not found.`);
    }
    password = await bcrypt.hash(password, saltRounds);

    // Update only the fields that are provided in newData
    const updatedPersonData = {
      name,
      email,
      status,
      companyid,
      password,
      companyname,
      updated_at: new Date() // Update the updated_at timestamp
    };

    // Call the model function to update company person details
    const result = await companyPersonModel.updateCompanyPerson(personId, updatedPersonData);

    return result; // Return the result of the update operation (true/false or any relevant data)
  } catch (err) {
    console.error('Error in updateCompanyPerson function:', err.message);
    throw err; // Throw the error to be caught by the calling function or middleware
  }
};
