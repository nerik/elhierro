//main.js
import ConsoleWrapper from "./ConsoleWrapper";

var x = new ConsoleWrapper();
x.speak();

console.log([1, 2, 3].map( x => x * 2));
