import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware to configure CORS
const corsOptions = {
    origin: process.env.FRONTEND_URL, // Allow requests from your frontend
    credentials: true, // Enable sending cookies with requests
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.use(express.json()); 

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("MongoDB connected!"))
    .catch(err => console.error("MongoDB connection error:", err));

// Message Schema
const messageSchema = new mongoose.Schema({
    role: { type: String, required: true }, 
    text: { type: String, required: true }, 
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Message = mongoose.model('Message', messageSchema);

// Store a new message
app.post('/api/messages', async (req, res) => {
    try {
        const { role, text } = req.body;
        const message = new Message({ role, text });
        await message.save();
        
        console.log('Message stored in MongoDB');
        res.status(201).json({ success: true, message });
    } catch (err) {
        console.error("Error saving message:", err);
        res.status(500).json({ success: false, error: 'Failed to save message' });
    }
});

// Get all messages (optional)
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: 1 });
        res.status(200).json({ success: true, messages });
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ success: false, error: 'Failed to fetch messages' });
    }
});

// Server listening on specified port
const PORT = process.env.PORT; // Default to 8080 if PORT is not set
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
