const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");

const PORT = process.env.PORT;
const bicArray = require("./getBIC");

app.use(cors());
app.get("/", (req, res) => {
    //console.log("Connected to React get2");
    res.send(bicArray);
})
app.post("/post", (req, res) => {
    //console.log("Connected to React");
    res.redirect("/");
})

app.listen(PORT, console.log(`Server started on PORT ${PORT}`))