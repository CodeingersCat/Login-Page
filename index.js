//importing deps
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const { openRouter } = require("./routes/openRoutes");

dotenv.config();
// const __dirname = path.resolve(path.dirname(''));

//instantiating express
const app = express();

//setting ejs as the view engine
app.set('view engine', 'ejs');

//setting the views folder to serve static html
app.use(express.static(path.join(__dirname, '/views')));

//to accept form-data
app.use(express.urlencoded({extended: true}))

//Home page
app.get("/", (req, res) => {
    res.render('index', {title: "Home"})
})

//Routes
app.use(openRouter)

//Running the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log("Listening on PORT", PORT))





