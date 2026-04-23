/** 
 *  Reverse dictionary 
 *  @param {Object} obj dictionary-style object to reverse in order 
*/
export function dict_reverse(obj) {
    let new_obj = {}
    let rev_obj = Object.keys(obj).reverse();
    rev_obj.forEach(function (i) {
        new_obj[i] = obj[i];
    })
    return new_obj;
}

/** 
 *  Randomly shuffle an array with custom RNG
 *  @param {Array} array array to be shuffled
 *  @param {MersenneTwister} rng MersenneTwister RNG
*/
export function shuffle(array, rng) {
    let i = array.length;
    while (i--) {
        const ri = Math.floor(rng.random() * (i + 1));
        [array[i], array[ri]] = [array[ri], array[i]];
    }
    return array;
}


/** 
 *  Convert colour string to RGB. Works for colour names ('red','blue' or other colours defined in cacatoo), but also for hexadecimal strings
 *  @param {String} string string to convert to RGB
*/
export function stringToRGB(string) {
    if (string[0] != '#') return nameToRGB(string)
    else return hexToRGB(string)
}

/** 
 *  Convert hexadecimal to RGB
 *  @param {String} hex string to convert to RGB
*/
export function hexToRGB(hex) {
    var result
    if(hex.length == 7) {
        result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    }
    if(hex.length == 9) {
        result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16), parseInt(result[4], 16)]
    }
    
}

/** 
 *  Convert colour name to RGB
 *  @param {String} name string to look up in the set of known colours (see below)
*/
export function nameToRGB(string) {
    let colours = {
        'black': [0, 0, 0],
        'white': [255, 255, 255],
        'red': [255, 0, 0],
        'blue': [0, 0, 255],
        'green': [0, 255, 0],
        'darkgrey': [40, 40, 40],
        'lightgrey': [180, 180, 180],
        'violet': [148, 0, 211],
        'turquoise': [64, 224, 208],
        'orange': [255, 165, 0],
        'gold': [240, 200, 0],
        'grey': [125, 125, 125],
        'yellow': [255, 255, 0],
        'cyan': [0, 255, 255],
        'aqua': [0, 255, 255],
        'silver': [192, 192, 192],
        'nearwhite': [192, 192, 192],
        'purple': [128, 0, 128],
        'darkgreen': [0, 128, 0],
        'olive': [128, 128, 0],
        'teal': [0, 128, 128],
        'navy': [0, 0, 128]

    }
    let c = colours[string]
    if (c == undefined) throw new Error(`Cacatoo has no colour with name '${string}'`)
    return c
}

/** 
 *  Make sure all colours, even when of different types, are stored in the same format (RGB, as cacatoo uses internally)
 *  @param {Array} cols array of strings, or [R,G,B]-arrays. Only strings are converted, other returned. 
*/

export function parseColours(cols) {
    let return_cols = []
    for (let c of cols) {
        if (typeof c === 'string' || c instanceof String) {
            return_cols.push(stringToRGB(c))
        }
        else {
            return_cols.push(c)
        }
    }
    return return_cols
}

/** 
 *  Compile a dict of default colours if nothing is given by the user. Reuses colours if more colours are needed. 
*/
export function default_colours(num_colours)
{
    let colour_dict = [
        [0, 0, 0],            // black
        [255, 255, 255],      // white
        [255, 0, 0],          // red
        [0, 0, 255],          // blue
        [0, 255, 0],          //green      
        [60, 60, 60],         //darkgrey    
        [180, 180, 180],      //lightgrey   
        [148, 0, 211],      //violet      
        [64, 224, 208],     //turquoise   
        [255, 165, 0],      //orange       
        [240, 200, 0],       //gold       
        [125, 125, 125],
        [255, 255, 0], // yellow
        [0, 255, 255], // cyan
        [192, 192, 192], // silver
        [0, 128, 0], //darkgreen
        [128, 128, 0], // olive
        [0, 128, 128], // teal
        [0, 0, 128]] // navy

    let return_dict = {}
    for(let i = 0; i < num_colours; i++)
    {
        return_dict[i] = colour_dict[i%19]
    }
    return return_dict
}


/** 
 *  A list of default colours if nothing is given by the user. 
*/
export function random_colours(num_colours,rng)
{
    let return_dict = {}
    return_dict[0] = [0,0,0]
    for(let i = 1; i < num_colours; i++)
    {
        return_dict[i] = [rng.genrand_int(0,255),rng.genrand_int(0,255),rng.genrand_int(0,255)]
    }
    return return_dict
}

/**
 *  Deep copy function.
 *  @param {Object} aObject Object to be deep copied. This function still won't deep copy every possible object, so when enabling deep copying, make sure you put your debug-hat on!
 */
export function copy(aObject) {
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

  


// ============================================================================
// FFT-based convolution utilities for Cacatoo
// ----------------------------------------------------------------------------
// Append this entire block to the bottom of src/utility.js
//
// Works in both browser (ES module via Rollup) and Node.js (CommonJS).
//
// Public API:
//   makeGaussianKernel(sigma)                           → { data, size }
//   makeDiskKernel(radius)                              → { data, size }
//   applyKernelFFT(gm, readProp, writeProp, kernel, scale)
//   makeGaussianKernel1D(sigma)                         → { data1d, size }
//   diffuseStateGPU(gridmodel, state, kernel1dObj)      (browser only)
//
// GridModel methods added in gridmodel.js:
//   this.diffuseStatesFFT(state, sigma, kernel)
//   this.castDiskFFT(sourceState, sourceValue, targetState, amount, kernel, radius)
//   this.diffuseStateGPU(state, sigma, kernel1d)
//
// The FFT engine is inlined from fft.js v4.0.3 by Fedor Indutny (MIT licence)
// https://github.com/indutny/fft.js — no extra runtime dependency.
// ============================================================================

// ── Inlined FFT engine (fft.js v4.0.3) ───────────────────────────────────────
function FFT(size) {
  this.size = size | 0;
  if (this.size <= 1 || (this.size & (this.size - 1)) !== 0)
    throw new Error('FFT size must be a power of two and bigger than 1');

  this._csize = size << 1;

  // NOTE: Use of `var` is intentional for old V8 versions
  var table = new Array(this.size * 2);
  for (var i = 0; i < table.length; i += 2) {
    const angle = Math.PI * i / this.size;
    table[i] = Math.cos(angle);
    table[i + 1] = -Math.sin(angle);
  }
  this.table = table;

  // Find size's power of two
  var power = 0;
  for (var t = 1; this.size > t; t <<= 1)
    power++;

  // Calculate initial step's width:
  //   * If we are full radix-4 - it is 2x smaller to give inital len=8
  //   * Otherwise it is the same as `power` to give len=4
  this._width = power % 2 === 0 ? power - 1 : power;

  // Pre-compute bit-reversal patterns
  this._bitrev = new Array(1 << this._width);
  for (var j = 0; j < this._bitrev.length; j++) {
    this._bitrev[j] = 0;
    for (var shift = 0; shift < this._width; shift += 2) {
      var revShift = this._width - shift - 2;
      this._bitrev[j] |= ((j >>> shift) & 3) << revShift;
    }
  }

  this._out = null;
  this._data = null;
  this._inv = 0;
}


FFT.prototype.fromComplexArray = function fromComplexArray(complex, storage) {
  var res = storage || new Array(complex.length >>> 1);
  for (var i = 0; i < complex.length; i += 2)
    res[i >>> 1] = complex[i];
  return res;
};

FFT.prototype.createComplexArray = function createComplexArray() {
  const res = new Array(this._csize);
  for (var i = 0; i < res.length; i++)
    res[i] = 0;
  return res;
};

FFT.prototype.toComplexArray = function toComplexArray(input, storage) {
  var res = storage || this.createComplexArray();
  for (var i = 0; i < res.length; i += 2) {
    res[i] = input[i >>> 1];
    res[i + 1] = 0;
  }
  return res;
};

FFT.prototype.completeSpectrum = function completeSpectrum(spectrum) {
  var size = this._csize;
  var half = size >>> 1;
  for (var i = 2; i < half; i += 2) {
    spectrum[size - i] = spectrum[i];
    spectrum[size - i + 1] = -spectrum[i + 1];
  }
};

FFT.prototype.transform = function transform(out, data) {
  if (out === data)
    throw new Error('Input and output buffers must be different');

  this._out = out;
  this._data = data;
  this._inv = 0;
  this._transform4();
  this._out = null;
  this._data = null;
};

FFT.prototype.realTransform = function realTransform(out, data) {
  if (out === data)
    throw new Error('Input and output buffers must be different');

  this._out = out;
  this._data = data;
  this._inv = 0;
  this._realTransform4();
  this._out = null;
  this._data = null;
};

FFT.prototype.inverseTransform = function inverseTransform(out, data) {
  if (out === data)
    throw new Error('Input and output buffers must be different');

  this._out = out;
  this._data = data;
  this._inv = 1;
  this._transform4();
  for (var i = 0; i < out.length; i++)
    out[i] /= this.size;
  this._out = null;
  this._data = null;
};

// radix-4 implementation
//
// NOTE: Uses of `var` are intentional for older V8 version that do not
// support both `let compound assignments` and `const phi`
FFT.prototype._transform4 = function _transform4() {
  var out = this._out;
  var size = this._csize;

  // Initial step (permute and transform)
  var width = this._width;
  var step = 1 << width;
  var len = (size / step) << 1;

  var outOff;
  var t;
  var bitrev = this._bitrev;
  if (len === 4) {
    for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
      const off = bitrev[t];
      this._singleTransform2(outOff, off, step);
    }
  } else {
    // len === 8
    for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
      const off = bitrev[t];
      this._singleTransform4(outOff, off, step);
    }
  }

  // Loop through steps in decreasing order
  var inv = this._inv ? -1 : 1;
  var table = this.table;
  for (step >>= 2; step >= 2; step >>= 2) {
    len = (size / step) << 1;
    var quarterLen = len >>> 2;

    // Loop through offsets in the data
    for (outOff = 0; outOff < size; outOff += len) {
      // Full case
      var limit = outOff + quarterLen;
      for (var i = outOff, k = 0; i < limit; i += 2, k += step) {
        const A = i;
        const B = A + quarterLen;
        const C = B + quarterLen;
        const D = C + quarterLen;

        // Original values
        const Ar = out[A];
        const Ai = out[A + 1];
        const Br = out[B];
        const Bi = out[B + 1];
        const Cr = out[C];
        const Ci = out[C + 1];
        const Dr = out[D];
        const Di = out[D + 1];

        // Middle values
        const MAr = Ar;
        const MAi = Ai;

        const tableBr = table[k];
        const tableBi = inv * table[k + 1];
        const MBr = Br * tableBr - Bi * tableBi;
        const MBi = Br * tableBi + Bi * tableBr;

        const tableCr = table[2 * k];
        const tableCi = inv * table[2 * k + 1];
        const MCr = Cr * tableCr - Ci * tableCi;
        const MCi = Cr * tableCi + Ci * tableCr;

        const tableDr = table[3 * k];
        const tableDi = inv * table[3 * k + 1];
        const MDr = Dr * tableDr - Di * tableDi;
        const MDi = Dr * tableDi + Di * tableDr;

        // Pre-Final values
        const T0r = MAr + MCr;
        const T0i = MAi + MCi;
        const T1r = MAr - MCr;
        const T1i = MAi - MCi;
        const T2r = MBr + MDr;
        const T2i = MBi + MDi;
        const T3r = inv * (MBr - MDr);
        const T3i = inv * (MBi - MDi);

        // Final values
        const FAr = T0r + T2r;
        const FAi = T0i + T2i;

        const FCr = T0r - T2r;
        const FCi = T0i - T2i;

        const FBr = T1r + T3i;
        const FBi = T1i - T3r;

        const FDr = T1r - T3i;
        const FDi = T1i + T3r;

        out[A] = FAr;
        out[A + 1] = FAi;
        out[B] = FBr;
        out[B + 1] = FBi;
        out[C] = FCr;
        out[C + 1] = FCi;
        out[D] = FDr;
        out[D + 1] = FDi;
      }
    }
  }
};

// radix-2 implementation
//
// NOTE: Only called for len=4
FFT.prototype._singleTransform2 = function _singleTransform2(outOff, off,
                                                             step) {
  const out = this._out;
  const data = this._data;

  const evenR = data[off];
  const evenI = data[off + 1];
  const oddR = data[off + step];
  const oddI = data[off + step + 1];

  const leftR = evenR + oddR;
  const leftI = evenI + oddI;
  const rightR = evenR - oddR;
  const rightI = evenI - oddI;

  out[outOff] = leftR;
  out[outOff + 1] = leftI;
  out[outOff + 2] = rightR;
  out[outOff + 3] = rightI;
};

// radix-4
//
// NOTE: Only called for len=8
FFT.prototype._singleTransform4 = function _singleTransform4(outOff, off,
                                                             step) {
  const out = this._out;
  const data = this._data;
  const inv = this._inv ? -1 : 1;
  const step2 = step * 2;
  const step3 = step * 3;

  // Original values
  const Ar = data[off];
  const Ai = data[off + 1];
  const Br = data[off + step];
  const Bi = data[off + step + 1];
  const Cr = data[off + step2];
  const Ci = data[off + step2 + 1];
  const Dr = data[off + step3];
  const Di = data[off + step3 + 1];

  // Pre-Final values
  const T0r = Ar + Cr;
  const T0i = Ai + Ci;
  const T1r = Ar - Cr;
  const T1i = Ai - Ci;
  const T2r = Br + Dr;
  const T2i = Bi + Di;
  const T3r = inv * (Br - Dr);
  const T3i = inv * (Bi - Di);

  // Final values
  const FAr = T0r + T2r;
  const FAi = T0i + T2i;

  const FBr = T1r + T3i;
  const FBi = T1i - T3r;

  const FCr = T0r - T2r;
  const FCi = T0i - T2i;

  const FDr = T1r - T3i;
  const FDi = T1i + T3r;

  out[outOff] = FAr;
  out[outOff + 1] = FAi;
  out[outOff + 2] = FBr;
  out[outOff + 3] = FBi;
  out[outOff + 4] = FCr;
  out[outOff + 5] = FCi;
  out[outOff + 6] = FDr;
  out[outOff + 7] = FDi;
};

// Real input radix-4 implementation
FFT.prototype._realTransform4 = function _realTransform4() {
  var out = this._out;
  var size = this._csize;

  // Initial step (permute and transform)
  var width = this._width;
  var step = 1 << width;
  var len = (size / step) << 1;

  var outOff;
  var t;
  var bitrev = this._bitrev;
  if (len === 4) {
    for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
      const off = bitrev[t];
      this._singleRealTransform2(outOff, off >>> 1, step >>> 1);
    }
  } else {
    // len === 8
    for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
      const off = bitrev[t];
      this._singleRealTransform4(outOff, off >>> 1, step >>> 1);
    }
  }

  // Loop through steps in decreasing order
  var inv = this._inv ? -1 : 1;
  var table = this.table;
  for (step >>= 2; step >= 2; step >>= 2) {
    len = (size / step) << 1;
    var halfLen = len >>> 1;
    var quarterLen = halfLen >>> 1;
    var hquarterLen = quarterLen >>> 1;

    // Loop through offsets in the data
    for (outOff = 0; outOff < size; outOff += len) {
      for (var i = 0, k = 0; i <= hquarterLen; i += 2, k += step) {
        var A = outOff + i;
        var B = A + quarterLen;
        var C = B + quarterLen;
        var D = C + quarterLen;

        // Original values
        var Ar = out[A];
        var Ai = out[A + 1];
        var Br = out[B];
        var Bi = out[B + 1];
        var Cr = out[C];
        var Ci = out[C + 1];
        var Dr = out[D];
        var Di = out[D + 1];

        // Middle values
        var MAr = Ar;
        var MAi = Ai;

        var tableBr = table[k];
        var tableBi = inv * table[k + 1];
        var MBr = Br * tableBr - Bi * tableBi;
        var MBi = Br * tableBi + Bi * tableBr;

        var tableCr = table[2 * k];
        var tableCi = inv * table[2 * k + 1];
        var MCr = Cr * tableCr - Ci * tableCi;
        var MCi = Cr * tableCi + Ci * tableCr;

        var tableDr = table[3 * k];
        var tableDi = inv * table[3 * k + 1];
        var MDr = Dr * tableDr - Di * tableDi;
        var MDi = Dr * tableDi + Di * tableDr;

        // Pre-Final values
        var T0r = MAr + MCr;
        var T0i = MAi + MCi;
        var T1r = MAr - MCr;
        var T1i = MAi - MCi;
        var T2r = MBr + MDr;
        var T2i = MBi + MDi;
        var T3r = inv * (MBr - MDr);
        var T3i = inv * (MBi - MDi);

        // Final values
        var FAr = T0r + T2r;
        var FAi = T0i + T2i;

        var FBr = T1r + T3i;
        var FBi = T1i - T3r;

        out[A] = FAr;
        out[A + 1] = FAi;
        out[B] = FBr;
        out[B + 1] = FBi;

        // Output final middle point
        if (i === 0) {
          var FCr = T0r - T2r;
          var FCi = T0i - T2i;
          out[C] = FCr;
          out[C + 1] = FCi;
          continue;
        }

        // Do not overwrite ourselves
        if (i === hquarterLen)
          continue;

        // In the flipped case:
        // MAi = -MAi
        // MBr=-MBi, MBi=-MBr
        // MCr=-MCr
        // MDr=MDi, MDi=MDr
        var ST0r = T1r;
        var ST0i = -T1i;
        var ST1r = T0r;
        var ST1i = -T0i;
        var ST2r = -inv * T3i;
        var ST2i = -inv * T3r;
        var ST3r = -inv * T2i;
        var ST3i = -inv * T2r;

        var SFAr = ST0r + ST2r;
        var SFAi = ST0i + ST2i;

        var SFBr = ST1r + ST3i;
        var SFBi = ST1i - ST3r;

        var SA = outOff + quarterLen - i;
        var SB = outOff + halfLen - i;

        out[SA] = SFAr;
        out[SA + 1] = SFAi;
        out[SB] = SFBr;
        out[SB + 1] = SFBi;
      }
    }
  }
};

// radix-2 implementation
//
// NOTE: Only called for len=4
FFT.prototype._singleRealTransform2 = function _singleRealTransform2(outOff,
                                                                     off,
                                                                     step) {
  const out = this._out;
  const data = this._data;

  const evenR = data[off];
  const oddR = data[off + step];

  const leftR = evenR + oddR;
  const rightR = evenR - oddR;

  out[outOff] = leftR;
  out[outOff + 1] = 0;
  out[outOff + 2] = rightR;
  out[outOff + 3] = 0;
};

// radix-4
//
// NOTE: Only called for len=8
FFT.prototype._singleRealTransform4 = function _singleRealTransform4(outOff,
                                                                     off,
                                                                     step) {
  const out = this._out;
  const data = this._data;
  const inv = this._inv ? -1 : 1;
  const step2 = step * 2;
  const step3 = step * 3;

  // Original values
  const Ar = data[off];
  const Br = data[off + step];
  const Cr = data[off + step2];
  const Dr = data[off + step3];

  // Pre-Final values
  const T0r = Ar + Cr;
  const T1r = Ar - Cr;
  const T2r = Br + Dr;
  const T3r = inv * (Br - Dr);

  // Final values
  const FAr = T0r + T2r;

  const FBr = T1r;
  const FBi = -T3r;

  const FCr = T0r - T2r;

  const FDr = T1r;
  const FDi = T3r;

  out[outOff] = FAr;
  out[outOff + 1] = 0;
  out[outOff + 2] = FBr;
  out[outOff + 3] = FBi;
  out[outOff + 4] = FCr;
  out[outOff + 5] = 0;
  out[outOff + 6] = FDr;
  out[outOff + 7] = FDi;
};


// ═══════════════════════════════════════════════════════════
// GRIDMODEL (minimal Cacatoo-style)
// ═══════════════════════════════════════════════════════════


// ════════════════════════════════════════════════════════════════
// GRIDMODEL
// ════════════════════════════════════════════════════════════════
class GridModel {
  constructor(nc, nr) {
    this.nc = nc; this.nr = nr;
    this.grid = [];
    for (let c = 0; c < nc; c++) {
      this.grid[c] = [];
      for (let r = 0; r < nr; r++) this.grid[c][r] = { density: 0 };
    }
  }
}

// ════════════════════════════════════════════════════════════════
// CPU FFT CONVOLUTION
// ════════════════════════════════════════════════════════════════

// ── Internal helpers ──────────────────────────────────────────────────────────

function nextPow2(n) { let p = 1; while (p < n) p <<= 1; return p }

/** Forward 2-D FFT of a flat real array (nrows×ncols), zero-padded to padR×padC. */
function _fft2d(realFlat, nrows, ncols, padR, padC) {
    const fR = new FFT(padR), fC = new FFT(padC)
    const mid = new Float64Array(padR * padC * 2)
    const rowReal = new Float64Array(padC), rowCpx = fC.createComplexArray()
    for (let r = 0; r < padR; r++) {
        rowReal.fill(0)
        if (r < nrows) for (let c = 0; c < ncols; c++) rowReal[c] = realFlat[r * ncols + c]
        fC.realTransform(rowCpx, rowReal); fC.completeSpectrum(rowCpx)
        for (let c = 0; c < padC; c++) {
            mid[(r*padC+c)*2]   = rowCpx[c*2]
            mid[(r*padC+c)*2+1] = rowCpx[c*2+1]
        }
    }
    const colIn = fR.createComplexArray(), colOut = fR.createComplexArray()
    const freq = new Float64Array(padR * padC * 2)
    for (let c = 0; c < padC; c++) {
        for (let r = 0; r < padR; r++) {
            colIn[r*2]   = mid[(r*padC+c)*2]
            colIn[r*2+1] = mid[(r*padC+c)*2+1]
        }
        fR.transform(colOut, colIn)
        for (let r = 0; r < padR; r++) {
            freq[(r*padC+c)*2]   = colOut[r*2]
            freq[(r*padC+c)*2+1] = colOut[r*2+1]
        }
    }
    return { freq, fR, fC }
}

/** Inverse 2-D FFT. Each 1-D pass normalises by its own size, giving 1/(padR*padC) total. */
function _ifft2d(freq, padR, padC, fR, fC) {
    const mid = new Float64Array(padR * padC * 2)
    const colIn = fR.createComplexArray(), colOut = fR.createComplexArray()
    for (let c = 0; c < padC; c++) {
        for (let r = 0; r < padR; r++) {
            colIn[r*2]   = freq[(r*padC+c)*2]
            colIn[r*2+1] = freq[(r*padC+c)*2+1]
        }
        fR.inverseTransform(colOut, colIn)
        for (let r = 0; r < padR; r++) {
            mid[(r*padC+c)*2]   = colOut[r*2]
            mid[(r*padC+c)*2+1] = colOut[r*2+1]
        }
    }
    const rowIn = fC.createComplexArray(), rowOut = fC.createComplexArray()
    const out = new Float64Array(padR * padC)
    for (let r = 0; r < padR; r++) {
        for (let c = 0; c < padC; c++) {
            rowIn[c*2]   = mid[(r*padC+c)*2]
            rowIn[c*2+1] = mid[(r*padC+c)*2+1]
        }
        fC.inverseTransform(rowOut, rowIn)
        for (let c = 0; c < padC; c++) out[r*padC+c] = rowOut[c*2]
    }
    return out
}

// ── GPU helpers (browser only) ────────────────────────────────────────────────

const _GPU_VS = `#version 300 es
in vec2 a_pos; out vec2 v_uv;
void main() { v_uv = a_pos * 0.5 + 0.5; gl_Position = vec4(a_pos, 0.0, 1.0); }`

const _GPU_FS = `#version 300 es
precision highp float;
uniform sampler2D u_tex; uniform vec2 u_dir;
uniform float u_kernel[128]; uniform int u_ksize;
in vec2 v_uv; out vec4 outColor;
void main() {
    vec2 texel = 1.0 / vec2(textureSize(u_tex, 0));
    int half_k = u_ksize / 2; float sum = 0.0;
    for (int i = 0; i < u_ksize; i++) {
        float offset = float(i - half_k);
        sum += texture(u_tex, v_uv + u_dir * texel * offset).r * u_kernel[i];
    }
    outColor = vec4(sum, 0.0, 0.0, 1.0);
}`

function _compileShader(gl, type, src) {
    const s = gl.createShader(type)
    gl.shaderSource(s, src); gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        throw new Error('Cacatoo GPU shader: ' + gl.getShaderInfoLog(s))
    return s
}

function _makeGPUFBO(gl, w, h) {
    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, w, h, 0, gl.RED, gl.FLOAT, null)
    const fbo = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    return { tex, fbo }
}

/**
 * Lazily initialise (or return cached) GPU state on a gridmodel.
 * Returns the state object, or null if WebGL2 / float textures unavailable.
 * Rebuilds FBOs automatically if the grid is resized.
 */
function _getGPUState(gridmodel) {
    const nc = gridmodel.nc, nr = gridmodel.nr
    if (typeof document === 'undefined') {
        console.warn('[Cacatoo] diffuseStatesGPU: WebGL2 requires a browser environment.')
        return null
    }
    if (gridmodel._gpuState) {
        const s = gridmodel._gpuState
        if (s === null) return null   // previously failed, don't retry
        if (s.nc === nc && s.nr === nr) return s
        // Grid resized — rebuild FBOs only
        s.fboSrc = _makeGPUFBO(s.gl, nc, nr)
        s.fboTmp = _makeGPUFBO(s.gl, nc, nr)
        s.fboDst = _makeGPUFBO(s.gl, nc, nr)
        s.readBuf = new Float32Array(nr * nc)
        s.nc = nc; s.nr = nr
        return s
    }
    const canvas = document.createElement('canvas')
    canvas.width = nc; canvas.height = nr
    const gl = canvas.getContext('webgl2')
    if (!gl) {
        console.warn('[Cacatoo] diffuseStatesGPU: WebGL2 not available.')
        gridmodel._gpuState = null; return null
    }
    if (!gl.getExtension('EXT_color_buffer_float')) {
        console.warn('[Cacatoo] diffuseStatesGPU: EXT_color_buffer_float not supported.')
        gridmodel._gpuState = null; return null
    }
    const prog = gl.createProgram()
    gl.attachShader(prog, _compileShader(gl, gl.VERTEX_SHADER,   _GPU_VS))
    gl.attachShader(prog, _compileShader(gl, gl.FRAGMENT_SHADER, _GPU_FS))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
        throw new Error('Cacatoo GPU link: ' + gl.getProgramInfoLog(prog))
    const vbuf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)
    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)
    const aPos = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)
    gl.bindVertexArray(null)
    const state = {
        gl, prog, vao, nc, nr,
        uTex:    gl.getUniformLocation(prog, 'u_tex'),
        uDir:    gl.getUniformLocation(prog, 'u_dir'),
        uKernel: gl.getUniformLocation(prog, 'u_kernel'),
        uKsize:  gl.getUniformLocation(prog, 'u_ksize'),
        fboSrc:  _makeGPUFBO(gl, nc, nr),
        fboTmp:  _makeGPUFBO(gl, nc, nr),
        fboDst:  _makeGPUFBO(gl, nc, nr),
        readBuf: new Float32Array(nr * nc),
        kPad:    new Float32Array(128),
    }
    gridmodel._gpuState = state
    return state
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Build a normalised 2-D Gaussian kernel for use with diffuseStatesFFT.
 * Size is auto-chosen to cover ±3σ (always odd). Values sum to 1.0.
 *
 * One call equals running ∂ρ/∂t = D_x ∂²ρ/∂x² + D_y ∂²ρ/∂y²
 * for one step, where D_x = sigma_x²/2, D_y = sigma_y²/2.
 * Pass only sigma_x for isotropic diffusion (sigma_y defaults to sigma_x).
 *
 * @param {number} sigma_x  Spread in x (columns). Also used for y if sigma_y omitted.
 * @param {number} [sigma_y] Spread in y (rows). Omit for symmetric diffusion.
 * @returns {{ data: Float64Array, size: number }}
 */
export function makeGaussianKernel(sigma_x, sigma_y) {
    if (sigma_y === undefined) sigma_y = sigma_x   // symmetric by default
    const reach_x = Math.ceil(3 * sigma_x)
    const reach_y = Math.ceil(3 * sigma_y)
    let size = 2 * Math.max(reach_x, reach_y) + 1
    if (size < 3) size = 3
    if (size % 2 === 0) size++
    const half     = (size - 1) / 2
    const inv2sx2  = 1 / (2 * sigma_x * sigma_x)
    const inv2sy2  = 1 / (2 * sigma_y * sigma_y)
    const data = new Float64Array(size * size)
    let sum = 0
    for (let r = 0; r < size; r++)
        for (let c = 0; c < size; c++) {
            const v = Math.exp(-((c-half)**2) * inv2sx2 - ((r-half)**2) * inv2sy2)
            data[r*size+c] = v; sum += v
        }
    for (let i = 0; i < data.length; i++) data[i] /= sum
    return { data, size }
}

/**
 * Build a flat disk (top-hat) kernel for use with castDiskFFT.
 * Cells within radius get value 1, cells outside get 0. NOT normalised.
 *
 * This means castDiskFFT deposits exactly `amount` at EACH cell within the
 * disk around each source — not `amount` spread across the disk area.
 * That matches the typical biological interpretation: every cell within
 * range receives the full benefit from a nearby source cell.
 *
 * @param {number} radius  Disk radius in grid cells
 * @returns {{ data: Float64Array, size: number }}
 */
export function makeDiskKernel(radius) {
    const size = 2 * Math.ceil(radius) + 1
    const half = (size - 1) / 2
    const data = new Float64Array(size * size)
    for (let r = 0; r < size; r++)
        for (let c = 0; c < size; c++) {
            const dr = r-half, dc = c-half
            if (dr*dr + dc*dc <= radius*radius) data[r*size+c] = 1
        }
    return { data, size }
}

/**
 * Build a normalised 1-D Gaussian kernel for use with diffuseStatesGPU.
 * The GPU path is separable, so it needs a 1-D kernel.
 *
 * @param {number} sigma  Standard deviation in grid cells
 * @returns {{ data1d: Float32Array, size: number }}
 */
export function makeGaussianKernel1D(sigma) {
    let size = Math.ceil(6 * sigma) | 1
    if (size < 3) size = 3
    if (size % 2 === 0) size++
    if (size > 128) {
        console.warn(`[makeGaussianKernel1D] sigma=${sigma} → size=${size} exceeds GPU max of 128. Clamping.`)
        size = 127  // force odd and ≤ 128
    }
    const half = (size - 1) / 2
    const data1d = new Float32Array(size)
    let sum = 0
    for (let i = 0; i < size; i++) {
        const d = i - half
        data1d[i] = Math.exp(-(d*d) / (2*sigma*sigma))
        sum += data1d[i]
    }
    for (let i = 0; i < size; i++) data1d[i] /= sum
    return { data1d, size }
}

/**
 * Apply a 2-D FFT convolution to one numeric state of every gridpoint.
 * Reads from readProp, writes to writeProp (may be the same property).
 * Low-level engine used by diffuseStatesFFT and castDiskFFT.
 *
 * Works in both browser and Node.js.
 *
 * @param {object} gridmodel
 * @param {string} readProp
 * @param {string} writeProp
 * @param {{ data: Float64Array, size: number }} kernelObj
 * @param {number} [scale=1]
 */
export function applyKernelFFT(gridmodel, readProp, writeProp, kernelObj, scale = 1) {
    const { nc, nr } = gridmodel
    const { data: kdata, size: ksize } = kernelObj

    // Use circular convolution when the grid wraps in both directions.
    // Circular: pad to next-pow-2 of grid size; kernel centred at (0,0) with
    // negative lags wrapped to the far end — signal that diffuses off one edge
    // reappears on the other, matching Cacatoo's toroidal boundary.
    // Linear: pad to grid+kernel-1; signal absorbed at boundaries.
    const circular = gridmodel.wrap && gridmodel.wrap[0] && gridmodel.wrap[1]

    let padR, padC, kernFlat

    if (circular) {
        padR = nextPow2(nr)
        padC = nextPow2(nc)
        if (ksize > Math.min(nc, nr) / 2)
            console.warn(`[applyKernelFFT] Kernel (${ksize}x${ksize}) is larger than half the grid — it will wrap onto itself.`)

        // Place kernel centred at (0,0), wrapping negative lags to far end
        const half = Math.floor(ksize / 2)
        kernFlat = new Float64Array(padR * padC)
        for (let r = 0; r < ksize; r++)
            for (let c = 0; c < ksize; c++) {
                const pr = (r - half + padR) % padR
                const pc = (c - half + padC) % padC
                kernFlat[pr * padC + pc] = kdata[r * ksize + c]
            }
    } else {
        padR = nextPow2(nr + ksize - 1)
        padC = nextPow2(nc + ksize - 1)
        if (ksize > Math.min(nc, nr) / 2)
            console.warn(`[applyKernelFFT] Kernel (${ksize}x${ksize}) is large relative to grid (${nc}x${nr}) — edge artefacts likely.`)

        // Place kernel at top-left (0,0), zero-padded
        kernFlat = new Float64Array(padR * padC)
        for (let r = 0; r < ksize; r++)
            for (let c = 0; c < ksize; c++)
                kernFlat[r * padC + c] = kdata[r * ksize + c]
    }

    // Extract signal from grid.
    // Circular: tile periodically to fill padded buffer so the FFT sees a
    // truly periodic signal — required for correct toroidal wrap-around.
    // Linear: zero-pad (signal outside grid = 0).
    const signal = new Float64Array(padR * padC)
    if (circular) {
        for (let r = 0; r < padR; r++)
            for (let c = 0; c < padC; c++)
                signal[r*padC+c] = gridmodel.grid[c % nc][r % nr][readProp] || 0
    } else {
        for (let r = 0; r < nr; r++)
            for (let c = 0; c < nc; c++)
                signal[r*padC+c] = gridmodel.grid[c][r][readProp] || 0
    }

    const { freq: sf, fR, fC } = _fft2d(signal,   padR, padC, padR, padC)
    const { freq: kf }         = _fft2d(kernFlat, padR, padC, padR, padC)

    const prod = new Float64Array(padR * padC * 2)
    for (let i = 0; i < padR * padC; i++) {
        const sr=sf[i*2], si=sf[i*2+1], kr=kf[i*2], ki=kf[i*2+1]
        prod[i*2]   = sr*kr - si*ki
        prod[i*2+1] = sr*ki + si*kr
    }

    const flat = _ifft2d(prod, padR, padC, fR, fC)

    if (circular) {
        // Output is already aligned — just crop top-left nc x nr block
        for (let r = 0; r < nr; r++)
            for (let c = 0; c < nc; c++)
                gridmodel.grid[c][r][writeProp] = flat[r*padC + c] * scale
    } else {
        // Crop with "same" offset: kernel was at (0,0), valid output starts at (off,off)
        const off = Math.floor(ksize / 2)
        for (let r = 0; r < nr; r++)
            for (let c = 0; c < nc; c++)
                gridmodel.grid[c][r][writeProp] = flat[(r+off)*padC + (c+off)] * scale
    }
}

/**
 * Diffuse a continuous state using GPU (WebGL2) separable Gaussian convolution.
 * Two fragment shader passes (H then V). Faster than FFT for large grids.
 *
 * Browser only — silently falls back to a console warning in Node.
 * GPU context and shaders are lazily created and cached on the gridmodel.
 *
 * @param {object} gridmodel
 * @param {string} state
 * @param {{ data1d: Float32Array, size: number }} kernel1dObj  from makeGaussianKernel1D
 */
export function diffuseStatesGPU(gridmodel, state, kernel1dObj) {
    const s = _getGPUState(gridmodel)
    if (!s) return

    const { gl, prog, vao, nc, nr,
            uTex, uDir, uKernel, uKsize,
            fboSrc, fboTmp, fboDst, readBuf, kPad } = s
    const { data1d, size: ksize } = kernel1dObj

    if (ksize > 128)
        throw new Error(`diffuseStatesGPU: kernel size ${ksize} > 128 max. Use a smaller sigma.`)

    // Pack grid → flat Float32 → GPU texture
    const flat = new Float32Array(nr * nc)
    for (let r = 0; r < nr; r++)
        for (let c = 0; c < nc; c++)
            flat[r*nc+c] = gridmodel.grid[c][r][state] || 0

    gl.bindTexture(gl.TEXTURE_2D, fboSrc.tex)
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, nc, nr, gl.RED, gl.FLOAT, flat)

    // Upload kernel
    kPad.fill(0)
    for (let i = 0; i < ksize; i++) kPad[i] = data1d[i]

    gl.useProgram(prog); gl.bindVertexArray(vao)
    gl.viewport(0, 0, nc, nr)
    gl.uniform1i(uTex, 0)
    gl.uniform1iv(uKsize, [ksize])
    gl.uniform1fv(uKernel, kPad)
    gl.activeTexture(gl.TEXTURE0)

    // Horizontal pass: fboSrc → fboTmp
    gl.bindTexture(gl.TEXTURE_2D, fboSrc.tex)
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboTmp.fbo)
    gl.uniform2f(uDir, 1.0, 0.0)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

    // Vertical pass: fboTmp → fboDst
    gl.bindTexture(gl.TEXTURE_2D, fboTmp.tex)
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboDst.fbo)
    gl.uniform2f(uDir, 0.0, 1.0)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

    // Read back GPU → CPU → gridpoints
    gl.readPixels(0, 0, nc, nr, gl.RED, gl.FLOAT, readBuf)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.bindVertexArray(null)

    for (let r = 0; r < nr; r++)
        for (let c = 0; c < nc; c++)
            gridmodel.grid[c][r][state] = readBuf[r*nc+c]
}

// ── Dual CJS/ESM export ───────────────────────────────────────────────────────
// When bundled by Rollup (browser) the `export function` declarations above
// are used. When required directly in Node.js, the block below provides
// CommonJS exports so the functions work without a build step.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        makeGaussianKernel,
        makeDiskKernel,
        makeGaussianKernel1D,
        applyKernelFFT,
        diffuseStatesGPU,   // no-ops in Node (no WebGL), but safe to export
    }
}
