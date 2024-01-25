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


// Meeting Schema
const meetingSchema = new mongoose.Schema({
  name: String,
  meetings: [{ 
    fullName: String,
    name: String,
    startTime: Date,
    endTime: Date
  }]
});

const Meeting = mongoose.model('Meeting', meetingSchema);

// Read All Meetings
app.get('/api/meetings', async (req, res) => {
  try {
    const meetings = await Meeting.find();
    const formattedMeetings = meetings.map(meeting => {
      return {
        id: meeting._id, // Use _id as id
        name: meeting.name,
        meetings: meeting.meetings.map(subMeeting => {
          return {
            fullName: subMeeting.fullName,
            name: subMeeting.name,
            startTime: subMeeting.startTime,
            endTime: subMeeting.endTime
          };
        })
      };
    });
    res.json(formattedMeetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Read Single Meeting
app.get('/api/meetings/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    res.json(meeting);
  } catch (error) {
    console.error('Error fetching meeting:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create Meeting
app.post('/api/meetings', async (req, res) => {
  try {
    const newMeeting = new Meeting(req.body);
    const savedMeeting = await newMeeting.save();
    res.status(201).json(savedMeeting);
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update Meeting
app.put('/api/meetings/:id', async (req, res) => {
  try {
    const updatedMeeting = await Meeting.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedMeeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    res.json(updatedMeeting);
  } catch (error) {
    console.error('Error updating meeting:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete Meeting
app.delete('/api/meetings/:id', async (req, res) => {
  try {
    const deletedMeeting = await Meeting.findByIdAndDelete(req.params.id);
    if (!deletedMeeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    res.json(deletedMeeting);
  } catch (error) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
  

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;
