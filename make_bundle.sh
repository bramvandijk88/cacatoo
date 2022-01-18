#!/bin/bash 

# This script bundles, tests, and prepares the documentation for Cacatoo
# Only the end-developer (currently: Bram van Dijk) needs to run this when uploading a fully new distribution of Cacatoo.
# If you have suggested changes to the documentation, issue a pull request on github.
# ( rollout command: sudo bash make_bundle.sh once; git add *; git commit -a -m "Message"; git push )
# 

compile_cacatoo()
{                           
    rollup src/simulation.js -o dist/cacatoo.js -f cjs                              # Use rollup to bundle the package as a single commonJS file
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

    ./node_modules/mocha/bin/mocha unit_test/                                       # Run mocha unit test to ensure the bundle works as intended
    
    if [[ "$?" -gt 0 ]]; then
        echo -e "Mocha: at least one of the unit tests failed\t[ERROR]";
        echo -e "Fix above issues before commiting the new bundle.\n\n"
        exit 1
    fi

    ./node_modules/.bin/jsdoc dist/cacatoo.js -d docs/jsdocs -R README.md           # Automatically recompile JSdocs

    
    cp examples/03_expert/legend.png docs/TEs_streamlining                          # Everything below = fixing documentation files
    cp dist/cacatoo.js docs/scripts/cacatoo.js
    cp style/cacatoo.css docs/styles/cacatoo.css
    cp lib/all.js docs/scripts/all.js
    cp lib/odex.js docs/scripts/odex.js
    cp images/elephant_cacatoo_small.png docs/images/
    cp images/elephant_cacatoo.png docs/images/
    cp images/gh.png docs/images/

    # // Copy the TE-example to the docs on Github for publication
    fix_libs() {
        sed -i 's/..\/..\/dist\/cacatoo.js/https:\/\/bramvandijk88.github.io\/cacatoo\/scripts\/cacatoo.js/g' $1
        sed -i 's/..\/..\/lib\/all.js/https:\/\/bramvandijk88.github.io\/cacatoo\/scripts\/all.js/g' $1
        sed -i 's/..\/..\/style\/cacatoo.css/https:\/\/bramvandijk88.github.io\/cacatoo\/styles\/cacatoo.css/g' $1
    }

    #cp examples/03_expert/PoS_classes.js docs/TEs_streamlining/
    #cp examples/03_expert/11_classes_PoS_TEs.html docs/TEs_streamlining/index.html
    #fix_libs docs/TEs_streamlining/index.html

    cp examples/04_even_more_examples/crossfeeding.html docs/crossfeeding.html
    fix_libs docs/crossfeeding.html

    mkdir -p docs/cooperation
    cp examples/04_even_more_examples/cooperation.html docs/cooperation/index.html
    cp images/coop.png docs/images
    fix_libs docs/cooperation/index.html
    sed -i 's/..\/..\/images/..\/images/g' docs/cooperation/index.html

    sed -i 's/images\/elephant_cacatoo_small.png/cacatoo\/images\/elephant_cacatoo_small.png/g' docs/scripts/cacatoo.js
    sed -i 's/images\/gh.png/cacatoo\/images\/gh.png/g' docs/scripts/cacatoo.js           
}


chsum1=""

compile_cacatoo

while [[ true ]]
do    
    if [[ $1 == "once" ]]; then
        echo -e "Cacatoo compilation\t[ OK ]"
        exit 0
    fi
    chsum2=`find src lib examples -type f -exec md5sum {} \;`
    if [[ $chsum1 != $chsum2 ]] ; then           
        if [ -n "$chsum1" ]; then
            compile_cacatoo            
        fi
        chsum1=$chsum2
    fi
done
