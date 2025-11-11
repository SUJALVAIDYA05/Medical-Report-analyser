import express from "express"
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)
const app =express();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // save files in uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique file name
  }
});

const upload = multer({ storage: storage });

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
const port = 5000;

app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"));

app.get("/",(req,res)=>{
    res.render("index.ejs");
})


app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  res.render("report.ejs");
});
app.get("/sign",(req,res)=>{
    res.render("signup.ejs");
})
app.get("/login",(req,res)=>{
    res.render("login.ejs");
})


app.get("/send",(req,res)=>{
    res.render("send.ejs");
})


app.get("/cnct",(req,res)=>{
    res.render("contact.ejs");
})
app.listen(port,()=>{
    console.log(`server running at ${port}`);
})