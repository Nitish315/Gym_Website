// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose(); // Or your preferred database client

const app = express();
const PORT = process.env.PORT || 3000; // Use port 3000, or environment variable

// --- Middleware ---
// Enable CORS for all routes (important for frontend communication)
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'] // Replace with your frontend's actual origin
}));
// Parse JSON request bodies
app.use(bodyParser.json());

// --- Database Setup (SQLite Example) ---
// Initialize SQLite database
const db = new sqlite3.Database('./alfa_fitness.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Create tables if they don't exist
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS classes (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            schedule TEXT,
            category TEXT,
            image TEXT
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId TEXT NOT NULL, -- Assuming username is unique and used as ID
            classId TEXT NOT NULL,
            className TEXT NOT NULL,
            bookingDate TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(username),
            FOREIGN KEY (classId) REFERENCES classes(id)
        )`);

        // Populate initial classes data if tables are just created
        const initialClasses = [
            { id: 'yoga-flow', name: 'Yoga Flow', description: 'Find your inner peace and improve flexibility with our Vinyasa Flow class.', schedule: 'Mon, Wed, Fri - 9:00 AM', category: 'flexibility', image: 'https://placehold.co/400x250/e44d26/fff?text=Yoga' },
            { id: 'crossfit-intensity', name: 'CrossFit Intensity', description: 'High-intensity functional movements to build strength and endurance.', schedule: 'Tue, Thu - 6:00 PM', category: 'strength', image: 'https://placehold.co/400x250/e44d26/fff?text=CrossFit' },
            { id: 'spin-mania', name: 'Spin Mania', description: 'Ride through virtual terrains in this high-energy indoor cycling class.', schedule: 'Mon, Wed - 7:00 AM', category: 'cardio', image: 'https://placehold.co/400x250/e44d26/fff?text=Spin' },
            { id: 'strength-circuit', name: 'Strength Circuit', description: 'Full-body strength training using various equipment and bodyweight exercises.', schedule: 'Tue, Thu - 10:00 AM', category: 'strength', image: 'https://placehold.co/400x250/e44d26/fff?text=Strength' },
            { id: 'zumba-dance', name: 'Zumba Dance Party', description: 'Dance your way to fitness with this exhilarating and fun Latin-inspired workout.', schedule: 'Fri - 5:00 PM', category: 'dance', image: 'https://placehold.co/400x250/e44d26/fff?text=Zumba' },
            { id: 'hiit-blast', name: 'HIIT Blast', description: 'Short, intense bursts of exercise followed by brief recovery periods for maximum fat burn.', schedule: 'Mon, Thu - 12:00 PM', category: 'cardio', image: 'https://placehold.co/400x250/e44d26/fff?text=HIIT' },
        ];

        initialClasses.forEach(c => {
            db.get(`SELECT id FROM classes WHERE id = ?`, [c.id], (err, row) => {
                if (err) {
                    console.error("Error checking for class:", err.message);
                } else if (!row) {
                    // Class does not exist, insert it
                    db.run(`INSERT INTO classes (id, name, description, schedule, category, image) VALUES (?, ?, ?, ?, ?, ?)`,
                        [c.id, c.name, c.description, c.schedule, c.category, c.image],
                        function(insertErr) {
                            if (insertErr) {
                                console.error(`Error inserting class ${c.name}:`, insertErr.message);
                            } else {
                                console.log(`Class "${c.name}" inserted.`);
                            }
                        }
                    );
                }
            });
        });
    }
});

// --- API Routes ---

// User Registration
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, password], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ message: 'Username already exists.' });
            }
            console.error('Registration error:', err.message);
            return res.status(500).json({ message: 'Error registering user.' });
        }
        res.status(201).json({ message: 'User registered successfully!', user: { username } });
    });
});

// User Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    db.get(`SELECT username, password FROM users WHERE username = ?`, [username], (err, row) => {
        if (err) {
            console.error('Login error:', err.message);
            return res.status(500).json({ message: 'Server error during login.' });
        }
        if (!row || row.password !== password) { // Simple password comparison for demo
            return res.status(401).json({ message: 'Invalid username or password.' });
        }
        res.status(200).json({ message: 'Login successful!', user: { username: row.username } });
    });
});

// Get All Classes
app.get('/api/classes', (req, res) => {
    db.all(`SELECT * FROM classes`, [], (err, rows) => {
        if (err) {
            console.error('Error fetching classes:', err.message);
            return res.status(500).json({ message: 'Error fetching classes.' });
        }
        res.status(200).json(rows);
    });
});

// Book a Class
app.post('/api/bookings', (req, res) => {
    const { userId, classId, className, bookingDate } = req.body; // userId is username in this demo
    if (!userId || !classId || !className || !bookingDate) {
        return res.status(400).json({ message: 'Missing booking details.' });
    }

    // Optional: Add logic to check if class exists and if user is valid
    // For this demo, we trust the frontend sending correct IDs

    db.run(`INSERT INTO bookings (userId, classId, className, bookingDate) VALUES (?, ?, ?, ?)`,
        [userId, classId, className, bookingDate],
        function(err) {
            if (err) {
                console.error('Booking error:', err.message);
                return res.status(500).json({ message: 'Error creating booking.' });
            }
            res.status(201).json({ message: 'Class booked successfully!', bookingId: this.lastID });
        }
    );
});

// Get User's Bookings
app.get('/api/bookings/:userId', (req, res) => {
    const userId = req.params.userId;
    db.all(`SELECT * FROM bookings WHERE userId = ?`, [userId], (err, rows) => {
        if (err) {
            console.error('Error fetching bookings:', err.message);
            return res.status(500).json({ message: 'Error fetching user bookings.' });
        }
        res.status(200).json(rows);
    });
});

// Cancel a Booking
app.delete('/api/bookings', (req, res) => {
    const { userId, classId, bookingDate } = req.body;
    if (!userId || !classId || !bookingDate) {
        return res.status(400).json({ message: 'Missing booking cancellation details.' });
    }

    db.run(`DELETE FROM bookings WHERE userId = ? AND classId = ? AND bookingDate = ?`,
        [userId, classId, bookingDate],
        function(err) {
            if (err) {
                console.error('Cancellation error:', err.message);
                return res.status(500).json({ message: 'Error canceling booking.' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Booking not found or already cancelled.' });
            }
            res.status(200).json({ message: 'Booking cancelled successfully!' });
        }
    );
});

// Contact Form Submission (Conceptual - this won't send emails without an email service)
app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;
    // In a real app, you'd integrate with an email service (e.g., Nodemailer, SendGrid, Mailgun)
    // For now, just log it and send a success response.
    console.log('New Contact Form Submission:');
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);

    res.status(200).json({ message: 'Message received successfully!' });
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});