class Gridpoint 
{    
   constructor(template) 
    {        
        // This class only contains a copy-constructor, meaning that a new gridpoint will be made based on the passed template gridpoint
        // If no template is given, the object is empty (for initialisation, this is true)
        for (var prop in template) {
            this[prop] = template[prop]
        }
    }
}

export default Gridpoint