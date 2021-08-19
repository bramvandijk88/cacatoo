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

cp dist/cacatoo.js docs/scripts/cacatoo.js
cp style/cacatoo.css docs/styles/cacatoo.css
cp lib/all.js docs/scripts/all.js
cp lib/odex.js docs/scripts/odex.js
cp images/elephant_cacatoo_small.png docs/images/
cp images/gh.png docs/images/

# // Copy the TE-example to the docs on Github for publication
fix_libs() {
    sed -i 's/..\/..\/dist\/cacatoo.js/https:\/\/bramvandijk88.github.io\/cacatoo\/scripts\/cacatoo.js/g' $1
    sed -i 's/..\/..\/lib\/all.js/https:\/\/bramvandijk88.github.io\/cacatoo\/scripts\/all.js/g' $1
    sed -i 's/..\/..\/style\/cacatoo.css/https:\/\/bramvandijk88.github.io\/cacatoo\/styles\/cacatoo.css/g' $1
}

cp examples/03_expert/PoS_classes.js docs/TEs_streamlining/
cp examples/03_expert/11_classes_PoS_TEs.html docs/TEs_streamlining/index.html
fix_libs docs/TEs_streamlining/index.html

cp examples/other/crossfeeding.html docs/crossfeeding.html
fix_libs docs/crossfeeding.html

sed -i 's/images\/elephant_cacatoo_small.png/cacatoo\/images\/elephant_cacatoo_small.png/g' docs/scripts/cacatoo.js
sed -i 's/images\/gh.png/cacatoo\/images\/gh.png/g' docs/scripts/cacatoo.js
