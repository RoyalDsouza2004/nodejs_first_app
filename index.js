import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcryptjs from 'bcryptjs'

mongoose.connect("mongodb://127.0.0.1:27017", {
  dbName: "backend",
}).then(() => console.log("db connected")).catch((e) => console.log(e));

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
})

const User = mongoose.model("User", userSchema)

const app = express();

//using middlewears
app.use(express.static(path.join(path.resolve(), "public")))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())


const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;

  if (token) {
    const decoded = jwt.verify(token, 'jdfkjishkdggfsjsf')

    req.user = await User.findById(decoded._id);
    next();
  }
  else {
    res.redirect('login')
  }
}

//setting up view engine
app.set("view engine", 'ejs');

// app.get("/add", async (req, res) => {
//   await Message.create({ name: "Royaldsouza", email: "royal2004123@gmail.com" });
//   res.send("done");
// });


app.get("/", isAuthenticated, (req, res) => {
  // res.status(400).send("meri marzi")
  // const file = fs.readFileSync("./index.html")


  // const pathLocation = path.resolve();

  // res.sendFile(path.join(pathLocation , "./index.html"));
  // res.render("index" , {name : "Royal dsouza"});

  // res.render('login');
  res.render('logout', { name: req.user.name });

  // res.sendFile("index")
})

// app.get('/success' , (req , res) =>{
//   res.render("success")
// })


// //mongodb
// app.post("/contact" , async(req , res)=>{

//   const {name , email} = req.body;
//   await Message.create({name, email});
//   res.redirect("/success")
// })

app.get("/register", (req, res) => {
  res.render('register')
});


//authentication method
app.post('/register', async (req, res) => {

  const { name, email, password } = req.body;

  let user = await User.findOne({ email });
  if (user) {
    return res.redirect('/login');
  }

  const hashedPassword = await bcryptjs.hash(password, 10)

  user = await User.create({
    name,
    email,
    password: hashedPassword,
  })

  const token = jwt.sign({ _id: user._id }, 'jdfkjishkdggfsjsf');

  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect('/')
})
app.get('/logout', (req, res) => {
  res.cookie('token', null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.redirect('/')
})

app.get('/login', (req, res) => {
  res.render('login')
})

// app.get("/users" ,(req , res) =>{
//   res.json({
//     users,
//   })
// })

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email })

  if (!user) return res.redirect('/register')

  const isMatch = await bcryptjs.compare(password , user.password);

  if (!isMatch) return res.render("login", { email, message: "Incorrect password" })

  const token = jwt.sign({ _id: user._id }, 'jdfkjishkdggfsjsf');

  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect('/')
})

app.listen(5000, () => {
  console.log("server is working");
})

