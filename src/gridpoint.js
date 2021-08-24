/**
*  Gridpoint is what Gridmodels are made of. Contains everything that may happen in 1 locality. 
*/

class Gridpoint {
  /**
  *  The constructor function for a @Gridpoint object. Takes an optional template to copy primitives from. (NOTE!! Other types of objects are NOT deep copied by default)
  *  If you need synchronous updating with complex objects (for whatever reason), replate line 18 with line 19. This will slow things down quite a bit, so ony use this
  *  if you really need it. A better option is to use asynchronous updating so you won't have to worry about this at all :)
  *  @param {Gridpoint} template Optional template to make a new @Gridpoint from
  */
  constructor(template) {
    for (var prop in template)
      this[prop] = template[prop]                  // Shallow copy. It's fast, but be careful with syncronous updating!
    // this[prop] = copy(template[prop])         // Deep copy. Takes much more time, and you'll likely end up copying much more than necessary. Use only if you're sure you need it!
  }
}

/**
 *  Deep copy function.
 *  @param {Object} aObject Object to be deep copied. This function still won't deep copy every possible object, so when enabling deep copying, make sure you put your debug-hat on!
 */
function copy(aObject) {
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