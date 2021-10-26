
# Cacatoo

Cacatoo is a highly customisable toolkit that makes building spatially structured models of biology easy. Because it is written in 100% javascript it requires no installation and works on any machine, making building, sharing, and exploring your model easier than it ever was! With a web-based interface that is ideal for students to learn how to program, and a NodeJS-mode which allows one to run directly from the command line, it is suited for beginners and advanced programmers alike! 

<center>
<img src="https://bramvandijk88.github.io/cacatoo/images/elephant_cacatoo.png" width="400"
     alt="Riding on the shoulders of giants"
/></center>


## Getting started

You don't need to install anything. You can either immediately start playing with one of the many [JSFiddle examples](https://bramvandijk88.github.io/cacatoo/examples_jsfiddle.html), or dowload this repository and explore dozens of more examples! 
If you want help with Javascript, I recommend [this](https://youtu.be/W6NZfCO5SIk) tutorial from "Programming with Mosh". The first hour is free, and the other 6 hours are definitely worth the money. I also recomment setting up a nice coding environment, as I explain in [this blog post](https://www.bramvandijk.com/blog/2020/11/20/javascript-programming-part-ii-my-setup).

## How to Cacatoo
Cacatoo has been extenstively documented. Tutorials and overviews of its many functions can be found [here](https://bramvandijk88.github.io/cacatoo). If you prefer to learn by example, I have made dozens of different models for you 
to start playing (found in the "examples" folder of the repository), ranging from beginner to expert!

If you want to get in debt on what each function specifically does, check out the [JSDocs](https://bramvandijk88.github.io/cacatoo/jsdocs/index.html). 

## Notes for developers

The bundle was made with rollup:
> rollup src/model.js -o dist/cacatoo.js -f cjs  -w
(also see make_bundle.sh)

Documentation was compiled with jsdoc (npm install jsdoc -g)
> ./node_modules/.bin/jsdoc dist/cacatoo.js -d docs/jsdocs

## License
This library is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License, version 3, as published by the Free Software Foundation. 

This program is distributed in the hope that it will be useful, but without any warranty; without even the implied warranty of merchantability or fitness for a particular purpose. See the GNU General Public License for more details.


