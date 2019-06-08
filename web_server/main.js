const express = require('express');
const formidable = require('formidable');
const sqlite3 = require('sqlite3').verbose();
const util  = require('util');
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
        insertHistfileMeta(fields, files.data.path);
        res.send('OK\n');
    });
    form.on('file', function (name, file){
        console.log('File committed', file.name, file.path);
    });
});

/*
 * Database
 */

const sql_drop_if_exists_table = `DROP TABLE IF EXISTS histfiles`;
const sql_create_table = `CREATE TABLE histfiles (
    os TEXT,
    username TEXT,
    system_id TEXT,
    upload_time TIMESTAMP,
    filepath TEXT
)`;
const sql_insert_row = `INSERT INTO histfiles
    (os, username, system_id, upload_time, filepath)
    VALUES ("%s", "%s", "%s", CURRENT_TIMESTAMP, "%s")`;

const db_path = process.env.DATABASE;
const db = new sqlite3.Database(db_path, sqlite3.OPEN_READWRITE,
    (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to database.');
        console.log('Setting up a clean table.');
        db.run(sql_drop_if_exists_table, function(err) {
            if (err) {
                return console.log(err.message);
            }
            db.run(sql_create_table, function(err) {
                if (err) {
                    return console.log(err.message);
                }
                app.listen(port);
                console.log('Running server on port ' + port);
            });
        });
    }
);

function insertHistfileMeta(fields, filepath) {
    const sql = util.format(sql_insert_row, fields.os, fields.username,
        fields.system_id, filepath);
    console.log(sql);
    db.serialize(() => {
        db.run(sql, function(err) {
            if (err) {
                return console.log(err.message);
            }
            console.log('New histfile entry is logged.');
        }
        );
    });
}
