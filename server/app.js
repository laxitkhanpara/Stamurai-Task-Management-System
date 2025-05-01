const env = require('dotenv').config();
const { config } = require('dotenv');
const express = require('express');
const app = express();
const connectDB = require('./config/db/connect.js');
// const userRouter = require('./routers/UserRouter.js');
const cors = require('cors');
app.use(cors());

app.use(express.json());

// app.use('/app/user', userRouter);


connectDB();

//set sever config
const server = app.listen(env.parsed.PORT, (req, res) => {
  console.log(`Server is running on port ${env.parsed.PORT}`);
});
server.setTimeout(10000, () => {
  console.log('Server timeout after 10 seconds');
});