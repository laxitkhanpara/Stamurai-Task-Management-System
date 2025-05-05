const env = require('dotenv').config();
const { config } = require('dotenv');
const express = require('express');
const app = express();
const connectDB = require('./config/db/connect.js');
const authRoutes = require('./routes/authRoute.js');
const taskRoute = require('./routes/taskRoute.js');
const notificationRoute = require('./routes/notificationRoute.js');
const cors = require('cors');
app.use(cors());

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoute);
app.use('/api/notification', notificationRoute);


connectDB();

//set sever config
const server = app.listen(env.parsed.PORT, (req, res) => {
  console.log(`Server is running on port ${env.parsed.PORT}`);
});
server.setTimeout(90000, () => {
  console.log('Server timeout after 10 seconds');
});