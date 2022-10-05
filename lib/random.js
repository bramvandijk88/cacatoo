// Browser-friendly version of 'fast-random' (https://github.com/borilla/fast-random) by Bram van Dijk for compatibility with browser-based Cacatoo models
if (typeof module !== 'undefined') module.exports = random; 
function random(seed) {
    function _seed(s) {
            if ((seed = (s|0) % 2147483647) <= 0) {
                    seed += 2147483646;
            }
    }

    function _nextInt() {
            return seed = seed * 48271 % 2147483647;
    }

    function _nextFloat() {
            return (_nextInt() - 1) / 2147483646;
    }    

    _seed(seed);

    return {
            seed: _seed,
            nextInt: _nextInt,
            nextFloat: _nextFloat
    };
}

export default random 

//module.exports = random; 