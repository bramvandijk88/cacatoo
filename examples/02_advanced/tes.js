/*--------------------------------------------------------------------*/
/*--------------------------------OPTIONS-----------------------------*/
/*--------------------------------------------------------------------*/

let sim;

// PARAMETERS FOR FITNESS DEFINITION
var init_es = 16 // ES = essential     --- if even a single one is missing = 0.0 fitness
var init_nc = 16
var motifs_in_es = 3
var motifs_in_nc = 3
var init_ne = 0
var non_essential_gene_boon = 0.1 // Amount of fitness microbes gain from non-essential genes
var transposon_fitness_cost = 0.02
var transposon_benefit_one_copy = 0.52 // TEs carry a beneficial gene, meaning that being infected will give you a small advantage, as long as the TEs are not out of control!

// PARAMETERS FOR ECOLOGY (death rate and non-reproduction constant)
var death_rate = 0.01
var non = 50


// PARAMETERS FOR EVOLUTION

// Bacterial genome evolution
var gene_inactivation_rate = 0.0
var gene_deletion_rate = 0.005
var is_deletion_rate = 0.000
var gene_duplication_rate = 0.001
var influx_motifs = 0.001

let coding_motifs =  []
let noncoding_motifs = []

// TE evolution
var target_mutation_rate = 0.001
var insert_mutation_rate = 0.00
var specificity_mutation_rate = 0.001
var mut_step_size = 0.2

// PARAMETERS FOR EDNA POOL
var degr_rate_edna = 0.02 //0.02
var diff_rate_edna = 0.02 // 0.01

// PARAMETERS FOR TRANSPOSON DYNAMICS
var uptake_from_pool = 0.00 //0.01
var jump_attempt_rate = 0.05 // 0.02
var probability_TE_induced_damage = 1.0

	// Displaying stuff
var size = 50
var scale = 3
var mix = false

// PARAMETERS CURRENTLY NOT IN USE
let successful_replications = 0
let attempted_replications = 0

/*--------------------------------------------------------------------*/
/*--------------------------------CACATOO-----------------------------*/
/*--------------------------------------------------------------------*/

function cacatoo() {
  let config = {
    title: "IS-elements and their host",
    description: "",
    maxtime: 50000,

    fpsmeter: false,
    ncol: size,
    seed: 12,
    nrow: size, // dimensions of the grid to build
    wrap: [true, true], // Wrap boundary [COLS, ROWS]   
    scale: scale, // scale of the grid (nxn pixels per grid cell)
    graph_interval: 1,
    statecolours: {
      alive: {
        1: 'blue'
      }
    } // The background state '0' is never drawn
  }

  sim = new Simulation(config)
	for(let i =0;i<motifs_in_es;i++) coding_motifs.push(sim.rng.random())
	for(let i =0;i<motifs_in_nc; i++) noncoding_motifs.push(sim.rng.random())
  
  sim.makeGridmodel("TE_model");
  sim.init_insertion_sites = []
  for (let i = 0; i < init_es + init_nc + init_ne; i++)
    sim.init_insertion_sites.push(sim.rng.random())


  sim.createDisplay_continuous({
    model: "TE_model",        
    property: "fitness",
    label: "Fitness",
    minval: 0.3,
    maxval: 1.5,
    
    nticks: 3,
    decimals: 1,
    fill: "viridis"
  })
  sim.createDisplay_continuous({
    model: "TE_model",        
    property: "genomesize",
    label: "Genome size",
    minval: 0,
    maxval: 30,
    fill: "viridis"
  })
	
	
  
  sim.TE_model.colourGradient("specificity", 50, [255, 0, 0], [255, 255, 0], [0,255,0], [0,255,255], [0,0,255])
  sim.createDisplay_continuous({
    model: "TE_model",
    property: "specificity",
    label: "Specificity",
    num_colours: 50,
    nticks: 7,
    decimals: 1,
    maxval: 1 + init_ne * non_essential_gene_boon
  })
  
  sim.TE_model.colourGradient("target_site", 50, [255, 0, 0], [255, 255, 0], [0,255,0], [0,255,255], [0,0,255])
  sim.createDisplay_continuous({
    model: "TE_model",
    property: "target_site",
    label: "Target site",
    num_colours: 50,
    nticks: 7,
    decimals: 1,
    maxval: 1 + init_ne * non_essential_gene_boon
  })
  sim.createDisplay_continuous({
    model: "TE_model",
    property: "T_in_eDNA",
    label: "TEs in eDNA pool",
    fill: "inferno",
    maxval: 10,
    num_colours: 30
  })

  sim.TE_model.initialise = function() {
    sim.initialGrid(sim.TE_model, "alive", 0, 1.0)
    sim.initialGrid(sim.TE_model, "genomesize", undefined, 1.0)
    sim.initialGrid(sim.TE_model, "T_in_eDNA", undefined, 1.0)
    sim.initialGrid(sim.TE_model, "T_in_genomes", undefined, 1.0)
    sim.max_g = 300
    sim.max_t = 300

    sim.TE_model.colourViridis("genomesize", sim.max_g)
    sim.TE_model.colourViridis("T_in_genomes", sim.max_t)
    sim.TE_model.colourViridis("T_in_eDNA", sim.max_t)


    sim.mixDNApool = false

    this.resetPlots()

    placeCell = function(i, j, init_es, init_ne, init_nc, init_tra, init_tra_rate) {
      gp = sim.TE_model.grid[i][j]
      gp.alive = 1
      gp.genome = new Genome()
      //      console.log(gp.genome)
      gp.genome.initialise(init_es, init_ne, init_nc, init_tra, init_tra_rate)

      gp.genomesize = Math.min(sim.max_g, gp.genome.chromosome.length) // A copy of the genome size is also stored within the grid point itself, so we can visualise it on the grid (capped at 100)
      gp.fitness = gp.genome.fitness // A copy of the genomes' fitness is stored within the grid point itself, so we can use it for the "rouletteWheel" function
			
      gp.specificity = gp.genome.specificity
      gp.target_site = gp.genome.target_site
      gp.T_in_genomes = Math.min(sim.max_t, gp.genome.nr_tra) // A copy of the genomes' fitness is stored within the grid point itself, so we can use it for the "rouletteWheel" function
    }
    for (let i = 0; i < sim.TE_model.nc; i++)
      for (let j = 0; j < sim.TE_model.nr; j++) {
        this.grid[i][j].eDNA = [] // Initialise empty eDNA pool
        this.grid[i][j].T_in_eDNA = 0
        if(sim.rng.random() < 0.6) placeCell(i,j, init_es, init_ne, init_nc, 0, init_tra_rate)
        else placeCell(i,j, init_es, init_ne, init_nc, 1, init_tra_rate)
      }
  }

  sim.TE_model.initialise() // Initialise for the first time (otherwise used for "RESET" button)

  // Define the next-state function. This example is stochastic growth in a petri dish
  sim.TE_model.nextState = function(i, j) {
    if (this.grid[i][j].alive == 0) {
      let neighbours = this.getMoore8(this, i, j, 'alive', 1)

      if (neighbours.length > 0) {
        let winner = this.rouletteWheel(neighbours, 'fitness', non)
        if (winner != undefined)
          this.reproduce(i, j, winner)
      }
    }
    //else if (this.rng.genrand_real1() < death_rate || this.grid[i][j].genome.fitness == 0)
    else if (this.rng.genrand_real1() < death_rate || this.grid[i][j].genome.fitness == 0)
      this.death_and_lysis(i, j)
    else {
      this.TEdynamicsI(i, j)
      this.TEdynamicsII(i, j)
      this.grid[i][j].T_in_genomes = this.grid[i][j].genome.nr_tra
    }
		
    // EDNA DYNAMICS
    if (this.grid[i][j].eDNA.length > 0) {
      for (let k = 0; k < this.grid[i][j].eDNA.length; k++)
        if (this.rng.genrand_real1() < degr_rate_edna) // degr
          this.grid[i][j].eDNA.splice(k, 1)
      this.grid[i][j].T_in_eDNA = Math.min(sim.max_t, this.grid[i][j].eDNA.length) // Track number of TEs for visualisation purposes
    } else
      this.grid[i][j].T_in_eDNA = undefined
  }

  // This function is asynchronously applied to the entire grid every time step. It uses a single random number to determine both IF a DNA fragment will move,
  // as well as WHERE it moves. 
  sim.TE_model.diffuse_eDNA = function(i, j) {
    moveDNA = function(k, direction) {
      let coords = sim.TE_model.moore[direction]
      let target = sim.TE_model.getGridpoint(coords[0] + i, coords[1] + j)
      target.eDNA.push(sim.TE_model.grid[i][j].eDNA[k])
      sim.TE_model.grid[i][j].eDNA.splice(k, 1)
    }

    for (let k = 0; k < sim.TE_model.grid[i][j].eDNA.length; k++) {
      let randomnr = sim.TE_model.rng.genrand_real1()
      if (randomnr < diff_rate_edna / 4) moveDNA(k, 1)
      else if (randomnr < 2 * diff_rate_edna / 4) moveDNA(k, 2)
      else if (randomnr < 3 * diff_rate_edna / 4) moveDNA(k, 3)
      else if (randomnr < 4 * diff_rate_edna / 4) moveDNA(k, 4)
    }
  }



  // A custom function for copying a cell into a gp at position i,j ("reproduction")
  sim.TE_model.reproduce = function(i, j, winner) {
    this.grid[i][j].alive = winner.alive
    this.grid[i][j].genome = winner.genome.copy(true)        
    this.grid[i][j].genomesize = Math.min(sim.max_g, this.grid[i][j].genome.chromosome.length)
    this.grid[i][j].fitness = this.grid[i][j].genome.fitness
    this.grid[i][j].specificity = this.grid[i][j].genome.specificity
    this.grid[i][j].target_site = this.grid[i][j].genome.target_site
    this.grid[i][j].T_in_genomes = Math.min(sim.max_t, this.grid[i][j].genome.nr_tra) // A copy of the genomes' fitness is stored within the grid point itself, so we can use it for the "rouletteWheel" function
  }

  // A custom function for killing a gp at position i,j
  sim.TE_model.death_and_lysis = function(i, j) {
    this.grid[i][j].alive = 0
    this.grid[i][j].genomesize = undefined
    this.grid[i][j].fitness = undefined
    this.grid[i][j].specificity = undefined
    this.grid[i][j].target_site = undefined
    this.grid[i][j].T_in_genomes = undefined

    for (let p = 0; p < this.grid[i][j].genome.chromosome.length; p++) {
      if (this.grid[i][j].genome.chromosome[p].type == "T") {
        let randomnr = sim.TE_model.rng.genrand_real1()
        let direction = 0
        if (randomnr < 1 / 5) direction = 1
        else if (randomnr < 2 / 5) direction = 2
        else if (randomnr < 3 / 5) direction = 3
        else if (randomnr < 4/5) direction = 4

        this.getNeighbour(sim.TE_model, i, j, direction).eDNA.push(this.grid[i][j].genome.chromosome[p])
      }
    }
  }

  get_insertion_chance = function(i, t, s) {
  	if(i < 0) return 0
    let d = Math.abs(i - t)
    return (1 - d * (s / (1 - s)))
  }
  // A custom function for TE dynamics during the lifetime of a cell
  sim.TE_model.TEdynamicsI = function(i, j) {
    jumping = []
    for (let p = 0; p < this.grid[i][j].genome.chromosome.length; p++) {
      if (this.grid[i][j].genome.chromosome[p].type == "T") {
        if (this.rng.genrand_real1() < jump_attempt_rate)
          jumping.push(this.grid[i][j].genome.chromosome[p])
      }
    }
	  let nr_jumps = 0
    for (let p = 0; p < jumping.length; p++) {
      let random_pos = Math.floor(this.rng.genrand_real1() * this.grid[i][j].genome.chromosome.length)
      //1-x\cdot\frac{\left(b\right)}{\left(1-b\right)}
      let site = this.grid[i][j].genome.chromosome[random_pos]
      let chance = get_insertion_chance(site.insertion_site, jumping[p].target_site, jumping[p].specificity)
      if (chance > 0 && this.rng.genrand_real1() < chance) {

        /* console.log(`Chance:   ${chance}`)
        console.log(`Ins_site: ${site.insertion_site}`)
        console.log(`Tar_site: ${jumping[p].target_site}`)
        console.log(`Specific: ${jumping[p].specificity}`) */

        /*console.log(`Before jumping into position ${random_pos}`)      
        let chr = Object.values(this.grid[i][j].genome.chromosome).reduce((t, {type}) => t + type, '')
        let str = '' 
        for(let q=0; q<chr.length;q++) str += q==random_pos ? 'v' : ' '
        console.log(`${str}`)
        console.log(`${chr}`)
         */
				nr_jumps ++
        let new_TE_copy = jumping[p].copy(true)
				
        if (this.rng.genrand_real1() < probability_TE_induced_damage) {
        	let new_ins_site = -1
        	if(this.grid[i][j].genome.chromosome[random_pos].type == "G") 
          	new_ins_site = coding_motifs[Math.floor(Math.random() * coding_motifs.length)]
          else new_ins_site = noncoding_motifs[Math.floor(Math.random() * noncoding_motifs.length)]

					this.grid[i][j].genome.chromosome[random_pos].break(new_ins_site)

        }
        this.grid[i][j].genome.chromosome.splice(random_pos, 0, new_TE_copy)
      }

      /*    chr = Object.values(this.grid[i][j].genome.chromosome).reduce((t, {type}) => t + type, '')
         console.log(`${chr}`)
          */
    }
    if (jumping.length > 0) this.grid[i][j].genome.calculate_fitness()
		successful_replications += nr_jumps
		attempted_replications += jumping.length
  }


  // A custom function for TE dynamics from the eDNA pool
  sim.TE_model.TEdynamicsII = function(i, j) {
    let nr_jumps = 0
    for (let p = 0; p < this.grid[i][j].eDNA.length; p++) {
      let randomnr = this.rng.genrand_real1()
      let uptake = randomnr < uptake_from_pool
      if (uptake) {
        let random_pos = Math.floor(this.rng.genrand_real1() * this.grid[i][j].genome.chromosome.length)
        let site = this.grid[i][j].genome.chromosome[random_pos]
        let TE = this.grid[i][j].eDNA[p]
        let chance = get_insertion_chance(site.insertion_site, TE.target_site, TE.specificity)
       				
        attempted_replications++
        if (chance > 0 && sim.rng.random() < chance) {
						nr_jumps++
        	 //let chance_failure = (1-chance)**10
           //if(chance_failure < sim.rng.genrand_real1()){
           //console.log(`{Chance: ${chance}\nFailure: ${chance_failure}`)
          	let new_TE_copy = TE.copy(true)
            if (this.rng.genrand_real1() < probability_TE_induced_damage) {
              this.grid[i][j].genome.chromosome[random_pos].break(sim.rng.random()) 
							//this.grid[i][j].genome.chromosome[random_pos].break(TE.target_site) 
            }
            this.grid[i][j].genome.chromosome.splice(random_pos, 0, new_TE_copy)
            
           //}
        }
        this.grid[i][j].eDNA.splice(p, 1)
      }
    }
    if (nr_jumps > 0) this.grid[i][j].genome.calculate_fitness()
		successful_replications += nr_jumps
  }

  // Custom function to mix only the eDNA
  sim.TE_model.mixeDNA = function() {
    let all_eDNA_gps = [];
    for (let i = 0; i < this.nc; i++)
      for (let j = 0; j < this.nr; j++)
        all_eDNA_gps.push(this.grid[i][j].eDNA)

    all_eDNA_gps = shuffle(all_eDNA_gps, this.rng)

    for (let i = 0; i < this.nc; i++)
      for (let j = 0; j < this.nr; j++)
        this.grid[i][j].eDNA = all_eDNA_gps.pop()
    // return "Perfectly mixed the grid"
  }

  sim.TE_model.update = function() {
    if (this.time % sim.config.graph_interval == 0) this.updateGraphs()
		successful_replications = 0
		attempted_replications = 0
    this.synchronous() // Applied as many times as it can in 1/60th of a second
    this.apply_async(this.diffuse_eDNA)
    if (sim.mixDNApool == true) this.mixeDNA()
  }

  sim.TE_model.updateGraphs = function() {
    let num_alive = 0,
      gsizes = 0,
      hks = 0,
      nes = 0,
      non = 0,
      tra = 0,
      fitnesses = 0,
      sum_tra_rates = 0
    let genome_sizes = []
    let is_counts = []
    let specificities = []
    let TE_insertion_sites = []
    let coding_insertion_sites = []
    let safe_insertion_sites = []
    let target_sites = []

    for (let i = 0; i < sim.TE_model.nc; i++)
      for (let j = 0; j < sim.TE_model.nr; j++) {
        if (this.grid[i][j].alive == 1) {

          num_alive++
          gsizes += this.grid[i][j].genome.chromosome.length
          fitnesses += this.grid[i][j].genome.fitness
          let num_tra = 0
          for (let p = 0; p < sim.TE_model.grid[i][j].genome.chromosome.length; p++){
	          let site = sim.TE_model.grid[i][j].genome.chromosome[p].insertion_site;
            switch (sim.TE_model.grid[i][j].genome.chromosome[p].type) {
              case "G":
                hks++;
                if(site >= 0) coding_insertion_sites.push(site);
                break;
              case "g":
                nes++;
                if(site >= 0) safe_insertion_sites.push(site);
                break;
              case ".":
                non++;
                if(site >= 0) safe_insertion_sites.push(site);
                break;
              case "T":
                tra++;
                num_tra++
                TE_insertion_sites.push(sim.TE_model.grid[i][j].genome.chromosome[p].insertion_site)
                target_sites.push(sim.TE_model.grid[i][j].genome.chromosome[p].target_site)
                specificities.push(sim.TE_model.grid[i][j].genome.chromosome[p].specificity)
                sum_tra_rates += sim.TE_model.grid[i][j].genome.chromosome[p].transposition_rate
                break;
            }
          }
          //   if(this.grid[i][j].genome.chromosome.length != num_tra) throw new Error("he?")
          genome_sizes.push(this.grid[i][j].genome.chromosome.length)
          is_counts.push(num_tra)
        }
      }
    this.plotArray(["Population size"],
      [num_alive],
      ["blue"],
      "Population size (nr. of living cells)", {
        width: 600
      })
    this.plotArray(["Genome size", "Essential", "Non-essential", "Non-coding", "Transposons"],
      [gsizes / num_alive, hks / num_alive, nes / num_alive, non / num_alive, tra / num_alive],
      ["black", "blue", "#00CC00", "grey", "red"],
      "Avg genome size and composition", {
        width: 600
      })
			this.plotArray(["Attempted replications", "Succesful replications"],
      [successful_replications/attempted_replications],
      ["#00AA00"],
      "TE jumping success rate", {
        width: 600
      })
			
    /* this.plotArray(["Fitness"],
      [fitnesses / num_alive],
      ["black"],
      "Avg fitness", {
        width: 600
      }) */

    if (sim.time % 50 == 0) {
      specificities = shuffle(specificities)
      let spec = specificities.slice(0, Math.min(specificities.length, 100))
      this.plotPoints(spec, "Specificities", {
      	labelsDivWidth: 0,
        width: 600
      })
      target_sites = shuffle(target_sites)
      let tsites = target_sites.slice(0, Math.min(target_sites.length, 100))
      this.plotPoints(tsites, "Target_sites", {
        width: 600,
        labelsDivWidth: 0
      })
    }

    let layout = {
      paper_bgcolor: 'rgb(225,225,225)',
      plot_bgcolor: 'rgba(225,225,225,0)',
      font: {
        size: "15"
      },
      title: `Histogram of IS-counts at T=${this.time}`,
      width: 600,
      height: 300,
      yaxis: {
        type: 'linear',
        autorange: true
      },
      xaxis: {
        range: [-5, 60]
      }
    };

    let histo_dat = {
      xbins: {
        size: 1
      },
      marker: {
        color: 'rgba(0,0,0,0.2)'
      },
      type: 'histogram',
      name: 'Genome size',
      offsetgroup: "1"
    };
    let is_dat = {
      xbins: {
        size: 1
      },
      marker: {
        color: 'red'
      },
      type: 'histogram',
      name: 'IS counts',
      offsetgroup: "1"
    };

    let layout2 = {
      paper_bgcolor: 'rgb(225,225,225)',
      plot_bgcolor: 'rgba(225,225,225,0)',
      font: {
        size: "15"
      },
      title: `Histogram of IS-properties at T=${this.time}`,
      width: 600,
      height: 300,
      yaxis: {
        type: 'linear',
        autorange: true
      },
      xaxis: {
        range: [-0.02, 1.02]
      }
    };

    let coding_ins = {
      xbins: {
        size: 0.02
      },
      marker: {
        color: 'rgba(0,0,0,0.1)'
      },
      type: 'histogram',
      name: 'Coding motifs',
      offsetgroup: "1"
    };
    let safe_ins = {
      xbins: {
        size: 0.02
      },
      marker: {
        color: 'rgba(0,100,0,0.4)'
      },
      type: 'histogram',
      name: 'Safe motifs',
      offsetgroup: "1"
    };
    let te_ins_dat = {
      xbins: {
        size: 0.02
      },
      marker: {
        color: 'rgba(0,0,0,0.5)'
      },
      type: 'histogram',
      name: 'TE motifs',
      offsetgroup: "1"
    };
    let target_dat = {
      xbins: {
        size: 0.02
      },
      marker: {
        color: 'rgba(200,0,0,0.5)'
      },
      type: 'histogram',
      name: 'Target sites',
      offsetgroup: "1"
    };
    let spec_dat = {
      xbins: {
        size: 0.02
      },
      marker: {
        color: 'rgba(0,0,255,0.5)'
      },
      type: 'histogram',
      name: 'Specificities',
      offsetgroup: "1"
    };
    
    
    histo_dat.x = genome_sizes
    is_dat.x = is_counts
    target_dat.x = target_sites
    coding_ins.x = coding_insertion_sites
    safe_ins.x = safe_insertion_sites
    te_ins_dat.x = TE_insertion_sites
    spec_dat.x = specificities
		
    Plotly.newPlot('histo', [histo_dat, is_dat], layout);
    Plotly.newPlot('histo2', [target_dat, spec_dat], layout2);
    
    Plotly.newPlot('histo3', [coding_ins, safe_ins, te_ins_dat], layout2);



  }


  // sim.addHTML("canvas_holder", "<img src=\"legend.png\">")

  sim.addButton("Pause/continue", function() {
    sim.toggle_play()
  })
  sim.addButton("Well-mix (all)", function() {
    sim.toggle_mix()
  })
  sim.addButton("Well-mix (eDNA)", () => {
    sim.mixDNApool = !sim.mixDNApool
  })
  sim.addButton("Restart", function() {
    sim.TE_model.initialise()
  })
  sim.addButton("Reset", function() {
    location.reload();
  })
  /* sim.addHTML("form_holder", "<br>Ecological options:")
  sim.addSlider("death_rate", 0.0, 1.0, 0.001, "Stochastic death rate (d)")
  sim.addSlider("non", 0.0, 200.0, 1.00, "No-reproduction constant (eps)")
  sim.addSlider("diff_rate_edna", 0.0, 0.25, 0.001, "eDNA diffusion rate (D)")
  sim.addSlider("degr_rate_edna", 0.0, 1.0, 0.001, "eDNA degradation rate (q)")
  
  
  sim.addHTML("form_holder", "<br>TE options:")
  sim.addSlider("uptake_from_pool", 0.0, 1.0, 0.001, "Uptake rate from eDNA pool (u)")
  sim.addSlider("jump_attempt_rate", 0.0, 1.0, 0.001, "TE jump attempt rate (j)")
  sim.addSlider("transposon_fitness_cost", 0.0, 1.0, 0.001, "TE fitness cost (c)")
  sim.addSlider("probability_TE_induced_damage", 0.0, 1.0, 0.01, "TE-damage propensity (b)")
  
  sim.addHTML("form_holder", "<br>Mutations:")
  sim.addSlider("phi_mutation_rate", 0.0, 1.0, 0.001, "TE (phi) mutation rate")
  sim.addSlider("gene_deletion_rate", 0.0, 0.1, 0.0001, "Gene deletion rate")
  sim.addSlider("gene_duplication_rate", 0.0, 0.1, 0.0001, "Gene duplication rate")
  sim.addSlider("gene_inactivation_rate", 0.0, 0.1, 0.0001, "Gene inactivation rate")
  
  
  sim.addHTML("form_holder", "<br>Initial conditions (restart required!):")
  sim.addSlider("init_es", 0.0, 100.0, 1, "Nr. essential genes")
  sim.addSlider("init_nc", 0.0, 300.0, 1, "Nr. non-coding elements")
  sim.addSlider("init_ne", 0.0, 100.0, 1, "Nr. non-essential functions")
  sim.addSlider("non_essential_gene_boon", 0.0, 1.0, 0.001, "Fitness added per non-essential function")
  sim.addSlider("init_tra_rate", 0.0, 1.0, 0.001, "Initial TE jump rate") */

  sim.start()
  if (mix) sim.toggle_mix()
}


/*--------------------------------------------------------------------*/
/*--------------------------------CLASSES-----------------------------*/
/*--------------------------------------------------------------------*/

class Genome {
  // Genome constructor
  constructor() {
    this.uid = genomeIds.next()
    this.total_num_hk = init_es
    this.total_num_ne = init_ne
  }

  initialise(init_hk, init_ne, init_nc, init_tr, init_transposition_rate) {
    this.generation = 1
    this.chromosome = []

    for (let i = 0; i < init_hk; i++) this.chromosome.push(new Gene({
      type: "G",
      func: i,
      insertion_site: coding_motifs[Math.floor(Math.random() * coding_motifs.length)]
      //insertion_site: coding_sites[i%coding_sites.length]
    }))
    for (let i = 0; i < init_ne; i++) this.chromosome.push(new Gene({
      type: "g",
      func: i,
      insertion_site: coding_motifs[Math.floor(Math.random() * coding_motifs.length)]
      //insertion_site: coding_sites[i%coding_sites.length]
    }))
    for (let i = 0; i < init_nc; i++) this.chromosome.push(new Gene({
      type: ".",
      func: 0,
      insertion_site: noncoding_motifs[Math.floor(Math.random() * noncoding_motifs.length)]
      //insertion_site: noncoding_sites[i%noncoding_sites.length]
    }))
    for (let i = 0; i < init_tr; i++) this.chromosome.push(new Gene({
      type: "T",
      func: 0,
      transposition_rate: init_tra_rate,
      insertion_site: sim.rng.random(),
      target_site: sim.rng.random(),
      specificity: sim.rng.random()

    }))
    
    shuffle(this.chromosome)
    this.calculate_fitness()
  }

  copy(mutate) {
    let child = new Genome()
    child.chromosome = []
    for (let i = 0; i < this.chromosome.length; i++) {
      let new_gene = this.chromosome[i].copy(true)
      child.chromosome.push(new_gene)
    }
    //        console.log(child.chromosome)
    child.generation = this.generation + 1
    child.fitness = this.fitness
    child.specificity = this.specificity
    child.target_site = this.target_site
    child.nr_tra = this.nr_tra
    if (mutate) child.mutate()
    return child
  }

  calculate_fitness() {
    this.fitness = 1.0
		this.specificity = 0.0
    this.target_site = 0.0
    let hks = [],
      nes = []
    this.nr_tra = 1e-20
    hks.length = this.total_num_hk
    nes.length = this.total_num_ne
    for (let i = 0; i < this.chromosome.length; i++) {
      let gene = this.chromosome[i]
      switch (gene.type) {
        case "G":
          hks[gene.func] = 1
          break
        case "g":
          nes[gene.func] = 1
          break
        case "T":
          this.nr_tra++
          this.specificity += gene.specificity
          this.target_site += gene.target_site
          break
      }
    }
    
		if(this.nr_tra>1) this.specificity = this.specificity/this.nr_tra 
    if(this.nr_tra>1) this.target_site = this.target_site/this.nr_tra 
    let hks_present = 0
    for (let i = 0; i < hks.length; i++)
      if (hks[i] == 1) hks_present++
    for (let i = 0; i < nes.length; i++)
      if (nes[i] == 1) this.fitness += non_essential_gene_boon
    this.fitness -= this.nr_tra * transposon_fitness_cost
		if(this.nr_tra>=1) this.fitness += transposon_benefit_one_copy
    if (hks_present < this.total_num_hk) this.fitness = 0.0
    this.fitness = Math.max(0, Math.min(this.fitness, 2.0))
  }

  mutate() {
    let mutation = false

    for (let i = 0; i < this.chromosome.length; i++) {
      if (this.chromosome[i].type == 'T' && sim.rng.genrand_real1() < is_deletion_rate) {
        this.chromosome[i] = new Gene({
          type: ".",
          func: 0,
          insertion_site: this.chromosome[i].target_site
        })
        mutation = true
      }
      else if (sim.rng.genrand_real1() < influx_motifs) {
      		let new_ins_site = noncoding_motifs[Math.floor(Math.random() * noncoding_motifs.length)]                    
        	
        	this.chromosome.splice(i, 0, new Gene({
      			type: ".",
      			func: 0,
      			insertion_site: new_ins_site}))

        mutation = true
      }
    }
    for (let i = 0; i < this.chromosome.length; i++) {
      // Mutations with the javascript "splice" function: splice(pos,num_remove,append_this)
      let randomnr = sim.rng.genrand_real1()
      if (randomnr < gene_deletion_rate) {
        if(this.chromosome[i].type == "T") this.chromosome[i].break(this.chromosome[i].target_site)
        else this.chromosome.splice(i, 1) // Single gene deletion (splice 1 off, starting from i, append nothing)
        mutation = true
      } else if (randomnr < gene_deletion_rate + gene_duplication_rate) {
        let newgene = this.chromosome[i].copy(true)
        this.chromosome.splice(i, 0, newgene) // Single gene duplication (splice 0 off, but append the current pos to the array)
        mutation = true
      } else if (randomnr < gene_deletion_rate + gene_duplication_rate + gene_deletion_rate) {
        let size = sim.rng.genrand_real1() * this.chromosome.length / 4
        this.chromosome.splice(i, size) // Tandem deletion (splice up to a fourth of, plus one to ensure the last can be deleted)
        mutation = true
      } else if (randomnr < gene_deletion_rate + gene_duplication_rate + gene_deletion_rate + gene_duplication_rate) {
        if (this.chromosome.length > 1000) break
        let size = Math.floor(1 + sim.rng.genrand_real1() * this.chromosome.length / 4)
        if (size > this.chromosome.length) size = this.chromosome.length
        const strand = [...this.chromosome.slice(i, i + size)]
        this.chromosome.splice(i, 0, ...strand)
        i += size
        mutation = true
      } else if (randomnr < gene_deletion_rate + gene_duplication_rate + gene_deletion_rate + gene_duplication_rate + gene_inactivation_rate) {
        this.chromosome[i].type = '.'
        mutation = true
      } 

     
    }
    if (mutation) this.calculate_fitness()
  }
}

class Gene {
  // Gene constructor
  constructor(parent_gene) {
    for (var k in parent_gene) this[k] = parent_gene[k];
    this.uid = geneIds.next() // Just so it has a unique identifier, no biological function        
  }

  copy(mutate) {
    let new_gene = new Gene(this)
    if (mutate) {
      if (new_gene.type == "T") {
        if (sim.rng.genrand_real1() < specificity_mutation_rate)
          new_gene.specificity = gaussianRandom(new_gene.specificity, mut_step_size)          

        if (sim.rng.genrand_real1() < target_mutation_rate)
          new_gene.target_site = gaussianRandom(new_gene.target_site, mut_step_size)          

        new_gene.specificity = Math.min(Math.abs(new_gene.specificity), 1.0)
        new_gene.target_site = Math.min(Math.abs(new_gene.target_site), 1.0)

      }
      if (sim.rng.genrand_real1() < insert_mutation_rate) {
        //new_gene.insertion_site += (sim.rng.genrand_real1() * 2 - 1) * mut_step_size
        
        new_gene.insertion_site = gaussianRandom(new_gene.insertion_site, mut_step_size)
        
        new_gene.insertion_site = Math.min(Math.abs(new_gene.insertion_site), 1.0)
      }
    }
    return new_gene
  }
  break(new_insertion_site){
    this.type = "."
    this.insertion_site = new_insertion_site
  }
  
}


/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(sim.rng.genrand_real1() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

// Standard Normal variate using Box-Muller transform.
function gaussianRandom(mean=0, stdev=1) {
    let u = 1 - Math.random(); //Converting [0,1) to (0,1)
    let v = Math.random();
    let z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}


function* idGenerator() {
  let id = 1;
  while (true) {
    yield id
    id++
  }
}
const genomeIds = idGenerator()
const geneIds = idGenerator()


///// OLD PARAMETERS (van Dijk et al 2021)
var phi_mutation_rate = 0.0 // The old "rate" at which TEs jumped, before the usage of insertion sites

var init_tra_rate = 1.00 // 
