class Gridpoint 
{    
   constructor(template) 
    {        
        // This class only contains a copy-constructor, meaning that a new gridpoint will be made based on the passed template gridpoint
        // If no template is given, the object is empty (for initialisation, this is true)
        for (var prop in template) 
        {
            this[prop] = template[prop]             // Shallow copy. It's fast, but be careful with syncronous updating!
            // this[prop] = copy(template[prop])    // Deep copy. Takes much more time, but sometimes you may need this*** 
        }
    }
}

// *** = if you need syncronous updating with complex objects (for whatever reason), replace line 10 with
// It will slow things down, so in general it's better to use asyncronous updating so you won't have to
// make deep copies of the grid. 
function copy(aObject)
{
    if (!aObject) {
      return aObject;
    }
  
    let v;
    let bObject = Array.isArray(aObject) ? [] : {};
    for (const k in aObject) {
      v = aObject[k];
      bObject[k] = (typeof v === "object") ? copy(v) : v;
    }
  
    return bObject;
  }
  
export default Gridpoint