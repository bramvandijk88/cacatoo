// *********************************************************************************************************************
// This Mocha unit test uses Chai to test whether the non-visual components of Cacatoo work as intended
// *********************************************************************************************************************

const chai = require('chai');
const expect = chai.expect

Simulation = require('../dist/cacatoo.js')

describe('Cacatoo simulation unit test', function() 
{  
   describe('Testing grid model functionality...', function() 
   {
     it('Generate a simulation object, make an model with the name "grid model"', function() 
     {          
       const sim = new Simulation();       
       const model = sim.makeGridmodel("gridmodel")
       expect(sim).to.have.property('gridmodel')
       expect(sim.gridmodel).to.be.an('object').that.respondsTo('nextState')
       expect(sim.gridmodel.scale).to.be.above(0)
       expect(sim.gridmodel.nc).to.be.above(0)
       expect(sim.gridmodel.nr).to.be.above(0)       
       expect(sim.gridmodel.graph_update).to.be.above(0)
       expect(sim.gridmodel.graph_interval).to.be.above(0)
       expect(sim.gridmodel.margolus_phase).to.be.above(-1)
       expect(sim.gridmodel.grid.length).to.be.equal(sim.ncol)
       expect(sim.gridmodel.grid[0].length).to.be.equal(sim.nrow)
       expect(sim.gridmodel.grid[0][0]).to.be.an('object')
       expect(() => sim.gridmodel.update()).to.throw();
       sim.gridmodel.update = function() {}
       sim.gridmodel.update()
     });
     it('Calling core functions for grid functionality', function() 
     {          
       const sim = new Simulation();       
       sim.makeGridmodel("gridmodel")
       sim.gridmodel.MargolusDiffusion()     
       sim.gridmodel.perfectMix()       
       expect(() => sim.gridmodel.nextState()).to.throw();
       sim.gridmodel.nextState = function (i, j) { this.value = 1 }
       sim.gridmodel.nextState()
       sim.gridmodel.synchronous()
       sim.gridmodel.asynchronous()
     });
   });

   describe('Populating grid model...', function() 
   {
     const sim = new Simulation();       
     sim.makeGridmodel("populate")
     let individuals = [{alive:true, species:1, name: 'A'},{alive:true, species:2, name: 'B'}]
     it('Testing initialGrid', function() 
     {                
       sim.initialGrid(sim.populate, 'species', 1, 0.33, 2, 0.33, 3, 0.33)
       expect(sim.populate.grid[0][0]).to.have.property('species')       
       sim.populate.clearGrid()
       expect(sim.populate.grid[0][0] === sim.populate.grid[1][1]).to.equal(false)
       expect(sim.populate.grid[0][0]).to.not.have.property('species') 
      });

      it('Testing initialSpot', function() 
      {
       sim.initialSpot(sim.populate, 'species', 1, 100, 0, 0)
       expect(sim.populate.grid[0][0]).to.have.property('species')       
       sim.populate.clearGrid()
      });

      it('Testing populateGrid', function() 
      {       
       sim.populateGrid(sim.populate, individuals, [0.5,0.5])
       expect(sim.populate.grid[0][0]).to.have.property('species')      
       expect(sim.populate.grid[0][0]).to.have.property('alive')
       expect(sim.populate.grid[0][0]).to.have.property('name')
       sim.populate.clearGrid()
      });

      it('Testing populateSpot', function() 
      {
       sim.populateSpot(sim.populate, individuals, [0.5,0.5], 100,0,0)
       expect(sim.populate.grid[0][0]).to.have.property('species')      
       expect(sim.populate.grid[0][0]).to.have.property('alive')
       expect(sim.populate.grid[0][0]).to.have.property('name')
       sim.populate.clearGrid()  
     });
   });

   describe('Neighbourhood retrieval...', function() 
   {
    const sim = new Simulation();       
    sim.makeGridmodel("population")       
    sim.initialGrid(sim.population, 'species', 1, 0.33, 2, 0.33, 3, 0.33)
    sim.makeGridmodel("population_2")       
    sim.initialGrid(sim.population_2, 'species_2', 1, 0.33, 2, 0.33, 3, 0.33)
    it('Retrieve neighbouring grid points (getNeighbour(s))', function() 
    {                
      sim.population.getNeighbour(sim.population, 0, 0, 0)
      sim.population.getNeighbour(sim.population_2, 0, 0, 0)                    
      sim.population.getNeighbours(sim.population, 0, 0, 'species', 1, [1,3,5]) 
      expect(sim.population.getNeighbours8(sim.population, 0, 0, 'species', 1)[0].species).to.equal(1)
      sim.population.getNeighbours9(sim.population, 0, 0, 'species', 1)
      sim.population.getNeighbours4(sim.population, 0, 0, 'species', 1)
      sim.population.getNeighbours5(sim.population, 0, 0, 'species', 1)       
    });

    it('Summing neighbour properties (sumNeighbours functionality)', function() 
    {                
      sim.population.sumNeighbours(sim.population, 0, 0, 'species',[0,1,2,3,4,5,6,7,8])
      expect(sim.population.sumNeighbours8(sim.population, 0, 0, 'species')).to.be.above(0)
      sim.population.sumNeighbours9(sim.population, 0, 0, 'species', 1)
      sim.population.sumNeighbours4(sim.population, 0, 0, 'species', 1)
      sim.population.sumNeighbours5(sim.population, 0, 0, 'species', 1)       
    });

    it('Counting neighbours with certain properties (countNeighbours functionality)', function() 
    {                
      expect(sim.population.countNeighbours(sim.population, 0, 0, 'species',1,[0,1,2,3,4,5,6,7,8])).to.be.above(-1)
      sim.population.countNeighbours9(sim.population, 0, 0, 'species', 1)
      sim.population.countNeighbours4(sim.population, 0, 0, 'species', 1)
      sim.population.countNeighbours5(sim.population, 0, 0, 'species', 1)       
    });    

    it('Random neighbour functionality', function() 
    {                
      sim.population.randomNeighbour(sim.population, 0, 0, [1,2,3])
      sim.population.randomMoore8(sim.population_2, 0, 0)                       
      sim.population.randomMoore9(sim.population_2, 0, 0)                       
      sim.population.randomNeumann4(sim.population_2, 0, 0)                       
      sim.population.randomNeumann5(sim.population_2, 0, 0)                       
    });

    it('Rhoulette wheel functionality', function() 
    {                
      let neighbours = sim.population.getMoore8(sim.population,0,0,'species',1)
      let winner = sim.population.rouletteWheel(neighbours, 'species')
      expect(winner.species).to.be.above(0)
    });

    it('Getting / setting grid points', function() 
    {                
      sim.population.getGridpoint(0,0)
      sim.population.grid[1][1].species = 100
      let new_gp_species = sim.population.getGridpoint(1,1).species
      let new_gp = {species: new_gp_species}
      sim.population.setGridpoint(0,0,new_gp)
      expect(sim.population.grid[0][0].species).to.equal(100)
    });
   });

   describe('ODE functionality...', function() 
   {
    Solver = require('odex').Solver

    const sim = new Simulation();       
    sim.makeGridmodel("population")       
    sim.initialGrid(sim.population, 'alive', 1, 1.0)
    

    let ODE_function = function (r) {
      return function (x,y) {
          return [ r * y[0] ]
      }
    }
    
    let ode_config = {
      ode_name: "my_odes",
      init_states: [1],               
      parameters: [1.5],  
      diffusion_rates: [0.1]
    }  

    it('Attaching an ODE to the grid points', function() 
    { 
      sim.population.attachODE(ODE_function, ode_config);
    });

    it('Solving one time step', function() 
    { 
      let before = sim.population.grid[0][0].my_odes.state[0]
      sim.population.grid[0][0].my_odes.solveTimestep(0.1, opt_pos = true)
      let after = sim.population.grid[0][0].my_odes.state[0]
      expect(after-before).to.be.above(0)
    });

    it('Diffuse ODE states', function() 
    {       
      
      sim.population.grid[0][0].my_odes.state[0] = 10
      expect(sim.population.grid[0][0].my_odes === sim.population.grid[1][1].my_odes).to.equal(false)                         
      
      for (let i = 0; i < sim.ncol; i++)       
        for (let j = 0; j < sim.nrow; j++)     
        {                    
            sim.population.grid[i][j].my_odes.state[0] = sim.rng.genrand_real1()
        }

      

       sum_state = function () 
       {
         let state = 0
         for (let i = 0; i < sim.ncol; i++)        
                   for (let j = 0; j < sim.nrow; j++) 
                       state += sim.population.grid[i][j].my_odes.state[0]
         return state
       }
      
       let before = sum_state()
       sim.population.diffuseODEstates()
       let after = sum_state()
       expect(after-before).to.be.within(-1,1)
    });
  });
});

