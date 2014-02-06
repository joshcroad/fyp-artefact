A performance study of MongoDB and Redis on a Node environment
==============================================================

A program to test *MongoDB* and *Redis* against each other.

Command line tool which takes user input and automatically writes execution to an output file, located `lib/output/.`

## Tests

`write` - Time it takes both databases to execute write commands of increasing magnitude.
Example: `node lib/app.js write 10 100000`

This would:
  1. Execute `n` writes for *Mongo*
  2. Record the execution time
  3. Repeat `n * 10` until `n === 100000`
  4. Repeat with execution on *Redis*.