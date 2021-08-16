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

cp dist/cacatoo.js docs/cacatoo.js
cp style/cacatoo.css docs/cacatoo.css
cp lib/all.js docs
cp examples/03_expert/PoS_classes.js docs
cp examples/03_expert/11_classes_PoS_TEs.html docs/TEs_host_coevol.html
sed -i 's/..\/..\/dist\/cacatoo.js/.\/cacatoo.js/g' docs/TEs_host_coevol.html
sed -i 's/..\/..\/lib\/all.js/.\/all.js/g' docs/TEs_host_coevol.html
sed -i 's/..\/..\/style\/cacatoo.css/.\/cacatoo.css/g' docs/TEs_host_coevol.html

