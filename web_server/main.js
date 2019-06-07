const express = require('express');
const formidable = require('formidable');
const sqlite3 = require('sqlite3').verbose();
const dotenv = require('dotenv');
dotenv.config();

/*
 * Server
 */
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
        insertHistfileMeta();
        res.send('OK\n');
    });
    form.on('file', function (name, file){
        console.log('File committed', file.name, file.path);
    });
});

/*
 * Database
 */
const db_path = process.env.DATABASE;
const db = new sqlite3.Database(db_path, sqlite3.OPEN_READWRITE,
    (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to database.');
        db.run('DROP TABLE IF EXISTS histfiles');
        db.run("CREATE TABLE histfiles (info TIMESTAMP)");

        console.log('Running server on port ' + port);
        app.listen(port);
    }
);

function insertHistfileMeta() {
    db.serialize(() => {
        db.run(`INSERT INTO histfiles VALUES(CURRENT_TIMESTAMP)`,
            function(err) {
                if (err) {
                    return console.log(err.message);
                }
                console.log('New histfile entry is logged.');
            }
        );
    });
}
