const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const adminRoute = require('./router/admin');
// const authRoute = require('./router/authRoute');
const userRoute = require('./router/user');
dotenv.config();
const app = express();
app.use(cors());
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
const port = process.env.PORT;
app.use(express.json());

app.use('/api/backend', adminRoute);
// app.use('/api', [authRoute, userRoute]);
app.listen(port,() => {
    console.log(`reserve-2 running on ${port}`);
})