require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const { json, urlencoded } = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }))

app.use(cors())

const port = process.env.PORT || 5000;

const uri = process.env.MONGO_URI
console.log("Mongo URI:", uri);


mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  writeConcern: { w: "majority" },
})
.then(() => {
  console.log('Connected to MongoDB');
  mongoose.set('strictQuery', false);
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});


const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Event Schema
const eventSchema = new mongoose.Schema({
    title: String,
    location: String,
    description: String,
    startTime: Date,
    endTime: Date,
    picture: String,
    detailPicture: String,
    subscriptionUrl: String,
    requiredToFillInForm: Boolean,
  });
  
  const Event = mongoose.model('Event', eventSchema);
  
// Create Event
app.post('/api/events', async (req, res) => {
    try {
      console.log('Received POST request:', req.body); // Add this line for logging
      const newEvent = new Event(req.body);
      const savedEvent = await newEvent.save();
      res.json(savedEvent);
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});
  
  // Read All Events
  app.get('/api/events', async (req, res) => {
    try {
      const events = await Event.find();
      res.json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Read Single Event
  app.get('/api/events/:id', async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.json(event);
    } catch (error) {
      console.error('Error fetching event:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Update Event
  app.put('/api/events/:id', async (req, res) => {
    try {
      const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedEvent) {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.json(updatedEvent);
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Delete Event
  app.delete('/api/events/:id', async (req, res) => {
    try {
      const deletedEvent = await Event.findByIdAndDelete(req.params.id);
      if (!deletedEvent) {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.json(deletedEvent);
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Sample data
let meetings = [
  {
    id: '1',
    name: "Meeting 1",
    meetings: [
      {
        fullName: "John Doe",
        name: "Meeting Room 1",
        startTime: "2024-01-18T20:29:47.204Z",
        endTime: "2024-01-18T21:29:47.204Z"
      }
    ]
  },
  {
    id: '2',
    name: "Meeting 2",
    meetings: [
      {
        fullName: "Jane Smith",
        name: "Meeting Room 2",
        startTime: "2024-01-19T10:00:00.000Z",
        endTime: "2024-01-19T11:00:00.000Z"
      },
      {
        fullName: "Alice Johnson",
        name: "Meeting Room 3",
        startTime: "2024-01-20T15:00:00.000Z",
        endTime: "2024-01-20T16:00:00.000Z"
      }
    ]
  }
];

// Schema for meetings
const MeetingSchema = {
  id: '',
  name: '',
  meetings: []
};

// GET endpoint to retrieve all meetings
app.get('/api/meetings', (req, res) => {
  res.json(meetings);
});

// GET endpoint to retrieve a meeting by its id
app.get('/api/meetings/:id', (req, res) => {
  const id = req.params.id;
  const meeting = meetings.find(m => m.id === id);
  if (!meeting) {
    return res.status(404).json({ message: 'Meeting not found' });
  }
  res.json(meeting);
});

// POST endpoint to create a new meeting
app.post('/api/meetings', (req, res) => {
  const newMeeting = { ...MeetingSchema, ...req.body, id: uuidv4() };
  meetings.push(newMeeting);
  res.status(201).json(newMeeting);
});

// PUT endpoint to update a meeting by its id
app.put('/api/meetings/:id', (req, res) => {
  const id = req.params.id;
  const updatedMeeting = req.body;
  const index = meetings.findIndex(m => m.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Meeting not found' });
  }
  meetings[index] = { ...meetings[index], ...updatedMeeting };
  res.json(meetings[index]);
});

// DELETE endpoint to delete a meeting by its id
app.delete('/api/meetings/:id', (req, res) => {
  const id = req.params.id;
  const index = meetings.findIndex(m => m.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Meeting not found' });
  }
  meetings.splice(index, 1);
  res.sendStatus(204);
});
  

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;
