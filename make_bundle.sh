#!/bin/bash 
# This bundle script is use meant for developer-use only. It bundles the Cacatoo package into 1 javascript file
# that can be loaded for users. 

# Requires watchify (i.e. 'browserify' with a watch option)
# Requires XXX

# TODO add a watch function to this bash script, e.g. inotifywait -qm --event modify --format '%w' /foo/bar/*.adoc | asciidoctor -q
# https://askubuntu.com/questions/819265/bash-script-to-monitor-file-change-and-execute-command

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