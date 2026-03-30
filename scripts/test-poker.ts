import pkg from 'pokersolver';
const { Hand } = pkg;

const hand1 = Hand.solve(['As', 'Ks', 'Qs', 'Js', 'Ts']);
const hand2 = Hand.solve(['As', 'Ks', 'Qs', 'Js', 'Ts']);
const winners = Hand.winners([hand1, hand2]);
console.log(winners.length === 2);
console.log(winners[0] === hand1);
