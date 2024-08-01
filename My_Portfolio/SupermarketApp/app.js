const express = require('express');
const mysql = require('mysql2');
const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images");
    },
    filename: (req, file, cb) =>{
        cb(null, file.originalname);
    }
});
const upload = multer({storage: storage});

const app = express();

// Create MySQL connection
const connection = mysql.createConnection({
host: 'localhost',
user: 'root',
password: '',
database: 'c237_portfolio'
});
connection.connect((err) => {
if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
}
console.log('Connected to MySQL database');
});
// Set up view engine
app.set('view engine', 'ejs');
// enable static files
app.use(express.static('public'));

app.use(express.urlencoded ({
    extended: false
}))

// Define routes
// Example:
// app.get('/', (req, res) => {
// connection.query('SELECT * FROM TABLE', (error, results) => {
// if (error) throw error;
// res.render('index', { results }); // Render HTML page with data
// });
// });

app.get("/", (req, res) => {
    connection.query("SELECT * FROM portfolio", (error, results) =>{
        if (error) throw error;
        res.render("index", {portfolio: results});
    });
});

app.get("/product/:id", (req, res) =>{
    const id = req.params.id;
    connection.query("SELECT * FROM portfolio WHERE id = ?",
    [id], (error, results)=>{
        if (error) throw error;
        if (results.length > 0){
            res.render("portfolio", {portfolio:results[0]});
        }else{
            res.status(404).send("Product not found")
        }
    });
});

app.get("/addProduct", (req,res) =>{
    res.render("addProduct");
});

app.post("/addProduct", upload.single("image"), (req, res) => {
    const {cca, achievement} = req.body;
    let image;
    if (req.file){
        image = req.file.filename;
    }else{
        image=null;
    }
    connection.query("INSERT INTO portfolio(cca, achievement, image) VALUES (?, ?, ?)",
    [cca, achievement, image], (error, results) =>{
        if (error){
            console.error("Err adding product", error);
            res.status(500).send("Error adding product");
        }else{
            res.redirect("/");
        }
    });
})

//update
app.get("/editProduct/:id", (req,res) => {
    const id = req.params.id;
  
    const sql = "SELECT * FROM portfolio WHERE id = ?";
    connection.query(sql, [id], (error, results)=>{
        if (error){
            console.error("Database query error:", error.message);
            return res.status(500).send("Error retrieving product");
        }
        if (results.length > 0){
            res.render("editProduct", {portfolio: results[0]});
        } else{
            res.status(404).send("Product not found");
        }
    })
})

app.post("/editProduct/:id", upload.single("image"), (req,res) => {
    const id = req.params.id;
    const {cca, achievement} = req.body;
    let image = req.body.currentImage;
    if (req.file){
        image = req.file.filename;
    }
    const sql = "UPDATE portfolio SET cca=?, achievement=?, image=? WHERE id=?";
    connection.query(sql, [cca, achievement,image, id], (error, results)=>{
        if (error){
            console.error("Database query error:", error.message);
            return res.status(500).send("Error retrieving product");
        }else{
            res.redirect("/");
        }
    })
})

app.get("/deleteProduct/:id", (req, res) => {
    const id = req.params.id;
  
    const sql = "DELETE FROM portfolio WHERE id = ?";
    connection.query(sql, [id], (error, results)=>{
        if (error){
            console.error("Database query error:", error.message);
            return res.status(500).send("Error deleting product");
        } else{
            res.redirect("/");
        }
    })  
})

//const PORT = process.env.PORT || 3000;
//app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});