---
title: 'Cacatoo: building, exploring, and sharing spatially structured models'
tags:
  - javascript
  - spatial structure
  - dynamics
  - individual-based models
  - microbial ecology and evolution
authors:
  - name: Bram van Dijk
    orcid: 0000-0002-6330-6934
    affiliation: 1 
affiliations:
 - name: Max Planck Institute for Evolutionary Biology
   index: 1 
date: 11 November 2021
bibliography: paper.bib
---


# Summary

In the field of ecology and evolution, a treasure trove of data has revealed the importance of spatial structure and biography. Despite these rich data sets, our conceptual understanding of how spatial structure shapes biodiversity, pathogenicity, and microbial pangenomes is however lagging behind. `Cacatoo` is a toolbox developed to make it easy to design, explore, and share spatially structured simulations of biological systems. Simulations can be interactively explored from a web browser, allowing the user to change parameters and observe graphs in real time. `Cacatoo` is designed to be both easy-to-use and extendible, making it suitable for beginners and experts alike! Because it requires no installation and works on practically every computer, it is also ideal for teaching and simple student projects. In summary, `Cacatoo` provides an opportunity to people ranging from students to advanced programmers to get into spatially structured modelling! 


# Statement of need

Complex systems like microbial communities have many emergent properties which arise from the interactions between its individual components. As such, predicting exactly how these systems will behave and respond to various stimuli is difficult. Simulation offers a solution by allowing a modeller to simply put in what they deem important, and observe the outcome. As such, direct visual feedback is an important part of the process of "getting to know" your model. Not only is one more likely to detect programming mistakes, but it also aids in communicating the model to peers. Many current modelling frameworks are based in C (e.g. [Cash](https://tbb.bio.uu.nl/rdb/software.html) and [Morpheus](https://academic.oup.com/bioinformatics/article-abstract/30/9/1331/234757) [@starruss2014morpheus]), motivated by its unparalled speed. However, the learning curve for programming in C is steep, and even an experienced user may take days to track down a simple bug. Moreover, sharing your model with other users can be a pain, as installation is slightly different depending on each operating system. With Javascript tools like d3.js [@zhu2013data] and Artistoo ([@wortel2021artistoo]) to pave the way, `Cacatoo` was developed to make spatially structured modelling easy, fast, and customisable. The basic "recipe" of a Cacatoo simulation is simple \autoref{fig:recipe}, and the documentation comes with plenty of examples to get started right away!<br><br>

![The basic recipe of a Cacatoo simulation contains three ingredients: 1) setup, 2) defining the rules, and 3) setting up the main simulation loop.\label{fig:recipe}](../images/cacatoo_recipe.png)

# Use cases

Cacatoo has been used in our recent work on the co-evolution of transposable elements and their hosts [@van2021transposable]. 

# Acknowledgements

The author acknowledges Inge Wortel and Johannes Textor for paving the way with their toolbox Artistoo, and for helping me with the early stages of development. Next, I would like to thank Jeroen Meijer for extensively testing and debugging of the software. 

# References