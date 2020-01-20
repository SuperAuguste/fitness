/*
ORDER:
Left
Right
Up
Down
*/

function sigmoid(t) {

	return 1 / (1 + Math.pow(Math.E, -t));
	// return t / 1;

}

let canDie = true;
// function distance(x1, y1, x2, y2) {

// 	return Math.sqrt((x2 - x1)**2 + (y2 - y1)**2)

// }

function randWeight() {

	return Math.random();

}

function clamp(v) {

	if (v < 0) return 0;
	else if (v > 1) return 1;
	else return v;

}

class Player {

	constructor() {

		this.x = windowWidth / 2;
		this.y = windowHeight / 10 * 9;

		this.xaccel = 0;
		this.yaccel = 0;

		this.width = 10;
		this.height = 10;

		this.senseDistance = 250;
		this.dangerDistance = this.senseDistance*2;

		this.reset();

	}

	draw() {

		rectMode(CENTER);

		stroke(100, 100, 100);
		strokeWeight(3);
	
		line(this.x, this.y, this.x - this.senseDistance, this.y);
		line(this.x, this.y, this.x + this.senseDistance, this.y);
		line(this.x, this.y, this.x, this.y + this.senseDistance);
		line(this.x, this.y, this.x, this.y - this.senseDistance);

		// line(this.x, this.y, this.x + this.senseDistance, this.y + this.senseDistance);
		// line(this.x, this.y, this.x - this.senseDistance, this.y - this.senseDistance);
		// line(this.x, this.y, this.x - this.senseDistance, this.y + this.senseDistance);
		// line(this.x, this.y, this.x + this.senseDistance, this.y - this.senseDistance);

		fill(255, 255, 255);
		noStroke()
		rect(this.x, this.y, this.width, this.height);

		this.x += this.xaccel;
		this.y += this.yaccel;

		this.xaccel = lerp(this.xaccel, 0, 0.1);
		this.yaccel = lerp(this.yaccel, 0, 0.1);

		if (keyIsDown(38)) {

			this.yaccel -= 0.5;

		} else if (keyIsDown(40)) {

			this.yaccel += 0.5;

		}

		if (keyIsDown(37)) {

			this.xaccel -= 0.5;

		} else if (keyIsDown(39)) {

			this.xaccel += 0.5;

		}

		this.sense();

	}

	reset() {

		console.log("Reset!");
		this.x = windowWidth / 2;
		this.y = windowHeight / 10 * 7;
		this.xaccel = 0;
		this.yaccel = 0;
		time = 0;

	}

	sense() {

		let doneLeft = false;
		let doneRight = false;
		let doneUp = false;
		let doneDown = false;

		for (const wall of walls) {

			if (canDie && this.x > wall[0] - wall[2] / 2 && this.x < wall[0] + wall[2] / 2 && this.y > wall[1] - wall[3] / 2 && this.y < wall[1] + wall[3] / 2) {

				// console.log("dead!", Math.abs(this.x - wall[0]));
				
				if (time > bestTime) {

					bestTime = time;
					bestTimeTime = 0;

					for (const n of network.bnc) {
				
						// n.weight = [n.weight.slice(0, 2).reduce((a, b) => a + b, 0) * .6 + randWeight() * .4, ...n.weight];
						n.weight = [n.weight[0] * .6 + randWeight() * .4, ...n.weight];

					}

				} else {

					for (const n of network.bnc) {
						
						if (n.weight.length !== 1) {

							n.weight.shift();
							// n.weight = [n.weight.slice(0, 2).reduce((a, b) => a + b, 0) * .4 + randWeight() * .6, ...n.weight];
							n.weight = [n.weight[0] * .6 + randWeight() * .4, ...n.weight];

						} else {

							n.weight[1] = randWeight();

						}

					}

				}

				this.reset();

			}

			// Left
			if (wall[0] - wall[2] / 2 < this.x && wall[0] + wall[2] / 2 + this.senseDistance > this.x && this.y > wall[1] - wall[3] / 2 && this.y < wall[1] + wall[3] / 2) {

				network.inputNodes[0].trigger(clamp(1 - (this.x - wall[0]) / this.dangerDistance));
				doneLeft = true;

			}
			// Right
			else if (wall[0] - wall[2] / 2 > this.x && wall[0] + wall[2] / 2 - this.senseDistance < this.x && this.y > wall[1] - wall[3] / 2 && this.y < wall[1] + wall[3] / 2) {

				network.inputNodes[1].trigger(clamp(1 - (wall[0] - this.x) / this.dangerDistance));
				doneRight = true;

			}

			// Up
			if (wall[1] - wall[3] / 2 < this.y && wall[1] + wall[3] / 2 + this.senseDistance > this.y && this.x > wall[0] - wall[2] / 2 && this.x < wall[0] + wall[2] / 2) {

				// console.log("up!", clamp(1 - (this.y - wall[1]) / this.senseDistance));
				network.inputNodes[2].trigger(clamp(1 - (this.y - wall[1]) / this.dangerDistance));
				doneUp = true;

			}
			// Down
			else if (wall[1] - wall[3] / 2 > this.y && wall[1] + wall[3] / 2 - this.senseDistance < this.y && this.x > wall[0] - wall[2] / 2 && this.x < wall[0] + wall[2] / 2) {

				// console.log("down!", clamp(1 - (wall[1] - this.y) / this.senseDistance));
				network.inputNodes[3].trigger(clamp(1 - (wall[1] - this.y) / this.dangerDistance));
				doneDown = true;

			}

		}

		if (!doneLeft) network.inputNodes[0].trigger(0);
		if (!doneRight) network.inputNodes[1].trigger(0);
		if (!doneUp) network.inputNodes[2].trigger(0);
		if (!doneDown) network.inputNodes[3].trigger(0);

	}

}

class NetworkConnection {

	constructor(node, weight) {

		this.node = node;
		this.weight = [weight];

	}

	trigger(value) {

		this.node.trigger(value * this.weight[0]);

	}

}

class NetworkNode {

	constructor() {

		this.activation = 0;
		this.activationStack = [];
		this.nextNodeConnections = [];

	}

	connectTo(node) {

		this.nextNodeConnections.push(new NetworkConnection(node, Math.random()));

	}

	trigger(value) {

		// console.log(value)
		// this.activation = (this.activation + value) / 2;
		this.activationStack.push(value);

	}

	flush() {

		// this.activation = this.activationStack.reduce((a, b) => a + b, 0) / this.activationStack.length;
		if (this.activationStack.length !== 0) this.activation = sigmoid(this.activationStack.reduce((a, b) => a + b, 0));
		else this.activation = 0;
		this.activationStack = [];

		for (const conn of this.nextNodeConnections) {

			conn.trigger(this.activation);

		}

	}

}

class InputNode extends NetworkNode {

	flush() {

		// this.activation = this.activationStack.reduce((a, b) => a + b, 0) / this.activationStack.length;
		if (this.activationStack.length !== 0) this.activation = this.activationStack.reduce((a, b) => a + b, 0) / this.activationStack.length;
		this.activationStack = [];

		for (const conn of this.nextNodeConnections) {

			conn.trigger(this.activation);

		}

	}

}

class HiddenNode extends NetworkNode {

	trigger(value) {

		super.trigger(value);

	}

}

class OutputNode extends NetworkNode {



}

class NeuralNetwork {

	constructor() {

		this.inputNodes = [new InputNode(), new InputNode(), new InputNode(), new InputNode()];
		this.hiddenNodes = [new HiddenNode(), new HiddenNode(), new HiddenNode(), new HiddenNode()];
		this.outputNodes = [new OutputNode(), new OutputNode(), new OutputNode(), new OutputNode()];

		for (const i of this.inputNodes) {
			
			for (const h of this.hiddenNodes) {
			
				i.connectTo(h);
				
			}

		}

		for (const h of this.hiddenNodes) {
			
			for (const o of this.outputNodes) {
			
				h.connectTo(o);
				
			}

		}

		this.bnc = [];

		for (const i of this.inputNodes) {
			
			this.bnc.push(...i.nextNodeConnections);

		}

		for (const h of this.hiddenNodes) {
			
			this.bnc.push(...h.nextNodeConnections);

		}

		// this.nodes = [...this.inputNodes, ...this.hiddenNodes, ...this.outputNodes];

	}

	draw() {

		stroke(255, 255, 255);
		noFill();
		rectMode(CORNER);
		rect(25, 25, 150, 100);

		strokeWeight(1);

		// for (const n of this.nodes) {
			
		// 	n.activation = 0;

		// }

		let i = 0;
		for (const inp of this.inputNodes) {
		
			inp.flush();

			for (let i2 = 0; i2 < 4; i2++) {
		
				stroke(0, 255 * inp.nextNodeConnections[i2].weight[0], 0);
				line(50, 41 + i * 22.5, 100, 41 + i2 * 22.5);
		
			}
			stroke(255, 255, 255);
			
			// console.log(inp.activation)
			fill(255 * inp.activation);
			ellipse(50, 41 + i * 22.5, 15, 15);
			i++;

		}

		fill(255);
		noStroke();

		textFont("Arial", 10);
		text("L", 47, 44 + 0 * 22.5);
		text("R", 47, 44 + 1 * 22.5);
		text("U", 47, 44 + 2 * 22.5);
		text("D", 47, 44 + 3 * 22.5);

		noFill();
		stroke(255, 255, 255);

		i = 0;
		for (const hidd of this.hiddenNodes) {
			
			hidd.flush();

			for (let i2 = 0; i2 < 4; i2++) {
		
				stroke(0, 255 * hidd.nextNodeConnections[i2].weight[0], 0);
				line(100, 41 + i * 22.5, 150, 41 + i2 * 22.5);
		
			}
			stroke(255, 255, 255);

			fill(255 * hidd.activation);
			ellipse(100, 41 + i * 22.5, 15, 15);

			fill(255);
			noStroke();
			textFont("Arial", 10);
			text(hidd.activation.toPrecision(1), 94, 44 + i * 22.5);
			noFill();

			i++;

		}

		i = 0;
		let thresh = 0.78;
		let a = false;
		// let m = this.outputNodes.reduce((prev, current) => (prev.activation > current.activation) ? prev : current);

		let hor = this.outputNodes[0].activation > this.outputNodes[1].activation ? this.outputNodes[0] : this.outputNodes[1];
		let ver = this.outputNodes[2].activation > this.outputNodes[3].activation ? this.outputNodes[2] : this.outputNodes[3];

		for (const outp of this.outputNodes) {

			outp.flush();

			// stroke(255, 255, 255);
			noStroke();

			if (outp === hor && hor.activation > thresh) {

				a = true;
				stroke(0, 255, 0);

				if (i === 0) player.xaccel -= hor.activation * 0.15;
				if (i === 1) player.xaccel += hor.activation * 0.15;

			}

			if (outp === ver && ver.activation > thresh) {

				a = true;
				stroke(0, 255, 0);

				if (i === 2) player.yaccel -= ver.activation * 0.15;
				if (i === 3) player.yaccel += ver.activation * 0.15;

			}

			fill(255 * outp.activation);
			ellipse(150, 41 + i * 22.5, 15, 15);

			fill(255);
			noStroke();
			textFont("Arial", 10);
			text(outp.activation.toPrecision(1), 143, 44 + i * 22.5);
			noFill();

			i++;

		}

		if (!a) {

			for (const n of network.bnc) {
						
				if (n.weight.length !== 1) {

					n.weight.shift();
					// n.weight = [n.weight.slice(0, 2).reduce((a, b) => a + b, 0) * .4 + randWeight() * .6, ...n.weight];
					n.weight = [n.weight[0] * .4 + randWeight() * .6, ...n.weight];

				} else {

					n.weight[1] = randWeight();

				}

			}

			// player.yaccel += (.5-Math.random())*2;
			player.reset();

		}
		// if (dir === 1) player.xaccel += 0.25;
		// if (dir === 2) player.yaccel -= 0.25;
		// if (dir === 3) player.yaccel += 0.25;

	}

}

let player;
let network;
let walls = [];

let time = 0;
let bestTime = 0;
let bestTimeTime = 0;

function setup() {

	createCanvas(windowWidth, windowHeight);
	colorMode(RGB);

	player = new Player();
	network = new NeuralNetwork();

	// wall(windowWidth / 2 - 30, windowHeight - 120, 5, 200);
	wall(windowWidth / 2 + 220, windowHeight - 200, 5, 180);
	wall(windowWidth / 2 - 220, windowHeight - 200, 5, 180);

	wall(windowWidth / 2 + 420, windowHeight - 200, 5, 380);
	wall(windowWidth / 2 - 420, windowHeight - 200, 5, 380);

	wall(windowWidth / 2, windowHeight - 30, windowWidth, 5);

	// wall(windowWidth / 2 - 80, windowHeight - 220, 100, 5);
	wall(windowWidth / 2, windowHeight - 380, windowWidth, 5);

}

function wall(x, y, w, h) {

	walls.push([x, y, w, h]);

}

function draw() {

	background(0, 0, 0);

	time++;
	if (bestTime) {

		bestTime -= 0.1;

	}

	// if (bestTimeTime > 50 && time < bestTime) {

	// 	console.log("AARP - resetting!");

		// player.x = windowWidth / 2;
		// player.y = windowHeight / 10 * 9;
		// time = 0;

		// bestTimeTime = 0;
		// for (const n of network.bnc) {
			
		// 	n.weight.shift();
		// 	n.weight = [(n.weight[0] + randWeight()) / 2, ...n.weight];

		// }

	// }

	noStroke();
	fill(255);
	rectMode(CENTER);
	for (const wall of walls) {

		rect(...wall);

	}

	textFont("Arial", 20);
	text(time, windowWidth - 100, 25);
	text(Math.round(bestTime), windowWidth - 100, 50);
	text(`Gen ${network.bnc[0].weight.length}`, windowWidth - 100, 75);

	player.draw();
	network.draw();

}
