const sqlite3 = require('sqlite3').verbose();
const util  = require('util');
const fs = require('fs');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();

const db_path = process.env.DATABASE;
const db = new sqlite3.Database(db_path, sqlite3.OPEN_READWRITE,
    (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to database.');
        db_connected_handler(() => {
            db.close();
            console.log('Closed database.');
        });
    }
);

function db_connected_handler(callback) {
    setup_database_tables(() => {
        process_histfiles(() => {
            callback();
        });
    });
}

function run_sql(sql, callback) {
    db.run(sql, function(err) {
        if (err) {
            return console.log(err.message);
        }
        callback();
    });
}

const sql_drop_if_exists_table = `DROP TABLE IF EXISTS commands`;
const sql_create_table = `CREATE TABLE commands (
    id TEXT NOT NULL,
    command TEXT NOT NULL,
    frequency INT,
    PRIMARY KEY (ID)
)`;

// Resets the table.
// TODO: We run everything again for prototype purpose. We should make it merge
// with previous tables.
function setup_database_tables(callback) {
    run_sql(sql_drop_if_exists_table, function () {
        run_sql(sql_create_table, callback);
    });
}

// Converts histfiles table to <command_id, command, frequency> table.
// TODO: Find out a smart way to merge different histfiles uploaded by the same
// user.
const sql_select_histfiles = `SELECT shell, filepath FROM histfiles`;
function process_histfiles(callback) {
    console.log('Start processing histfiles.');
    db.all(sql_select_histfiles, function(err, rows) {
        commands = convert_histfiles_to_commands(rows);
        command_frequency = process_commands(commands);
        insert_command_frequency_to_db(command_frequency);
        callback();
    });
}

const sql_insert_row = `INSERT INTO commands
    (id, command, frequency) VALUES ('%s', '%s', %d)`;
function insert_command_frequency_to_db(command_frequency) {
    // TODO: Do batch insert instead to speed up.
    db.serialize(() => {
        for (var id in command_frequency) {
            entry = command_frequency[id];
            sql = util.format(sql_insert_row, id,
                escape_command(entry.command), entry.freq);
            console.log(sql);
            db.run(sql, (err) => {
                if (err) {
                    console.log(err.message);
                }
            });
        }
    });
    console.log('Commands inserted.');
}

function escape_command(command) {
    return entry.command.replace(/'/g, "''").replace(/\\/g, '\\').replace(/\n$/, '');
}

function convert_histfiles_to_commands(histfiles) {
    commands = []
    for (let histfile of histfiles) {
        console.log('Processing histfile: ', histfile.filepath);
        const shell_type = get_shell_type(histfile.shell);
        commands = commands.concat(get_commands_from_file(shell_type,
            histfile.filepath));
    }
    return commands;
}

const ShellType = Object.freeze({'unknown':1, 'zsh':2});

function get_shell_type(shell) {
    if (shell == '/bin/zsh') {
        return ShellType.zsh;
    }
    return ShellType.unknown;
}

function get_commands_from_file(shell_type, filepath) {
    if (shell_type == ShellType.zsh) {
        return get_commnds_from_file_zsh(filepath);
    }
    console.log('Found unsupported shell.');
    process.exit(-1);
}

function get_commnds_from_file_zsh(filepath) {
    const file_content = fs.readFileSync(filepath, 'utf8');
    commands = [];
    for (let line of file_content.split('\n:')) {
        command = line.substring(line.indexOf(';') + 1);
        commands.push(command);
    }
    return commands;
}

function process_commands(commands) {
    command_frequency = {}
    for (let command of commands) {
        const command_id = get_command_id(command);
        if (!(command_id in command_frequency)) {
            command_frequency[command_id] = {
                'command': command,
                'freq': 1
            };
        } else {
            command_frequency[command_id]['freq'] += 1;
        }
    }
    return command_frequency;
}

function get_command_id(command) {
    return require('crypto').createHash('md5').update(command).digest('hex');
}
