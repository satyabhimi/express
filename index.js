const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const expressValidator = require('express-validator');
const mongojs = require('mongojs');

var db = mongojs('customerapp', ['users']);
var app = express();

var ObjectId = mongojs.ObjectId;
/*
var logger = (req, res, next) => 
{ 
    console.log("logging");
    next();
}; 

app.use(logger); */

//view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded(
{
    extended: false
}))

// set static path 
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.locals.errors = null;
    next();
})

// Express validator middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }

        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

app.get('/', (req, res) => 
{
    db.users.find(function (err, docs) {
        res.render('index', {
             title: 'customers',
             users: docs
        });
    });
});

app.post('/users/add', (req, res) => 
{
    req.checkBody('first_name', 'first Name is required').notEmpty();
    req.checkBody('last_name',  'last Name is required').notEmpty();
    req.checkBody('email',      'Email is required').notEmpty();

    var errors = req.validationErrors();

    db.users.find(function (err, docs) {
        if (errors) {
            res.render('index', {
                title: 'customers',
                users: docs,
                errors: errors
            });
            

            console.log("errors");
        }
        else{
            var newUser = {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email
            }

            db.users.insert(newUser, (err, result) => {
                if(err){
                    console.log("error")
                }

                res.redirect('/');
            })
        }
 });
    //console.log(newUser);
});

app.delete('/users/delete/:id', function(req, res)
{
    db.users.remove({ _id: ObjectId(req.params.id)}, (err, result) => 
    {
        if(err){
            console.log(err);
        }
        res.redirect('/');
    })
})

app.listen(3000, () => 
{
    console.log('server started on port 3000..');
});