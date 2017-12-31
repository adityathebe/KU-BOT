function generateCode (dep, sem, sub) {
	let data = dep + sem + sub;
	let rep = data
		.split("")
		.reduce((a, b) => {
			a = ((a<<5)-a) + b.charCodeAt(0); 
			return a & a
		}, 0);              
	return rep
}

let code = generateCode('CS', '4', 'MATH207')
console.log(code);

module.exports = generateCode