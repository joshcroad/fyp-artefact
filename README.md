A performance study of MongoDB and Redis in a Node environment
==============================================================

A program to test *MongoDB* and *Redis*.

Command line tool which takes user input and automatically writes execution to an output file, located `./lib/output/`

## Running the application
To run the application in terminal, the machine **must** have both mongo, redis and node drivers installed globally.

 - [Node.js](http://nodejs.org/)
 - [Mongo Driver](http://docs.mongodb.org/manual/installation/)
 - [Redis Driver](http://redis.io/download)

Once installed, `cd` into the directory and run

```
joshcroad$ node lib/app.js [flag] [param1] [param2]
```

### [flag]
`--write` or `-w` - Initialise the write tests.

`--search` or `-s` - Initialise the search tests.

`--update` or `-u` - Initialise the update tests.

### [param1]
`Integer <= 1000` - The number of records the test should start with.

#### Example
`10 || 100 || 1000`

### [param2]
`Integer >= [param1] && Integer <= 100000` - The number of records the test should end with.

#### Example
`1000 || 10000 || 100000`

## Examples

```
joshcroad$ node lib/app.js -w 10 100000

joshcroad$ node lib/app.js --search 100 10000
```