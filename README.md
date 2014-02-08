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
joshcroad$ node lib/app.js [param1] [param2] [param3]
```

#### Parameters
 - **[param1]** - 'write' or 'search'
 - **[param2]** - Optional. 10, 100, 1000, or 10000. **Default: 10**.
 - **[param3]** - Optional. 100, 1000, 10000, 100000. **Default: 100000**.

## Tests

`write` - Time it takes both databases to execute write commands of increasing magnitude.

For example:
```
joshcroad$ node lib/app.js write 10 100000
```

Example output:
```
Number of inserts against speed taken (milliseconds).

10: 3
100: 14
1000: 1396
10000: 1573
100000: 47485
```

`search` - Time it takes both databases to find a random value, within increasing magnitudes.

For example:
```
joshcroad$ node lib/app.js search
```

Example output:
```
Time to search for 1 record in 10 records.
Searching for 9
10: 9 found in 170

Time to search for 1 record in 100 records.
Searching for 4
100: 4 found in 7

Time to search for 1 record in 1000 records.
Searching for 65
1000: 65 found in 80

Time to search for 1 record in 10000 records.
Searching for 6013
10000: 6013 found in 144

Time to search for 1 record in 100000 records.
Searching for 87020
100000: 87020 found in 12389
```