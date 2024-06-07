var express = require('express');
var app = express();
// încărcăm dependențele
const session = require('express-session');
const formidable = require('formidable');
const fs = require('fs');
const ejs = require('ejs');
const path = require('path');

// setăm engine-ul ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// creăm o sesiune
app.use(session({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: false,
}));

// funcție care caută username-ul și parola
// în fișierul users.json
function verifica (username, pass) {
    if (fs.existsSync("users.json")){
      var date = fs.readFileSync("users.json");
      ob = JSON.parse(date);
     
      for (i in ob) {
      console.log(ob[i]);
      if (ob[i].username == username)
         if (ob[i].parola == pass) 
         return username;
      }
    }
return false;
}

// la completarea formularului de login
// verificăm datele introduse de utilizator
// setăm câmpul de sesiune username 
// și facem redirecturi corespunzătoare
app.post('/login', function(req, res) {
   var form = new formidable.IncomingForm();
   form.parse(req, function(err, fields, files) {
       let user = verifica(fields.username, fields.parola);
       // verificarea datelor de login

      if(user){
        req.session.username = user; 
        // setez userul ca proprietate a sesiunii
        console.log('logged in ' + user);
        res.redirect('/logat'); 
     }
   else
       req.session.username = false;  
   });
});

// dacă utilizatorul s-a logat, încărcăm pagina
// logout.ejs prin care îi confirmăm loginul
// și afișăm un buton pentru logout
app.get('/logat', function(req, res) {
   res.render('pagini/index',{'nume':req.session.username});
});

// la vizitarea home, încărcăm pagina de login
app.get('/', function(req, res) {
   res.render('pagini/log');
});

// dacă am dat click pe linkul 'logout',
// scoatem utilizatorul din sesiune și 
// facem redirect către pagina inițială de login
app.get('/logout', function(req, res) {
   req.session.username = false;
   console.log('logged out');
   res.redirect('/');
});

app.use((req, res, next) => {
   res.status(404).render('pagini/404');
});

// serverul ascultă pe portul dat, 5000
app.listen(5000); 
