const bcrypt = require('bcrypt');
const BackendModel = require('../Models/BackendModel');


// Controller function for Backend signup
const signupBacken = async (req, res) => {
    const { name, email, phoneNumber, team, password, backendId } = req.body;

    // Check if all required fields are provided
    if (!name) {
        return res.status(400).json({ message: 'Please fill in the name' });
    }
    if (!email) {
        return res.status(400).json({ message: 'Please fill in the email' });
    }
    if (!phoneNumber) {
        return res.status(400).json({ message: 'Please fill in the phone number' });
    }
    if (!team) {
        return res.status(400).json({ message: 'Please select a team' });
    }
    if (!password) {
        return res.status(400).json({ message: 'Please fill in the password' });
    }
    if (!backendId) {
        return res.status(400).json({ message: 'Backend Id is Must Required' });
    }

    try {
        // Check if email already exists
        const existingEmail = await BackendModel.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Check if phone number already exists
        const existingPhoneNumber = await BackendModel.findOne({ phoneNumber });
        if (existingPhoneNumber) {
            return res.status(400).json({ message: 'Phone number already exists' });
        }

        const existingbackendId = await BackendModel.findOne({ backendId });
        if (existingbackendId) {
            return res.status(400).json({ message: 'Backend Id already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create a new Backend instance
        const newBackend = new BackendModel({
            name,
            email,
            phoneNumber,
            team,
            backendId,
            password: hashedPassword,
        });
        await newBackend.save();
        res.status(200).json({ message: 'Backend created successfully!' });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Controller function to get all Backends
const getBackends = async (req, res) => {
    try {
        const backends = await BackendModel.find().populate('team');
        if (!backends) {
            return res.status(404).json({
                success: false,
                message: "Record Not Found"
            })
        }
        res.status(200).json({
            success: true,
            message: "Record Found",
            data: backends
        });
    } catch (error) {
        console.error('Error fetching Backends:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Controller function to delete a specific Backend by ID
const deleteBackend = async (req, res) => {
    const { id } = req.params;
    try {
        const backend = await BackendModel.findByIdAndDelete(id);
        if (!backend) {
            return res.status(404).json({ message: 'Backend not found' });
        }
        res.status(200).json({ message: 'Backend deleted successfully' });
    } catch (error) {
        console.error('Error deleting Backend:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const login = async (req, res) => {
    const { email, password, role } = req.body;

    let user;

    try {
        // Check role and find user in respective collection
        if (role === 'Backend') {
            user = await Backend.findOne({ email });
        } else if (role === 'FieldExcutive') {
            user = await Field.findOne({ email });
        } else if (role === 'Team Leader') {
            user = await TeamLeader.findOne({ email });
        } else {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // If user doesn't exist
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            'your_jwt_secret', // Use env variables for secret in production
            { expiresIn: '1h' }
        );

        res.status(200).json({ token, user });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {
    signupBacken, getBackends, deleteBackend
};
