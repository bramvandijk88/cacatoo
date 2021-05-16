class ODE 
{    
   constructor(eq,state_vector,pars) 
    {        
        this.eq = eq
        this.state = state_vector
        this.pars = pars
        this.solver = new Solver(state_vector.length)
    }

    solve_timestep(delta_t=0.1)
    {
        let newstate = this.solver.solve(
                     this.eq(...this.pars),      // function to solve and its pars (... unlists the array as a list of args)
                     0,                          // Initial x value
                     this.state,                  // Initial y value(s)
                     delta_t                           // Final x value            
                     ).y
        this.state = newstate
    }

    print_state()
    {
        console.log(this.state)
    }
        
}

export default ODE