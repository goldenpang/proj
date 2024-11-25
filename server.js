const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const url = require('url');
const bodyParser = require('body-parser');
const app = express();
const LISTENING_PORT = process.env.PORT || 8099;

var	formidable 			= require('express-formidable');
var	fsPromises 			= require('fs').promises;

// MongoDB connection URI
const uri = 'mongodb+srv://tony123:tony123@cluster0.pmvff.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(uri);

// Model
const accountSchema = require('./models/account');
const Account = mongoose.model('Account', accountSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Sony
// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Route for the root path
app.get('/', (req, res) => {
    res.redirect('/login'); // Redirect to the login page
});

// Route to render the login page
app.get('/login', (req, res) => {
    res.render('login');
});


// web user logout
app.get('/logout', (req, res) => {
    res.redirect('/login');
});

// API for user login
app.post('/info/:id', async (req, res) => {
	const { id } = req.params;
    try {
        const user = await Account.findById(id);
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
       	}	
        if (user.admin) {
       		res.status(200).render('Acontent',{ message: 'Login successful', user });
       	}else{
        	// Successful login logic here (e.g., creating a session)
        	res.status(200).render('NAcontent',{ message: 'Login successful', user });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error during login', error });
    }
});
app.post('/info', async (req, res) => {
    const { id, pwd } = req.body;

    try {
        const user = await Account.findOne({ id, pwd });
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
       	}	
        if (user.admin) {
       		res.status(200).render('Acontent',{ message: 'Login successful', user });
       	}else{
        	// Successful login logic here (e.g., creating a session)
        	res.status(200).render('NAcontent',{ message: 'Login successful', user });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error during login', error });
    }
});

// Route for the content page after login
app.get('/content', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Redirect to login if not authenticated
    }

    const user = await Account.findById(req.session.userId);
    res.status(200).render('content', { user });
});

//web go to updateScore page
app.get('/updateScore', async (req, res) => {
	const { uid, id } = req.query;
    
    // Logic to retrieve user information based on the ID
    try {
    	const user = await Account.findById(id);
        const target = await Account.findById(uid);
        if (!target) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.render('updateScore', { target, user }); // Render a view with user data
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user data', error });
    }
});

//web read all studentInfo
app.get('/sinfo/:id', async (req, res) => {
    try {
    	const { id } = req.params;
    	const user = await Account.findById(id);
        const users = await Account.find({});
        res.status(200).render('sinfo', { users, user});
    } catch (error) {
        res.status(500).send(error);
    }
});

//web updating a specific user's score
app.post('/aupdate', async (req, res) => {
	const { uid, id } = req.query;
    try {
    	const user = await Account.findById(id);
    	const targetId = req.params.uid; 
        const targetUser = await Account.findById(uid);
        if (!targetUser) {
            return res.status(404).json({ message: 'Target user not found', targetUser });
        }
        
        console.log('Incoming data:', req.body);
        
        const updateData = {
            englishScore: req.body.eng,
            chineseScore: req.body.chi,
            mathScore: req.body.math,
        };
        await Account.findByIdAndUpdate(targetId, updateData, { new: true });
        const users = await Account.find({});
        res.status(200).render('sinfo', { users, user });
    } catch (error) {
        res.status(500).json({ message: 'Error ', error });
    }
});

//web any user updating Info
app.post('/aupdateInfo/:id', async (req, res) => {
    try {
    	const userId = req.params.id; 
        const targetUser = await Account.findById(userId);
        if (!targetUser) {
            return res.status(404).json({ message: 'Target user not found', user });
        }
        
        console.log('Incoming data:', req.body);
        
        const updateData = {
            pwd: req.body.pwd,
            name: req.body.aname,
            phoneNo: req.body.phone,
        };
        await Account.findByIdAndUpdate(userId, updateData, { new: true });
        const user = await Account.findById(userId);
		if (user.admin) {
       		res.status(200).render('Acontent',{user});
       	}else{
        	res.status(200).render('NAcontent',{ message: 'Login successful', user });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error ', error });
    }
});


//web go to admin updateInfo page
app.get('/updateInfo/:id', async (req, res) => {
    const { id } = req.params;
    
    // Logic to retrieve user information based on the ID
    try {
        const user = await Account.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).render('updateInfo', { user }); // Render a view with user data
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user data', error });
    }
});

//web go to create a new user page
app.get('/create/:id', async (req, res) => {
	const { id } = req.params;
    try {
    	const user = await Account.findById(id);
        res.status(200).render('create', { user });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user data', error });
    }
});

//web creating a new user page
app.post('/createStd/:_id', async (req, res) => {
    try {
    	const { _id } = req.params;
    	const user = await Account.findById(_id);
        const existingUser = await Account.findOne({ id: req.body.newid });
        if (existingUser) {
            return res.status(400).json({ message: 'Error: User ID already exists' });
        }

	console.log('Incoming data:', req.body);

        const newUser = new Account({
            id: req.body.newid,
            pwd: req.body.newpwd,
            name: req.body.newname,
            phoneNo: req.body.newphoneNo,
            englishScore: req.body.neweng,
            chineseScore: req.body.newchi,
            mathScore: req.body.newmath,
            admin: false 
        });

        await newUser.save();
        const users = await Account.find({});
        res.status(200).render('sinfo', { users, user });
    } catch (error) {
        res.status(500).json({ message: 'Error creating new user', error });
    }
});

// web admin delete student
app.get('/deleteS', async (req, res) => {
	const { uid, id } = req.query;
    try {
    	const target = await Account.findById(uid);
        const result = await Account.findByIdAndDelete(uid);
		console.log('Incoming data:', uid);
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Target user not found' });
        }
		const user = await Account.findById(id);
		const users = await Account.find({});
        res.status(200).render('sinfo', { users, user });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user data', error });
    }
});

// API for reading a specific user's data
app.get('/api/read/one', async (req, res) => {
    const { id, pwd, targetid } = req.query;
    try {
        const adminUser = await Account.findOne({ id, pwd });
        if (!adminUser || !adminUser.admin) {
            return res.status(403).json({ message: 'Unauthorized access: Wrong Password or Not Enough Permission' });
        }

        const targetUser = await Account.findOne({ id: targetid });
        if (!targetUser) {
            return res.status(404).json({ message: 'Target user not found' });
        }
		const findTargetUsers = await Account.find({ id: targetid });
        res.status(200).json(findTargetUsers);
    } catch (error) {
        res.status(500).json({ message: 'Error reading user data', error });
    }
});

// API for reading all non-admin users
app.get('/api/read/all', async (req, res) => {
    const { id, pwd, sort = 0 } = req.query;
    try {
        const adminUser = await Account.findOne({ id, pwd });
        if (!adminUser || !adminUser.admin) {
            return res.status(403).json({ message: 'Unauthorized access: Wrong Password or Not Enough Permission' });
        }

        const nonAdminUsers = await Account.find({ admin: false }).sort({ id: sort === '1' ? -1 : 1 });
        res.status(200).json(nonAdminUsers);
    } catch (error) {
        res.status(500).json({ message: 'Error reading user data', error });
    }
});

// API for reading a self data
app.get('/api/read', async (req, res) => {
    const { id, pwd, targetid } = req.query;
    try {
        const adminUser = await Account.findOne({ id, pwd });
        if (!adminUser) {
            return res.status(403).json({ message: 'Unauthorized access: Wrong Password or Not Enough Permission' });
        }

		const findTargetUsers = await Account.find({ id: id });
        res.status(200).json(findTargetUsers);
    } catch (error) {
        res.status(500).json({ message: 'Error reading user data', error });
    }
});

// API for updating a specific user's score & Admin only
app.put('/api/updateScore', async (req, res) => {
    const { id, pwd, targetid, eng, chi, math } = req.body;
    try {
        // Check if the user is an admin
        const adminUser = await Account.findOne({ id, pwd });
        if (!adminUser || !adminUser.admin) {
            return res.status(403).json({ message: 'Unauthorized access: Wrong Password or Not Enough Permission' });
        }

        // Find the target user
        const targetUser = await Account.findOne({ id: targetid });
        if (!targetUser) {
            return res.status(404).json({ message: 'Target user not found' });
        }

        // Validate scores to ensure they are numbers
        if (eng !== undefined && (isNaN(eng) || eng < 0 || eng > 7)) {
            return res.status(400).json({ message: 'Invalid English score. It must be a number between 0 and 7.' });
        }
        if (chi !== undefined && (isNaN(chi) || chi < 0 || chi > 7)) {
            return res.status(400).json({ message: 'Invalid Chinese score. It must be a number between 0 and 7.' });
        }
        if (math !== undefined && (isNaN(math) || math < 0 || math > 7)) {
            return res.status(400).json({ message: 'Invalid Math score. It must be a number between 0 and 7.' });
        }

        // Update scores if valid
        if (eng !== undefined) targetUser.englishScore = Number(eng);
        if (chi !== undefined) targetUser.chineseScore = Number(chi);
        if (math !== undefined) targetUser.mathScore = Number(math);

        // Save the updated user data
        await targetUser.save();
        res.status(200).json({ message: 'Scores updated successfully', user: targetUser });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user data', error });
    }
});


// API for updating self info & Everyone
app.put('/api/updateInfo', async (req, res) => {
    const { id, pwd, name, phone } = req.body;
    try {
        // Authenticate user
        const User = await Account.findOne({ id, pwd });
        if (!User) {
            return res.status(403).json({ message: 'Unauthorized access: Wrong Password' });
        }

        // Validate name: must not contain numbers
        if (name !== undefined) {
            if (/\d/.test(name)) {
                return res.status(400).json({ message: 'Invalid name: Name cannot contain numbers.' });
            }
            User.name = name;
        }

        // Validate phone number: must only contain digits
        if (phone !== undefined) {
            if (!/^\d+$/.test(phone)) {
                return res.status(400).json({ message: 'Invalid phone number: Phone number must contain only numbers.' });
            }
            User.phoneNo = phone;
        }

        // Save updated user data
        await User.save();
        res.status(200).json({ message: 'User information updated successfully', user: User });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user data', error });
    }
});


// API for creating a new user
app.post('/api/create', async (req, res) => {
    const { id, pwd, newid, newpwd, name, phone, eng, chi, math } = req.body;
    try {
        // Check if the admin user is authenticated
        const adminUser = await Account.findOne({ id, pwd });
        if (!adminUser || !adminUser.admin) {
            return res.status(403).json({ message: 'Unauthorized access: Wrong Password or Not Enough Permission' });
        }

        // Check if the user ID already exists
        const existingUser = await Account.findOne({ id: newid });
        if (existingUser) {
            return res.status(400).json({ message: 'Error: User ID already exists' });
        }

        // Validate name: must not contain numbers
        if (/\d/.test(name)) {
            return res.status(400).json({ message: 'Invalid name: Name cannot contain numbers.' });
        }

        // Validate phone number: must only contain digits
        if (!/^\d+$/.test(phone)) {
            return res.status(400).json({ message: 'Invalid phone number: Phone number must contain only numbers.' });
        }

        // Validate scores: must be numbers between 0 and 100
        const scores = [eng, chi, math];
        for (const [index, score] of scores.entries()) {
            if (score !== undefined) {
                if (isNaN(score) || score < 0 || score > 7) {
                    return res.status(400).json({ message: `Invalid score at index ${index}: Scores must be numbers between 0 and 7.` });
                }
            }
        }

        // Create the new user
        const newUser = new Account({
            id: newid,
            pwd: newpwd,
            name: name,
            phoneNo: phone,
            englishScore: Number(eng),
            chineseScore: Number(chi),
            mathScore: Number(math),
            admin: false // Default to false for new users
        });

        // Save the new user to the database
        await newUser.save();
        res.status(201).json({ message: 'New user created successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Error creating new user', error });
    }
});


// API for deleting a specific user record
app.delete('/api/delete', async (req, res) => {
    const { id, pwd, targetid } = req.body;
    try {
        const adminUser = await Account.findOne({ id, pwd });
        if (!adminUser || !adminUser.admin) {
            return res.status(403).json({ message: 'Unauthorized access: Wrong Password or Not Enough Permission' });
        }

        const result = await Account.deleteOne({ id: targetid });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Target user not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user data', error });
    }
});

// Start the server
app.listen(LISTENING_PORT, () => {
    console.log(`Server is running at http://localhost:${LISTENING_PORT}`);
});

