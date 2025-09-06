import express from "express"
import path from "path";
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)
const app =express();
 
app.use(express.static("public"));
const port = 3000;

app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"));

app.get("/",(req,res)=>{
    res.render("index.ejs");
})
app.listen(port,()=>{
    console.log(`server running at ${port}`);
})