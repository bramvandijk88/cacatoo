#!/bin/bash 
# This bundle script is use meant for developer-use only. It bundles the Cacatoo package into 1 javascript file
# that can be loaded for users. 

# Requires rollup

rollup src/simulation.js -o dist/cacatoo.js -f cjs
sed -i '$ d' dist/cacatoo.js
echo "
try
{
    module.exports = Simulation;
}
catch(err)
{
    // do nothing
}" >> dist/cacatoo.js