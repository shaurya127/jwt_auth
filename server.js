require('dotenv').config()

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const jwt=require("jsonwebtoken");


app.use(express.json());
const port = 3000;

app.use(express.json());

const posts = [
  {
    username: "shaurya",
    title: "My first post",
  },
  {
    username: "shubham",
    title: "My second post",
  },
];

app.get("/posts",verifyToken, (req, res) => {
  res.json(posts.filter((post) => post.username === req.user.username)); 
});

const users = [];

app.get("/users", verifyToken, (req, res) => {
  res.json(users);
});

app.post("/users", async (req, res) => {
  try {
    const salt = bcrypt.genSaltSync();
    const hashedPassword = await bcrypt.hashSync(req.body.password, salt);
    console.log(salt);
    console.log(hashedPassword);
    const user = { name: req.body.name, password: hashedPassword };
    users.push(user);
    res.status(201).send();
    hash("password");
  } catch {
    res.status(500).send();
  }
});

// make a route for login

app.post("/users/login",async (req,res)=>{
  const user=users.find(user=>user.name===req.body.name);
  if(user==null){
    res.status(400).send('user not found');
  }
  try {
    if(await bcrypt.compare(req.body.password,user.password)){
      res.send('login successful');
   }
   else{
      res.status(401).send('password incorrect');
   }

  } catch (error) {
    res.status(500).send();
  }
})


app.post("/login", async (req, res) => {
  const username=req.body.name;
  const user={name:username};
  const accesstoken=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET);
  res.json({accesstoken:accesstoken});
})


function verifyToken(req,res,next){
  const bearerHeader=req.headers["authorization"];
  const token= bearerHeader  && bearerHeader.split(" ")[1];
  if(token==null){
    res.sendStatus(401);
  }
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
    if(err){
      res.sendStatus(403);
    }
    req.user=user;
    next();
  });

}
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
