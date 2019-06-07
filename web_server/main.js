const express = require('express');
const formidable = require('formidable');
const dotenv = require('dotenv');
dotenv.config();

const hostname = process.env.HOSTNAME;
const port = process.env.PORT;

var app = express();

app.get('/', function (req, res){
    console.log('hello')
    res.send('OK\n');
});

app.post('/histfile_upload', function (req, res){
    var form = new formidable.IncomingForm();
    if(form.multiples) {
        res.send('Only one file can be uploaded.\n');
        return;
    }
    form.parse(req, function(err, fields, files) {
        console.log(fields);
        console.log(files.data.path);
        res.send('OK\n');
    });
    form.on('file', function (name, file){
        console.log('File committed', file.name, file.path);
    });
});

app.listen(port);

