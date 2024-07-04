const bcrypt = require('bcrypt');
const AdminModel = require('../models/adminModel');
const { connectToDatabase } = require('../db');

const saltRounds = parseInt(process.env.SALT) || 10;

let adminModel;

connectToDatabase().then(pool => {
    adminModel = new AdminModel(pool);
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});

exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await adminModel.getAllAdmins();
        
        if (!admins || admins.length === 0) {
            return res.status(404).json({ error: 'No admins found' });
        }
        console.log("hello");
        res.json(admins);
    } catch (err) {
        console.error('Error fetching all admins:', err);
        
        if (err instanceof TypeError) {
            return res.status(400).json({ error: 'Invalid data received' });
        } else if (err.name === 'DatabaseError') {
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        
        res.status(500).json({ error: 'Error fetching admins: ' + err.message });
    }
};

exports.createAdmin = async (adminData) => {
    try {
        console.log("in admin controller");
        console.log(adminData);
        const { name, email, password,status } = adminData;

        if (!name || !email || !password || !status) {
            return false;
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        let temp;
        if(status==='Active') temp=1;
        else    temp=0
        const newAdminData = {
            name,
            email,
            password: hashedPassword,
            created_at: new Date(),
            updated_at: new Date(),
            password_reset_token: null,
            GroupID: null,
            CustomerID: null,
            remember_token: null,
            email_verified_at: new Date(),
            activation_status:temp
        };

        const result  = await adminModel.createAdmin(newAdminData);

        return result;
    } catch (err) {
        console.error('Error in createAdmin function:', err.message);
        res.status(500).json({ error: 'Error creating admin: ' + err.message });
    }
};

exports.updateAdmin = async (adminId, newData) => {
    try {
        // Destructure the newData object to get the updated fields
        const { name, email, status } = newData;

        // Validate required fields
        // if (!name || !email || !status) {
        //     throw new Error('Name, email, and status are required fields.');
        // }

        // Check if adminId is valid (optional step depending on your model)
        // Example validation:
        const existingAdmin = await adminModel.getAdminById(adminId);
        if (!existingAdmin) {
            throw new Error(`Admin with ID ${adminId} not found.`);
        }

        // Update only the fields that are provided in newData
        const updatedAdminData = {
            name,
            email,
            status,
            updated_at: new Date() // Update the updated_at timestamp
        };

        // Call the model function to update admin details
        const result = await adminModel.updateAdmin(adminId, updatedAdminData);

        return result; // Return the result of the update operation (true/false or any relevant data)
    } catch (err) {
        console.error('Error in updateAdmin function:', err.message);
        throw err; // Throw the error to be caught by the calling function or middleware
    }
};
exports.deleteAdmin = async (adminId) => {
    try {
      console.log(`Deleting admin from controller: ${adminId}`);
      const result = await adminModel.deleteAdmin(adminId);
      return result;
    } catch (err) {
      console.error(`Error in deleteAdmin controller: ${err.message}`);
      throw err;
    }
  };

exports.getAdminById = async (req, res) => {
    const { id } = req.params;
    try {
        const admin = await adminModel.getAdminById(id);
        if (admin) {
            res.json(admin);
        } else {
            res.status(404).json({ error: 'Admin not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.activateAdmin = async (adminId) => {
    try {
        console.log(`activating admin from controller: ${adminId}`);
        const result = await adminModel.activateAdmin(adminId);
        return result;
      } 
      catch (err) 
      {
        console.error(`Error in activateAdmin controller: ${err.message}`);
        throw err;
      }
  
};
exports.deactivateAdmin = async (adminId) => {
    try {
        console.log(`deactivating admin from controller: ${adminId}`);
        const result = await adminModel.deactivateAdmin(adminId);
        return result;
      } 
      catch (err) 
      {
        console.error(`Error in deactivateAdmin controller: ${err.message}`);
        throw err;
      }
  
};


exports.getDetails = async (id) => {
    try {
        console.log(`Route: POST adminController/profile - Get all Details for id: ${id}`);
        const result = await adminModel.getDetails(id);

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
        const success = await adminModel.updateAdminDetails(id, name, email, companyName);
        if (success) {
            return { success: true, message: 'Customer details updated successfully' };
        }
        return { success: false, message: 'Failed to update customer details' };
    } catch (err) {
        console.error('Error in updateAdminDetails function:', err.message);
        return { success: false, message: 'Error updating Admin details' };
    }
};

exports.changePassword = async (id, oldPassword, newPassword) => {
    try {
        const result = await adminModel.changePassword(id, oldPassword, newPassword);
        return result;
    } catch (err) {
        console.error('Error in changePassword function:', err.message);
        return { success: false, message: 'Error changing password' };
    }
};

