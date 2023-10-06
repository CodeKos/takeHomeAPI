import express from 'express';
import bodyParser from 'body-parser';
import userRoutes from './routes/users.js';
const app =  express();
const PORT = 8080;
import 'dotenv/config'
import * as  mysql from 'mysql2'

app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use('/users', userRoutes);
app.listen(PORT, () => console.log(`Server Running on port: http://localhost:${PORT}`));

app.get('/', (req, res) => {
    res.send('## Hey Man');
} );


