Expressions can't evaluate to values, so we need to rethink how this programming language will work

Commands are declarative, so we can probably consider the CPL to be declarative and match roughly 1 to 1

We start the language with some of our base scalar values.

```go
2 // integer value
2.2 // floating value (double)
-2.4 // all can be negative
2.7m, 2.7ft, 2.7in // a distance (always floating)
5s, 2100ms // a time value, (always floating)
<relative 2.5m, 8.6m> // a coordinate relative to the robot direction
<relative 2.5m> // second argument assumed to be zero
<absolute 7.1m, 5m>  // an absolute value on the field
"string value" // string constant
35rel // degrees relative to the robot, 0 being straight forward
45abs // degrees absolute to the field, 0 being a set angle
```

One of the biggest questions is if we want to fix the robot location. If it's fixed, our life is easier, and we should have some way of signifying what that location is for the GUI.

An expression is declaring a command. `UpperCamelCase()` expressions generally map 1-to-1 with existing expressions. `lowerCamelCase()` expressions don't.

```js
Wait(5s) // wait for 5 seconds,command
timeout(5s, SpinHalt()) // decorator
```

When we "compile" the CPL code into a Command, we make sure that the arity and type of each argument is correct. We can type during parsing because the type of each node is known without exterior or interior context. Type issues should be rejected and highlighted in the COB. If we could do basic type checking on the COB side as well that'd be better because we could plan without the robot on

All functions return (TODO decide memory strategy) a command

Some more examples

```go
Wait(5s) // wait command
MoveTo(<relative 5m>, 90rel) // drive forward 5m and turn 90 degrees at the same time
timeout(500ms,
  MoveTo(<relative 5m>)
) // drive forward 5m, timeout after 5 seconds
Log("foo") // log a string value. The timestamp is also printed (?)
AlignWithHub()
Shoot(1)
Shoot(2) // different timing for shooting 1 verses shooting 2 balls

MoveTo(<absolute Am, Bm>, -90abs)
MoveTo(<relative -10cm>)            // move to the protected zone
TurnToTarget()
Shoot(2)

timeout(5s, Intake()) // puts down the intake, grabs balls for 5s. Ending the Intake() command dumps the balls into the robot

par(
  Wait(5s), 
  MoveTo(<relative 10m>)
) // parallizes two or more commands. Has variants just like wpilib does
```

An example auto might be something like

```go
Wait(2s) // lets alliance get out of the way
parRace( // the first one to end, ends all of them
  Intake(), // never ends
  MoveTo(<relative 3m>), // trailing commas allowed
)
Turn(180rel)
TurnToTarget()
Shoot(2)
```


On the backend these are actually implemented the same, a function that takes in the arguments and returns a command.
I'm unsure how ownership should work

### spec

Tokens, see table in cpl.js

AST:

```hs
expr  : number
      | distance
      | degree
      | time
      | "<" keyword distance ("," distance)? ">" -- vector
      | ident "(" (expr ("," expr)*)? ")" -- invoke
```
