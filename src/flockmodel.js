import Gridpoint from "./gridpoint.js"
import Graph from './graph.js'
import QuadTree from './quadtree.js'
import * as utility from './utility.js'

/**
 *  Flockmodel is the second modeltype in Cacatoo, which uses Boids that can interact with a @Gridmodel
 */

class Flockmodel {
    /**
    *  The constructor function for a @Flockmodl object. Takes the same config dictionary as used in @Simulation
    *  @param {string} name The name of your model. This is how it will be listed in @Simulation 's properties
    *  @param {dictionary} config A dictionary (object) with all the necessary settings to setup a Cacatoo GridModel. 
    *  @param {MersenneTwister} rng A random number generator (MersenneTwister object)
    */
    constructor(name, config={}, rng) {
        this.name = name
        this.config = config
        this.time = 0
        this.draw = true
        this.max_force = config.max_force || 1
        this.max_speed = config.max_speed || 1
        this.width =  config.width || config.ncol ||600
        this.height =  config.height ||config.nrow || 600
        this.scale = config.scale || 1
        this.shape = config.shape || 'dot'
        this.click = config.click || 'none'
        this.follow_mouse = config.follow_mouse
        this.init_velocity = config.init_velocity || 0.1
        this.rng = rng
        this.random = () => { return this.rng.random()}
        this.randomInt = (a,b) => { return this.rng.randomInt(a,b)}                
        this.wrap = config.wrap || [true, true]
        
        this.wrapreflect = 1
        if(config.wrapreflect) this.wrapreflect = config.wrapreflect

        this.graph_update = config.graph_update || 20
        this.graph_interval = config.graph_interval || 2
        this.bgcolour = config.bgcolour || undefined
        this.physics = true
        if(config.physics && config.physics != true) this.physics = false
        
        this.statecolours = {}
        if(config.statecolours) this.statecolours = this.setupColours(config.statecolours,config.num_colours||100) // Makes sure the statecolours in the config dict are parsed (see below)
        if(!config.qt_capacity) config.qt_capacity = 3
        this.graphs = {}                // Object containing all graphs belonging to this model (HTML usage only)
        this.canvases = {}              // Object containing all Canvases belonging to this model (HTML usage only)

        // Flocking stuff
        let radius_alignment = this.config.alignment ? this.config.alignment.radius : 0
        let radius_cohesion = this.config.cohesion ? this.config.cohesion.radius : 0
        let radius_separation = this.config.separation ? this.config.separation.radius : 0
       
        this.neighbourhood_radius = Math.max(radius_alignment,radius_cohesion,radius_separation)
        this.friction = this.config.friction
        this.mouse_radius = this.config.mouse_radius || 100
        this.mousecoords = {x:-1000,y:-1000}
        this.boids = []
        this.mouseboids = []
        this.obstacles = []

        this.populateSpot()
        this.build_quadtree()

    }

    build_quadtree(){
        let boundary = { x: this.width/2, y: this.height/2, w: this.width, h: this.height }
        this.qt = new QuadTree(boundary, this.config.qt_capacity)
        for (let boid of this.boids) {
            this.qt.insert(boid)
        }
    }

    /**
     * Populates the space with individuals in a certain radius from the center
     */
    populateSpot(num,put_x,put_y,s){
        let n = num || this.config.num_boids 
        let size = s || this.width/2
        let x = put_x || this.width/2
        let y = put_y || this.height/2
        
        for(let i=0; i<n;i++){
            let angle = this.random() * 2 * Math.PI;
            this.boids.push({
                    position: { x: x + size - 2*this.random()*size, y: y+size-2*this.random()*size },
                    velocity: { x: this.init_velocity*Math.cos(angle) * this.max_speed, y: this.init_velocity*Math.sin(angle) * this.max_speed },
                    acceleration: { x: 0, y: 0 },
                    size: this.config.size
            });
            
        }
        
    }

    copyBoid(boid){
        return utility.copy(boid)
    }
    
    /** TODO
    *  Saves the current flock a JSON object 
    *  @param {string} filename The name of of the JSON file
    */
    save_flock(filename) 
    {      
        
    }

    /**
    *  Reads a JSON file and loads a JSON object onto this flockmodel. Reading a local JSON file will not work in browser.
    *  Gridmodels 'addCheckpointButton' instead, which may be implemented for flocks at a later stage.
    *  @param {string} file Path to the json file
    */
    load_flock(file)
    {
        
    }

    /** Initiate a dictionary with colour arrays [R,G,B] used by Graph and Canvas classes
    *   @param {statecols} object - given object can be in two forms
    *                             | either {state:colour} tuple (e.g. 'alive':'white', see gol.html) 
    *                             | or {state:object} where objects are {val:'colour},
    *                             | e.g.  {'species':{0:"black", 1:"#DDDDDD", 2:"red"}}, see cheater.html 
    */
    setupColours(statecols,num_colours=18) {
        let return_dict = {}
        
        if (statecols == null){           // If the user did not define statecols (yet)
            return return_dict["state"] = utility.default_colours(num_colours)
        }
        let colours = utility.dict_reverse(statecols) || { 'val': 1 }
        
        for (const [statekey, statedict] of Object.entries(colours)) {
            if (statedict == 'default') {
                return_dict[statekey] = utility.default_colours(num_colours+1)
            }
            else if (statedict == 'random') {
                return_dict[statekey] = utility.random_colours(num_colours+1,this.rng)
            }
            else if (statedict == 'viridis') {
                 let colours = this.colourGradientArray(num_colours, 0,[68, 1, 84], [59, 82, 139], [33, 144, 140], [93, 201, 99], [253, 231, 37]) 
                 return_dict[statekey] = colours
            }
            else if (statedict == 'inferno') {
                let colours = this.colourGradientArray(num_colours, 0,[20, 11, 52], [132, 32, 107], [229, 92, 45], [246, 215, 70]) 
                return_dict[statekey] = colours                
            }
            else if (statedict == 'rainbow') {
                let colours = this.colourGradientArray(num_colours, 0,[251, 169, 73], [250, 228, 66], [139, 212, 72], [42, 168, 242], 
                             [50,100,255]) 
                return_dict[statekey] = colours                
            }
            else if (statedict == 'pride') {
                let colours = this.colourGradientArray(num_colours, 0,[228, 3, 3], [255, 140, 0], [255, 237, 0], [0, 128, 38], [0,76,255],[115,41,130]) 
                return_dict[statekey] = colours                
            }
            else if (statedict == 'inferno_rev') {
                let colours = this.colourGradientArray(num_colours, 0, [246, 215, 70], [229, 92, 45], [132, 32, 107])
                return_dict[statekey] = colours                
            }
            else if (typeof statedict === 'string' || statedict instanceof String)       // For if 
            {
                return_dict[statekey] = utility.stringToRGB(statedict)
            }
            else {
                let c = {}
                for (const [key, val] of Object.entries(statedict)) {
                    if (Array.isArray(val)) c[key] = val
                    else c[key] = utility.stringToRGB(val)
                }
                return_dict[statekey] = c
            }
        }
        return return_dict
    }


    /** Initiate a gradient of colours for a property (return array only) 
    * @param {string} property The name of the property to which the colour is assigned
    * @param {int} n How many colours the gradient consists off
    * For example usage, see colourViridis below
    */
    colourGradientArray(n,total) 
    {        
        let color_dict = {}
        //color_dict[0] = [0, 0, 0]

        let n_arrays = arguments.length - 2
        if (n_arrays <= 1) throw new Error("colourGradient needs at least 2 arrays")
        let segment_len = Math.ceil(n / (n_arrays-1))

        if(n <= 10 && n_arrays > 3) console.warn("Cacatoo warning: forming a complex gradient with only few colours... hoping for the best.")
        let total_added_colours = 0

        for (let arr = 0; arr < n_arrays - 1 ; arr++) {
            let arr1 = arguments[2 + arr]
            let arr2 = arguments[2 + arr + 1]

            for (let i = 0; i < segment_len; i++) {
                let r, g, b
                if (arr2[0] > arr1[0]) r = Math.floor(arr1[0] + (arr2[0] - arr1[0])*( i / (segment_len-1) ))
                else r = Math.floor(arr1[0] - (arr1[0] - arr2[0]) * (i / (segment_len-1)))
                if (arr2[1] > arr1[1]) g = Math.floor(arr1[1] + (arr2[1] - arr1[1]) * (i / (segment_len - 1)))
                else g = Math.floor(arr1[1] - (arr1[1] - arr2[1]) * (i / (segment_len - 1)))
                if (arr2[2] > arr1[2]) b = Math.floor(arr1[2] + (arr2[2] - arr1[2]) * (i / (segment_len - 1)))
                else b = Math.floor(arr1[2] - (arr1[2] - arr2[2]) * (i / (segment_len - 1)))
                color_dict[Math.floor(i + arr * segment_len + total)+1] = [Math.min(r,255), Math.min(g,255), Math.min(b,255)]
                total_added_colours++
                if(total_added_colours == n) break
            }
        }        
        return(color_dict)
    }

    /** Initiate a gradient of colours for a property. 
    * @param {string} property The name of the property to which the colour is assigned
    * @param {int} n How many colours the gradient consists off
    * For example usage, see colourViridis below
    */
    colourGradient(property, n) {        
        let offset = 2        
        let n_arrays = arguments.length - offset
        
        if (n_arrays <= 1) throw new Error("colourGradient needs at least 2 arrays")
        
        let color_dict = {}
        let total = 0

        if(this.statecolours !== undefined && this.statecolours[property] !== undefined){
            color_dict = this.statecolours[property]
            total = Object.keys(this.statecolours[property]).length
        } 
        
        let all_arrays = []
        for (let arr = 0; arr < n_arrays ; arr++) all_arrays.push(arguments[offset + arr])

        let new_dict = this.colourGradientArray(n,total,...all_arrays)

        this.statecolours[property] = {...color_dict,...new_dict}
    }

    /** Initiate a gradient of colours for a property, using the Viridis colour scheme (purpleblue-ish to green to yellow) or Inferno (black to orange to yellow)
    * @param {string} property The name of the property to which the colour is assigned
    * @param {int} n How many colours the gradient consists off
    * @param {bool} rev Reverse the viridis colour gradient
    */
    colourViridis(property, n, rev = false, option="viridis") {

        if(option=="viridis"){
            if (!rev) this.colourGradient(property, n, [68, 1, 84], [59, 82, 139], [33, 144, 140], [93, 201, 99], [253, 231, 37])         // Viridis
            else this.colourGradient(property, n, [253, 231, 37], [93, 201, 99], [33, 144, 140], [59, 82, 139], [68, 1, 84])             // Viridis
        }
        else if(option=="inferno"){
            if (!rev) this.colourGradient(property, n, [20, 11, 52], [132, 32, 107], [229, 92, 45], [246, 215, 70])         // Inferno
            else this.colourGradient(property, n, [246, 215, 70], [229, 92, 45], [132, 32, 107], [20, 11, 52])              // Inferno
        }
    }    

     /** Flocking of individuals, based on X, Y, Z (TODO)
    * @param {Object} i The individual to be updates
    */
    flock(){
        if(this.physics) this.applyPhysics()
        this.build_quadtree()
    }
    
    calculateAlignment(boid, neighbours, max_speed) {
        let steering = { x: 0, y: 0 }
        if (neighbours.length > 0) {
            for (let neighbour of neighbours) {
                steering.x += neighbour.velocity.x;
                steering.y += neighbour.velocity.y;
            }
            steering.x /= neighbours.length;
            steering.y /= neighbours.length;
            steering = this.normaliseVector(steering);
            steering.x *= max_speed;
            steering.y *= max_speed;
            steering.x -= boid.velocity.x;
            steering.y -= boid.velocity.y;
        }
        return steering;
    }

    calculateSeparation(boid, neighbours, max_speed) {
        let steering = { x: 0, y: 0 };
        if (neighbours.length > 0) {
            for (let neighbour of neighbours) {
                let dx = boid.position.x - neighbour.position.x;
                let dy = boid.position.y - neighbour.position.y;

                // Adjust for wrapping in the x direction
                if (Math.abs(dx) > this.width / 2) {
                    dx = dx - Math.sign(dx) * this.width;
                }

                // Adjust for wrapping in the y direction
                if (Math.abs(dy) > this.height / 2) {
                    dy = dy - Math.sign(dy) * this.height;
                }

                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < this.config.separation.radius) {
                    let difference = { x: dx, y: dy };
                    difference = this.normaliseVector(difference);
                    steering.x += difference.x ;
                    steering.y += difference.y ;
                }
            }
            if (steering.x !== 0 || steering.y !== 0) {
                steering.x /= neighbours.length;
                steering.y /= neighbours.length;
                steering = this.normaliseVector(steering);
                steering.x *= max_speed;
                steering.y *= max_speed;
                steering.x -= boid.velocity.x;
                steering.y -= boid.velocity.y;
            }
        }
        return steering;
    }

    calculateCohesion(boid, neighbours, max_speed) {
        let steering = { x: 0, y: 0 };
        if (neighbours.length > 0) {
            let centerOfMass = { x: 0, y: 0 };
            for (let neighbour of neighbours) {
                let dx = neighbour.position.x - boid.position.x;
                let dy = neighbour.position.y - boid.position.y;

                // Adjust for wrapping in the x direction
                if (Math.abs(dx) > this.width / 2) {
                    dx = dx - Math.sign(dx) * this.width;
                }

                // Adjust for wrapping in the y direction
                if (Math.abs(dy) > this.height / 2) {
                    dy = dy - Math.sign(dy) * this.height;
                }

                centerOfMass.x += boid.position.x + dx;
                centerOfMass.y += boid.position.y + dy;
            }
            centerOfMass.x /= neighbours.length;
            centerOfMass.y /= neighbours.length;
            steering.x = centerOfMass.x - boid.position.x;
            steering.y = centerOfMass.y - boid.position.y;
            steering = this.normaliseVector(steering);
            steering.x *= max_speed;
            steering.y *= max_speed;
            steering.x -= boid.velocity.x;
            steering.y -= boid.velocity.y;
        }
        return steering;
    }

    calculateCollision(boid, neighbours,max_force) {
        let steering = { x: 0, y: 0 };
        
        if (neighbours.length > 0) {
            for (let neighbour of neighbours) {
                if(neighbour == boid) continue
                if(boid.ignore && boid.ignore.includes(neighbour)) continue
                let dx = boid.position.x - neighbour.position.x;
                let dy = boid.position.y - neighbour.position.y;

                // Adjust for wrapping in the x direction
                if (Math.abs(dx) > this.width / 2) {
                    dx = dx - Math.sign(dx) * this.width;
                }

                // Adjust for wrapping in the y direction
                if (Math.abs(dy) > this.height / 2) {
                    dy = dy - Math.sign(dy) * this.height;
                }

                let difference = { x: dx, y: dy };
                difference = this.normaliseVector(difference);
                steering.x += difference.x
                steering.y += difference.y
                
            }
            if (steering.x !== 0 || steering.y !== 0) {
                steering.x /= neighbours.length;
                steering.y /= neighbours.length;
                steering = this.normaliseVector(steering);
                steering.x *= max_force;
                steering.y *= max_force;
                steering.x -= boid.velocity.x;
                steering.y -= boid.velocity.y;
            }
        }
        boid.overlapping = neighbours.length>1       
        return steering;
    }

    followMouse(boid){
        if(this.mousecoords.x == -1000) return
        let dx = boid.position.x - this.mousecoords.x;
        let dy = boid.position.y - this.mousecoords.y;
        let distance = Math.sqrt(dx*dx + dy*dy);
        if (distance > 0) { // Ensure we don't divide by zero
            boid.velocity.x += (dx / distance) * this.config.mouseattraction * this.max_force * -1;
            boid.velocity.y += (dy / distance) * this.config.mouseattraction * this.max_force * -1;
        }
    }

    steerTowards(boid,x,y,strength){
        let dx = boid.position.x - x;
        let dy = boid.position.y - y;
        let distance = Math.sqrt(dx*dx + dy*dy);
        if (distance > 0) { // Ensure we don't divide by zero
            boid.velocity.x += (dx / distance) * strength * this.max_force * -1;
            boid.velocity.y += (dy / distance) * strength * this.max_force * -1;
        }
    }

    dist(obj1,obj2){
        let dx = obj1.x - obj2.x
        let dy = obj1.y - obj2.y
        return(Math.sqrt(dx*dx + dy*dy))
    }

    // Rules like boids, collisions, and gravity are done here
    applyPhysics() { 
        
        for (let i = 0; i < this.boids.length; i++) {
            let boid = this.boids[i];
            let friction = this.friction
            let gravity = this.config.gravity ?? 0
            let collision_force = this.config.collision_force ?? 0
            let max_force = this.max_force
            let brownian = this.config.brownian ?? 0.0
            let max_speed = this.max_speed 
            if(boid.locked) continue
            
            if(boid.max_speed !== undefined) max_speed = boid.max_speed
            if(boid.friction !== undefined) friction = boid.friction
            if(boid.max_force !== undefined) max_force = boid.max_force
            if(boid.gravity !== undefined) gravity = boid.gravity
            if(boid.collision_force !== undefined) collision_force = boid.collision_force
            
            let neighbours = this.getIndividualsInRange(boid.position, this.neighbourhood_radius)
            let alignment = this.config.alignment ? this.calculateAlignment(boid, neighbours,max_speed) : {x:0,y:0}
            let alignmentstrength = this.config.alignment ? this.config.alignment.strength : 0
            let separation = this.config.separation ? this.calculateSeparation(boid, neighbours,max_speed) : {x:0,y:0}
            let separationstrength = this.config.separation ? this.config.separation.strength : 0
            let cohesion = this.config.cohesion ? this.calculateCohesion(boid, neighbours,max_speed) : {x:0,y:0}
            let cohesionstrength = this.config.cohesion ? this.config.cohesion.strength : 0

            if(boid.alignmentstrength !== undefined) alignmentstrength = boid.alignmentstrength
            if(boid.cohesionstrength !== undefined) cohesionstrength = boid.cohesionstrength
            if(boid.separationstrength !== undefined) separationstrength = boid.separationstrength
            if(boid.brownian !== undefined) brownian = boid.brownian

            let collision = {x:0,y:0}
            if(collision_force > 0){
                let overlapping = this.getIndividualsInRange(boid.position, boid.size)
                collision = this.calculateCollision(boid, overlapping, max_force)
            } 
            
            // Add acceleration to the boid
            boid.acceleration.x += alignment.x * alignmentstrength + 
                                separation.x * separationstrength + 
                                cohesion.x * cohesionstrength +
                                collision.x * collision_force 
            boid.acceleration.y += alignment.y * alignmentstrength + 
                                separation.y * separationstrength + 
                                cohesion.y * cohesionstrength +
                                collision.y * collision_force +
                                gravity
            
            if(this.config.mouseattraction){
                 this.followMouse(boid)
            }
            // Limit the force applied to the boid
            let accLength = Math.sqrt(boid.acceleration.x * boid.acceleration.x + boid.acceleration.y * boid.acceleration.y);
            if (accLength > max_force) {
                boid.acceleration.x = (boid.acceleration.x / accLength) * max_force
                boid.acceleration.y = (boid.acceleration.y / accLength) * max_force
            }
            
            // Apply friction (linear, so no drag)
            boid.velocity.x *= (1-friction)
            boid.velocity.y *= (1-friction)
            
            boid.velocity.x+=brownian*(2*this.rng.random()-1)
            boid.velocity.y+=brownian*(2*this.rng.random()-1)
            
            // Update velocity
            boid.velocity.x += boid.acceleration.x
            boid.velocity.y += boid.acceleration.y 
            
            // Limit speed
            let speed = Math.sqrt(boid.velocity.x * boid.velocity.x + boid.velocity.y * boid.velocity.y)
            if (speed > max_speed) {
                boid.velocity.x = (boid.velocity.x / speed) * max_speed
                boid.velocity.y = (boid.velocity.y / speed) * max_speed
            }
            speed = Math.sqrt(boid.velocity.x * boid.velocity.x + boid.velocity.y * boid.velocity.y)

            

            // Update position
            boid.position.x += boid.velocity.x
            boid.position.y += boid.velocity.y

            // Check for collision with all obstacles
            for(let obs of this.obstacles){
                this.checkCollisionWithObstacle(boid,obs)
            }
            
            
            // Wrap around edges
            if(this.wrap[0]){
                if (boid.position.x < 0) boid.position.x += this.width
                if (boid.position.x >= this.width) boid.position.x -= this.width
            }
            else{
                if (boid.position.x < boid.size/2) boid.position.x = boid.size/2, boid.velocity.x *= -this.wrapreflect
                if (boid.position.x >= this.width - boid.size/2) boid.position.x = this.width - boid.size/2, boid.velocity.x *= -this.wrapreflect
            }
            if(this.wrap[1]){
                if (boid.position.y < 0) boid.position.y += this.height
                if (boid.position.y >= this.height) boid.position.y -= this.height
            }
            else{
                if (boid.position.y < boid.size/2) boid.position.y = boid.size/2, boid.velocity.y *= -this.wrapreflect
                if (boid.position.y >= this.height - boid.size/2) boid.position.y = this.height - boid.size/2, boid.velocity.y *= -this.wrapreflect
            }
            // Reset acceleration to 0 each cycle
            boid.acceleration.x = 0
            boid.acceleration.y = 0
        }
    }

   inBounds(boid, rect){
        if(!rect) rect = {x:0,y:0,w:this.width,h:this.height}
        let r = boid.size/2
        return(boid.position.x+r > rect.x && boid.position.y+r > rect.y &&
               boid.position.x-r < rect.x+rect.w && boid.position.y-r < rect.y+rect.h)
   }

   checkCollisionWithObstacle(boid, obs) {
        if(obs.type=="rectangle"){
            // Calculate edges of the ball
            const r = boid.size/2
            const left = boid.position.x - r
            const right = boid.position.x + r
            const top = boid.position.y - r
            const bottom = boid.position.y + r

            // Check for collision with rectangle
            if (right > obs.x && left < obs.x + obs.w && bottom > obs.y && top < obs.y + obs.h) {
                const prevX = boid.position.x - boid.velocity.x
                const prevY = boid.position.y - boid.velocity.y

                const prevLeft = prevX - r
                const prevRight = prevX + r
                const prevTop = prevY - r
                const prevBottom = prevY + r
                // Determine where the collision occurred
                if (prevRight <= obs.x || prevLeft >= obs.x + obs.w) {
                    boid.velocity.x = -boid.velocity.x*obs.force   // Horizontal collision
                    boid.position.x += boid.velocity.x; // Adjust position to prevent sticking
                }
                if (prevBottom <= obs.y || prevTop >= obs.y + obs.h) {
                    boid.velocity.y = -boid.velocity.y*obs.force; // Vertical collision
                    boid.position.y += boid.velocity.y; // Adjust position to prevent sticking
                }
            }
        }
        else if(obs.type=="circle"){
            let bigr = Math.max(boid.size, obs.r)
            let dx = obs.x - boid.position.x
            let dy = obs.y - boid.position.y
            let dist = Math.sqrt(dx*dx + dy*dy)
            if(dist < bigr){
                let difference = { x: dx, y: dy };
                difference = this.normaliseVector(difference);
                boid.velocity.x -= difference.x*obs.force
                boid.velocity.y -= difference.y*obs.force
            }

        }
        
    }


    lengthVector(vector) {
        return(Math.sqrt(vector.x * vector.x + vector.y * vector.y))
    }
    scaleVector(vector,scale){
        return {x:vector.x*scale,y:vector.y*scale}
    }
    normaliseVector(vector) {
        let length = this.lengthVector(vector)
        if (length > 0) return { x: vector.x / length, y: vector.y / length }
        else return { x: 0, y: 0 };
    }
    limitVector = function (vector,length){  
        let x = vector.x
        let y = vector.y
        let magnitude = Math.sqrt(x*x + y*y);
  
        if (magnitude > length) {
            // Calculate the scaling factor
              const scalingFactor = length / magnitude;
  
               // Scale the vector components
              const scaledX = x * scalingFactor;
              const scaledY = y * scalingFactor;
  
              // Return the scaled vector as an object
              return { x: scaledX, y: scaledY };
        }
        return { x:x, y:y }
      }

    // Angle in degrees
    rotateVector(vec, ang)
    {
        ang = -ang * (Math.PI/180);
        var cos = Math.cos(ang);
        var sin = Math.sin(ang);
        return {x: vec.x*cos - vec.y*sin, y: vec.x*sin + vec.y*cos}
    }

    handleMouseBoids(){}

    repelBoids(force=30){
        for (let boid of this.mouseboids) {
            let dx = boid.position.x - this.mousecoords.x;
            let dy = boid.position.y - this.mousecoords.y;
            let distance = Math.sqrt(dx*dx + dy*dy);
            if (distance > 0) { // Ensure we don't divide by zero
                    let strength = (this.mouse_radius - distance) / this.mouse_radius;
                    boid.velocity.x += (dx / distance) * strength * this.max_force * force;
                    boid.velocity.y += (dy / distance) * strength * this.max_force * force;
            }
        }
        this.mouseboids = []
    }
    pullBoids(){
        this.repelBoids(-30)
    }

    killBoids(){
        let mouseboids = this.mouseboids
        this.boids = this.boids.filter( function( el ) {
            return mouseboids.indexOf( el ) < 0;
          } );
    }


    
    /** Apart from flocking itself, any updates for the individuals are done here.
     * By default, nextState is empty. It should be defined by the user (see examples)
    */
    update() {
        
    }

    /** If called for the first time, make an update order (list of ints), otherwise just shuffle it. */
    set_update_order() {
        if (typeof this.upd_order === 'undefined')  // "Static" variable, only create this array once and reuse it
        {
            this.upd_order = []
            for (let n = 0; n < this.individuals.length; n++) {
                this.upd_order.push(n)
            }
        }
        utility.shuffle(this.upd_order, this.rng)         // Shuffle the update order
    }

    // TODO UITLEG
    getGridpoint(i,gridmodel){
        return gridmodel.grid[Math.floor(i.x)][Math.floor(i.y)]
    }

    // TODO UITLEG
    getNearbyGridpoints(boid,gridmodel,radius){
        let gps = []
        let ix = Math.floor(boid.position.x)
        let iy = Math.floor(boid.position.y)
        radius = Math.floor(0.5*radius)
        for (let x = ix-radius; x < ix+radius; x++)                         
        for (let y = iy-radius; y < iy+radius; y++)                         
        {
            if(!this.wrap[0])
                if(x < 0 || x > this.width-1) continue
            if(!this.wrap[1])
                if(y < 0 || y > this.height-1) continue
            if ((Math.pow((boid.position.x - x), 2) + Math.pow((boid.position.y - y), 2)) < radius*radius){
                gps.push(gridmodel.grid[(x + gridmodel.nc) % gridmodel.nc][(y + gridmodel.nr) % gridmodel.nr])
            }
        }
        return gps
    }

    getIndividualsInRange(position,radius){
        
        let qt = this.qt
        let width = this.width
        let height = this.height
        let neighbours = []     // Collect all found neighbours here
        const offsets = [       // Fetch in 9 possible ways for wrapping around the grid
            { x: 0, y: 0 },         
            { x: width, y: 0 },
            { x: -width, y: 0 },
            { x: 0, y: height },
            { x: 0, y: -height },
            { x: width, y: height },
            { x: width, y: -height },
            { x: -width, y: height },
            { x: -width, y: -height }
        ];				

        // Fetch all neighbours for each range
        for (const offset of offsets) {
            let range = { x:position.x+offset.x, y:position.y+offset.y, w:radius*2, h:radius*2 }
            neighbours.push(...qt.query(range))
        }
        
        // Filter neighbours to only include those within the circular radius (a bit quicker than slicing in for loop, i noticed)
        return neighbours.filter(neighbour => {
            let dx = neighbour.position.x - position.x
            let dy = neighbour.position.y - position.y
            // Adjust for wrapping in the x direction
            if (Math.abs(dx) > width/2) {
                dx = dx - Math.sign(dx) * width;
            }
        
            // Adjust for wrapping in the y direction
            if (Math.abs(dy) > height/2) {
                dy = dy - Math.sign(dy) * height;
            }
        
            return (dx*dx + dy*dy) <= (radius*radius);
        }); 
    }

    /** From a list of individuals, e.g. this.individuals, sample one weighted by a property. This is analogous
     *  to spinning a "roulette wheel". Also see a hard-coded versino of this in the "cheater" example
     *  @param {Array} individuals Array of individuals to sample from (e.g. living individuals in neighbourhood)
     *  @param {string} property The property used to weigh gps (e.g. fitness)
     *  @param {float} non Scales the probability of not returning any gp. 
     */
    rouletteWheel(individuals, property, non = 0.0) {
        let sum_property = non
        for (let i = 0; i < individuals.length; i++) sum_property += individuals[i][property]       // Now we have the sum of weight + a constant (non)
        let randomnr = this.rng.genrand_real1() * sum_property                // Sample a randomnr between 0 and sum_property        
        let cumsum = 0.0                                                    // This will keep track of the cumulative sum of weights
        for (let i = 0; i < individuals.length; i++) {
            cumsum += individuals[i][property]
            if (randomnr < cumsum) return individuals[i]
        }
        return
    }
    
    placeObstacle(config){
        let force = config.force == undefined ? 1 : config.force
        if(config.w) this.obstacles.push({type:'rectangle',x:config.x,y:config.y,w:config.w,h:config.h,fill:config.fill,force:force})
        if(config.r) this.obstacles.push({type:'circle',x:config.x,y:config.y,r:config.r,fill:config.fill,force:force})
    }
    /** Assign each individual a new random position in space. This simulated mixing,
     *  but does not guarantee a "well-mixed" system per se (interactions are still local)
     *  calculated based on neighbourhoods. 
     */
    perfectMix(){
        for(let boid of this.boids){
            boid.position.x = this.rng.genrand_real1() * this.width
            boid.position.y = this.rng.genrand_real1() * this.height
        }
        //return "Perfectly mixed the individuals"
    }

    shuffleBoids(){
        utility.shuffle(this.boids, this.rng)
    }

    /** 
     * Adds a dygraph-plot to your DOM (if the DOM is loaded)
     *  @param {Array} graph_labels Array of strings for the graph legend
     *  @param {Array} graph_values Array of floats to plot (here plotted over time)
     *  @param {Array} cols Array of colours to use for plotting
     *  @param {String} title Title of the plot
     *  @param {Object} opts dictionary-style list of opts to pass onto dygraphs
    */
    plotArray(graph_labels, graph_values, cols, title, opts) {
        if (typeof window == 'undefined') return
        if (!(title in this.graphs)) {
            cols = utility.parseColours(cols)
            graph_values.unshift(this.time)
            graph_labels.unshift("Time")
            this.graphs[title] = new Graph(graph_labels, graph_values, cols, title, opts)
        }
        else {
            if (this.time % this.graph_interval == 0) {
                graph_values.unshift(this.time)
                graph_labels.unshift("Time")
                this.graphs[title].push_data(graph_values)
            }
            if (this.time % this.graph_update == 0) {
                this.graphs[title].update()
            }
        }
    }

    /** 
     * Adds a dygraph-plot to your DOM (if the DOM is loaded)
     *  @param {Array} graph_values Array of floats to plot (here plotted over time)
     *  @param {String} title Title of the plot
     *  @param {Object} opts dictionary-style list of opts to pass onto dygraphs
    */
     plotPoints(graph_values, title, opts) {
        let graph_labels = Array.from({length: graph_values.length}, (v, i) => 'sample'+(i+1))
        let cols = Array.from({length: graph_values.length}, (v, i) => 'black')

        let seriesname = 'average'
        let sum = 0
        let num = 0
        // Get average of all defined values
        for(let n = 0; n< graph_values.length; n++){
            if(graph_values[n] !== undefined) {
                sum += graph_values[n]
                num++
            }
        }
        let avg = (sum / num) || 0;
        graph_values.unshift(avg)
        graph_labels.unshift(seriesname)
        cols.unshift("#666666")
        
        if(opts == undefined) opts = {}
        opts.drawPoints = true
        opts.strokeWidth = 0
        opts.pointSize = 1
        
        opts.series = {[seriesname]: {strokeWidth: 3.0, strokeColor:"green", drawPoints: false, pointSize: 0, highlightCircleSize: 3 }}
        if (typeof window == 'undefined') return
        if (!(title in this.graphs)) {
            cols = utility.parseColours(cols)
            graph_values.unshift(this.time)
            graph_labels.unshift("Time")
            this.graphs[title] = new Graph(graph_labels, graph_values, cols, title, opts)
        }
        else {
            if (this.time % this.graph_interval == 0) {
                graph_values.unshift(this.time)
                graph_labels.unshift("Time")
                this.graphs[title].push_data(graph_values)
            }
            if (this.time % this.graph_update == 0) {
                this.graphs[title].update()
            }
        }
    }


    /** 
     * Adds a dygraph-plot to your DOM (if the DOM is loaded)
     *  @param {Array} graph_labels Array of strings for the graph legend
     *  @param {Array} graph_values Array of 2 floats to plot (first value for x-axis, second value for y-axis)
     *  @param {Array} cols Array of colours to use for plotting
     *  @param {String} title Title of the plot
     *  @param {Object} opts dictionary-style list of opts to pass onto dygraphs
    */
    plotXY(graph_labels, graph_values, cols, title, opts) {
        if (typeof window == 'undefined') return
        if (!(title in this.graphs)) {
            cols = utility.parseColours(cols)
            this.graphs[title] = new Graph(graph_labels, graph_values, cols, title, opts)
        }
        else {
            if (this.time % this.graph_interval == 0) {
                this.graphs[title].push_data(graph_values)
            }
            if (this.time % this.graph_update == 0) {
                this.graphs[title].update()
            }
        }

    }

    /** 
     * Easy function to add a pop-sizes plot (wrapper for plotArrays)
     *  @param {String} property What property to plot (needs to exist in your model, e.g. "species" or "alive")
     *  @param {Array} values Which values are plotted (e.g. [1,3,4,6])     
    */
    plotPopsizes(property, values, opts) {
        if (typeof window == 'undefined') return
        if (this.time % this.graph_interval != 0 && this.graphs[`Population sizes (${this.name})`] !== undefined) return
        // Wrapper for plotXY function, which expects labels, values, colours, and a title for the plot:
        // Labels
        let graph_labels = []
        for (let val of values) { graph_labels.push(property + '_' + val) }

        // Values
        let popsizes = this.getPopsizes(property, values)
        let graph_values = popsizes

        // Colours
        let colours = []

        for (let c of values) {
            if (this.statecolours[property].constructor != Object)
                colours.push(this.statecolours[property])
            else
                colours.push(this.statecolours[property][c])
        }
        // Title
        let title = "Population sizes (" + this.name + ")"
        if(opts && opts.title) title = opts.title
        
        this.plotArray(graph_labels, graph_values, colours, title, opts)



        //this.graph = new Graph(graph_labels,graph_values,colours,"Population sizes ("+this.name+")")                            
    }

    drawSlide(canvasname,prefix="grid_") {
        let canvas = this.canvases[canvasname].elem // Grab the canvas element
        let timestamp = sim.time.toString()
        timestamp = timestamp.padStart(5, "0")
        canvas.toBlob(function(blob) 
        {
            saveAs(blob, prefix+timestamp+".png");
        });
    }

    resetPlots() {
        this.time = 0
        for (let g in this.graphs) {
            this.graphs[g].reset_plot()
        }
    }
}

export default Flockmodel

////////////////////////////////////////////////////////////////////////////////////////////////////
//  The functions below are not methods of grid-model as they are never unique for a particular model. 
////////////////////////////////////////////////////////////////////////////////////////////////////


/** 
 *  Make a grid, or when a template is given, a COPY of a grid. 
 *  @param {int} cols Width of the new grid
 *  @param {int} rows Height of the new grid
 *  @param {2DArray} template Template to be used for copying (if not set, a new empty grid is made)
*/
let MakeGrid = function(cols, rows, template) {
    let grid = new Array(rows);             // Makes a column or <rows> long --> grid[cols]
    for (let x = 0; x < cols; x++) {
        grid[x] = new Array(cols);          // Insert a row of <cols> long   --> grid[cols][rows]
        for (let y = 0; y < rows; y++) {
            if (template) grid[x][y] = new Gridpoint(template[x][y]);  // Make a deep or shallow copy of the GP 
            else grid[x][y] = new Gridpoint();
        }
    }

    return grid;
}

/** 
 *  Make a back-up of all the ODE states (for synchronous ODE updating)
 *  @param {int} cols Width of the grid
 *  @param {int} rows Height of the grid
 *  @param {2DArray} template Get ODE states from here
*/
let CopyGridODEs = function(cols, rows, template) {
    let grid = new Array(rows);             // Makes a column or <rows> long --> grid[cols]
    for (let x = 0; x < cols; x++) {
        grid[x] = new Array(cols);          // Insert a row of <cols> long   --> grid[cols][rows]
        for (let y = 0; y < rows; y++) {
            for (let o = 0; o < template[x][y].ODEs.length; o++) // every ode
            {
                grid[x][y] = []
                let states = []
                for (let s = 0; s < template[x][y].ODEs[o].state.length; s++) // every state
                    states.push(template[x][y].ODEs[o].state[s])
                grid[x][y][o] = states;
            }
        }
    }

    return grid;
}
