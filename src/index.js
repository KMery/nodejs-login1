const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');

//creando path
//Path a la carpeta raiz
//console.log(process.cwd());
const loginPath = path.join(process.cwd() + '/utils/login.html');

//conexion con DB
//https://o7planning.org/en/11959/connecting-to-mysql-database-using-nodejs
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '12345',
	database : 'nodelogin',
  insecureAuth : true
});

//verificar conexion
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected!');
});

//creando app express
const app = express();

//usando express-session
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

//obtener login
app.get('/', (req, res) => {
  res.sendFile(loginPath);
})

//autenticando
app.post('/auth', (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  if (username && password) {
    connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], (error, results, fields) => {
      console.log(error, results);
      if (results.length > 0) {
        req.session.loggedin = true;
        req.session.username = username;
        res.redirect('/home');
      } else {
        res.send('Incorrect Username and/or password!');
      }
      res.end();
    });
  } else {
    res.send('Please enter Username and Password!');
    res.end();
  }
});

//obteniendo home
app.get('/home', (req, res) => {
  if (req.session.loggedin) {
		res.write(`<h1>Welcome back ${req.session.username}!</h1><br>` );
  } else {
    res.write('<h1>Please login to view this page!<h1>');
  }
  res.end();
})

//Puerto en que se levanto
app.listen(3000, () => {
    console.log('Se levanto en 3000');
});
