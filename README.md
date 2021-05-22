# Cacatoo
Cacatoo is a highly customisable toolkit for designing your own individual-based models. It is roughly based Cash (Cellular Automata Simulated Hardware, RJ de Boer & AD Staritsk), but because it is written in 100% javascript, it requires no installation and works on any machine.

<img src="patterns/elephant_cacatoo.png"
     alt="On the shoulders of giants"
     style="image-rendering: pixelated; float:center"
     />

Simply include the cacatoo.js file (and optional other libraries)
in your HTML file and begin building IBMs. 

The bundle was made with rollup:
> rollup src/model.js -o dist/cacatoo.js -f cjs  -w

