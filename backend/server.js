import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './config/db.js';
import authRouter from './routes/authRoutes.js';
import  studentRouter from './routes/studentRoutes.js';
import bookRouter from './routes/bookRoutes.js';


const port = 5000;
const app = express();

//middleware 
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Db

connectDB();
//routes 

app.use("/api/auth", authRouter);
app.use("/api/student",  studentRouter);
app.use("/api/books",  bookRouter);



app.get("/" , (req ,res)=>{
    res.send("API IS RUNNIG");
});

app.listen(port ,()=>{
    console.log(`Server started on http://localhost:${port}`);
});