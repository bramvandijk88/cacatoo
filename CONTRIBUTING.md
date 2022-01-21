# Contributing to Cacatoo

As the sole developer of Cacatoo, I am eager to get help, suggestions, or use cases from others. For organisational reasons, I encourage everyone to always submit an official Github issue, and be sure to include the following details:


## Reporting bugs

When describing a bug, make sure to:
* Describe the unexpected behaviour
* Describe the desired behaviour
* Include a reproducable example

## Suggesting additions

When making suggestions, make sure to:
* Describe the missing feature
* Describe or sketch the expected output

## Pull requests

When you want to actively contribute to Cacatoo, you can suggest to become a collaborator on Github.
Implemented new branches may be merged with the main branch if the changes are expected to be useful to other. 

* Please give an extensive description of what your branch adds to Cacatoo
* Please run the default unit test (see below) and add the output to the pull request. 
* (optional, but appreciated) Please add a branch-specific unit test for your branch to the unit_test directory

## Mocha unit testing 

If you want to test your code, or want to issue a pull request, please use Mocha to run the tests provided in the directory unit_test:

* Install mocha (npm install mocha)
* E.g. run the default tests (./node_modules/mocha/bin/mocha unit_test/)

## Submitting JS fiddle examples. 

If you made a nice Cacatoo model which you would like to see on the [JS fiddle examples page](https://bramvandijk88.github.io/cacatoo/examples_jsfiddle.html), be sure to:
* Make sure your code works as intended in JS fiddle (should not require any rewriting, just some copy-pasting)
* Give a title and description of your model 
* Give your name so I can credit you

