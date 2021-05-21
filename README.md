# Cacatoo
Cacatoo is a Cellular Automaton Toolbox based on Cash (Cellular Automata Simulated Hardware, RJ de Boer & AD Staritsk). It is written in 100% javascript, ensuring it requires no installation and works on any machine.

<img src="patterns/elephant_cacatoo.png"
     alt="On the shoulders of giants"
     style="image-rendering: pixelated; float:center"
     />

Simply include the cacatoo.js file (and optional other libraries)
in your HTML file and begin building IBMs. 

The bundle was made with rollup:
> rollup src/model.js -o dist/cacatoo.js -f cjs  -w
Note that the default output of rollup will throw a warning in the dev console: "Module not defined", but will otherwise work. You can comment the last line from cacatoo.js to get rid of the warning. 

