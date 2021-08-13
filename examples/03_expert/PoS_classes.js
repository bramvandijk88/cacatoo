

 class Genome
 {
     // Genome constructor
     constructor()
     {
         this.uid = genomeIds.next()
         this.total_num_hk = init_es
         this.total_num_ne = init_ne  
     }
 
     initialise(init_hk,init_ne,init_nc,init_tr)
     {
         this.generation = 1
         this.chromosome = []
               
         for(let i=0;i<init_hk;i++) this.chromosome.push(new Gene("G",i))
         for(let i=0;i<init_ne;i++) this.chromosome.push(new Gene("g",i))
         for(let i=0;i<init_nc;i++) this.chromosome.push(new Gene(".",0))
         for(let i=0;i<init_tr;i++) this.chromosome.push(new Gene("T",0,0.85))
         shuffle(this.chromosome)
         this.calculate_fitness()
     }
 
     copy(mutate)
     {
         let child = new Genome()
         child.chromosome = []
         for(let i=0;i<this.chromosome.length;i++) child.chromosome.push(this.chromosome[i].copy())
         child.generation = this.generation+1
         if(mutate) child.mutate()        
         return child
     }
     
     calculate_fitness()
     {
         this.fitness = 1.0
 
         let hks =[], nes = []
         hks.length = this.total_num_hk
         nes.length = this.total_num_ne
         for(let i=0;i<this.chromosome.length;i++)
         {
             let gene = this.chromosome[i]
             switch(gene.type)
             {
                 case "G":
                     hks[gene.func] = 1
                 case "g":
                     nes[gene.func] = 1
             }
         }
 
         let hks_present = 0
         for(let i=0; i<hks.length; i++) if(hks[i]==1) hks_present++       
         for(let i=0; i<nes.length; i++) if(nes[i]==1) this.fitness+=0.1
         if(hks_present < this.total_num_hk) this.fitness = 0.0
     }
 
     mutate()
     {
         let mutation = false
         for(let i=0;i<this.chromosome.length;i++) 
         {
             // Mutations with the javascript "splice" function: splice(pos,num_remove,append_this)
             let randomnr = sim.rng.genrand_real1()
             if(randomnr<gene_deletion_rate)
             {
                 this.chromosome.splice(i,1)                                                               // Single gene deletion (splice 1 off, starting from i, append nothing)
                 mutation = true
             }
             else if(randomnr<gene_deletion_rate+gene_duplication_rate)
             {
                 let newgene = this.chromosome[i].copy()
                 this.chromosome.splice(i,0,newgene)                                            // Single gene duplication (splice 0 off, but append the current pos to the array)
                 mutation = true
             } 
             else if(randomnr<gene_deletion_rate+gene_duplication_rate+gene_tandem_deletion) 
             {
                 let size = sim.rng.genrand_real1()*this.chromosome.length/4
                 this.chromosome.splice(i,size)                // Tandem deletion (splice up to a fourth of, plus one to ensure the last can be deleted)
                 mutation = true
             }
             else if(randomnr <gene_deletion_rate+gene_duplication_rate+gene_tandem_deletion+gene_tandem_duplication) 
             {
                 if(this.chromosome.length > 1000) break                
                 let size = Math.floor(1+sim.rng.genrand_real1()*this.chromosome.length/4)
                 if(size > this.chromosome.length) size = this.chromosome.length
                 // console.log(`Tandem duplication happens at pos ${i} with size ${size}`)
                 // console.log('before',this.chromosome)
                 const strand = [...this.chromosome.slice(i,i+size)]
                 // console.log(strand)
                 this.chromosome.splice(i,0,...strand)
                 // for(let p = 0; p < size; p++)
                 // {
                 //     this.chromosome.splice(i,0,...this.chromosome.slice(i,0,this.chromosome[p+i]))                                                              // Tandem duplication
                 //     i++
                 // }
                 // console.log('after',this.chromosome)
                 i+=size        
                 mutation = true  
                 // throw new Error("KLaar")      
             }
             else if(randomnr < gene_deletion_rate+gene_duplication_rate+gene_tandem_deletion+gene_tandem_duplication+gene_inactivation_rate)
             {
                 this.chromosome[i].type = '.'
             }
         }
         this.calculate_fitness()
     }
 }
 
 class Gene
 {
     // Gene constructor
     constructor(type,func,transposition_rate)
     {
         this.uid = geneIds.next()                       // Just so it has a unique identifier, no biological function
         this.type = type                        // Here assigned a string to a gene, being either "essential", "non-essential", "non-coding", or "transposon"
         this.func = func                // A number indicating the function of that gene (e.g. 1 type of each function is necessary for absolutely essential, while non-essential yields incremental benefits)
         this.transposition_rate = transposition_rate || 0.0
     }
 
     copy()
     {
         return new Gene(this.type,this.func,this.transposition_rate)
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
 
 function* idGenerator() 
 {
     let id = 1;
     while(true)
     {
         yield id
         id++
     }
 }
 const genomeIds = idGenerator()
 const geneIds = idGenerator()