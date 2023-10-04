const express = require('express')
const Analysis = require('./Routes/Analysis')
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());



app.use('/api' , Analysis)

app.get('/*' , (req , res)=>{
    res.send("hello world")
})
app.listen(process.env.PORT || 3000 , (req,res)=>[
    console.log("server started at port 3000")
])