/**
*  The ODE class is used to call the odex.js library and numerically solve ODEs
*/

class ODE 
{    
    /**
    *  The constructor function for a @ODE object. 
    *  @param {function} eq Function that describes the ODE (see examples starting with ode)
    *  @param {Array} state_vector Initial state vector
    *  @param {Array} pars Array of parameters for the ODEs 
    *  @param {Array} diff_rates Array of rates at which each state diffuses to neighbouring grid point (Has to be less than 0.25!)
    *  @param {String} ode_name Name of this ODE
    */  
   constructor(eq,state_vector,pars,diff_rates,ode_name) 
    {        
        this.name = ode_name
        this.eq = eq
        this.state = state_vector
        this.diff_rates = diff_rates
        this.pars = pars
        this.solver = new Solver(state_vector.length)
    }
    /** 
     *  Numerically solve the ODE
     *  @param {float} delta_t Step size
     *  @param {bool} opt_pos When enabled, negative values are set to 0 automatically
    */ 
    solve_timestep(delta_t=0.1,pos=false)
    {
        let newstate = this.solver.solve(
                     this.eq(...this.pars),      // function to solve and its pars (... unlists the array as a list of args)
                     0,                          // Initial x value
                     this.state,                  // Initial y value(s)
                     delta_t                           // Final x value            
                     ).y
        if(pos) for (var i = 0; i < newstate.length; i++) if(newstate[i] < 0.000001) newstate[i] = 0.0
        this.state = newstate
    }
    /**
    * Prints the current state to the console
    */
    print_state()
    {
        console.log(this.state)
    }        
}

export default ODE