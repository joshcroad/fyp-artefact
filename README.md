A performance study of MongoDB and Redis in a Node environment
==============================================================

A program to test *MongoDB* and *Redis* against each other.

Command line tool which takes user input and automatically writes execution to an output file, located `./lib/output/`

## Tests

`write` - Time it takes both databases to execute write commands of increasing magnitude.

```javascript
node lib/app.js write 10 100000
// args[1] = 10
// args[2] = 100000
```

The steps
  1. Write `args[1] // In this case 10` documents to Mongo
  2. Record the execution time
  3. Repeat `args[1] * 10` until `args[1] === 100000`
  4. Repeat with execution on *Redis*.