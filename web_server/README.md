## Install

```bash
$ npm install --python=python2.7
```

## Setup Database

Add `.env` file with your own configuration like:

```
HOSTNAME='127.0.0.1'
PORT=3000
DATABASE='/tmp/command-search.db'
```

Then,

```bash
$ touch /tmp/command-search.db
```

## Run

```bash
$ npm run-script run
```
