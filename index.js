//importing deps
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose")
const { openRouter } = require("./routes/openRoutes");
const { privateRouter } = require("./routes/privateRoutes");
const { isAuthenticated } = require("./middleware/authHelper");
const { validateEntry } = require("./middleware/validation");
const { passwordRouter } = require("./routes/passwordRoutes");

//read environment variables from .env file
dotenv.config();

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
app.use(validateEntry, openRouter);
app.use(isAuthenticated, privateRouter);
app.use(isAuthenticated, passwordRouter);

//connecting to MongoDB 
mongoose.connect(process.env.DB, { autoIndex: false }, () => console.log("Spun up the database"))

//Running the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log("Listening on PORT", PORT))





