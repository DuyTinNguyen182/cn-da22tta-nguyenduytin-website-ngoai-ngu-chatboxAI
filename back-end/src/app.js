require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connect = require('./config/db');
const cookieParser = require('cookie-parser');


const app = express();

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Swagger route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));


connect();


app.use('/api/auth', require('./routes/auth'))
app.use('/api/user', require('./routes/user'));
app.use('/api/language', require('./routes/language'));
app.use('/api/languagelevel', require('./routes/languagelevel'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/course', require('./routes/course'));
app.use('/api/registration', require('./routes/registration'));
app.use("/api/overview", require("./routes/overview"));

app.use("/api/upload", require("./routes/upload"));

app.use('/api/payment', require('./routes/payment'));

app.use('/api/chatbot', require('./routes/chatbot'));

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Swagger UI: http://localhost:3005/api-docs');
});
