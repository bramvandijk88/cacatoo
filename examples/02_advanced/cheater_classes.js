class Dummy {
    constructor() {
      this.name = 'dummyclass';
    }

    greet() {
      console.log(`Greetings from ${this.name}`);
    }
}
if(typeof window == 'undefined') module.exports = { Dummy }