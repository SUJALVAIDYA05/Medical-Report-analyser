const express =require("express")
const app=express();


app.get("/", (req, res) => {
  //Step 1 - Make the get route work and render the index.ejs file.
  res.render("index.ejs")
});
app.listen(3000,()=>{
    console.log("serveer");
})