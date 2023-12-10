const express = require('express')
const mongoose = require('mongoose');
const session = require('express-session')
const cors = require('cors')

const redis = require('redis')

const RedisStore = require("connect-redis")(session);


const { MONGO_USER, MONGO_PASSWORD, MONGO_IP, MONGO_PORT, REDIS_URL, SESSION_SECRET, REDIS_PORT } = require('./config/config');



let redisClient = redis.createClient({
    host: REDIS_URL,
    port: REDIS_PORT,
    legacyMode: true,
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
    console.error('Error connecting to Redis:', err.message);
});

const postRouter = require('./routes/postRoutes')
const userRouter = require('./routes/userRoutes')
const app = express()

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`


const connectWithRetry = () => {
    mongoose.connect(mongoURL)
        .then(() => {
            console.log('MongoDB connected');
        })
        .catch((err) => {
            console.error('Error connecting to MongoDB:', err.message);
            console.log('Retrying in 5 seconds...');
            setTimeout(connectWithRetry, 5000);
        });
};
connectWithRetry()


app.enable('trust proxy')
app.use(cors({}))
app.use(session({
    store: new RedisStore({
        client: redisClient,
        prefix: "myapp:",
    }),
    secret: SESSION_SECRET,
    cookie: {
        secure: false,
        resave: false,
        saveUninitialized: false,
        httpOnly: true,
        maxAge: 30000
    }
}));


app.use(express.json())

app.get('/api/v1', (req, res) => {
    res.send('<h2>hi there</h2>')
    console.log('load balancing')
})

app.use('/api/v1/posts', postRouter)
app.use('/api/v1/users', userRouter)
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`listening on port ${port}`))