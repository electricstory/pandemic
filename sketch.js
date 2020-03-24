const side = 800;
const controlWidth = 200;
const centroidCount = 1000;
const maxFamily = 8;
const maxFamRadius = 20;
const dot = 5;
const nearDist = 30;
const farProb = 0.00001;
const DEAD = -1;
const IMMUNE = -2;

const transProb = 0.01;
const virusLife = 100;
const colorInc = Math.floor(255 / virusLife);
const deathProb = 0.005;

const agentList = [];
var wave = [];
const history = [];
const plotHeight = 200;

function getDist(a, b) {
    xDist = a.x - b.x;
    yDist = a.y - b.y;
    let distance = Math.sqrt(xDist*xDist + yDist*yDist);
    return distance;
}

function setup() {
    createCanvas(side + controlWidth, side);

    for (let i = 0; i < centroidCount; i++) {
        let x = Math.random() * side;
        let y = Math.random() * side;

        // fill(0);
        // ellipse(x,y,dot,dot);

        let familySize = Math.ceil(Math.random() * maxFamily) ;
        for (let j = 0; j < familySize; j++) {
            let angle = Math.random() * 2 * Math.PI;
            let dist = Math.random() * maxFamRadius;

            let dx = Math.cos(angle) * dist;
            let dy = Math.sin(angle) * dist;


            // stroke(0);
            // fill(255);
            // ellipse(x+dx,y+dy,dot,dot);

            agent = {
                x:x+dx,
                y:y+dy,
                join:[],
                state:0,
            };
            agentList.push(agent);
        }
    }

    stroke('rgba(100,100,100,0.2)')
    for (let a of agentList) {
        for (let b of agentList) {
            let farLink = Math.random() < farProb;
            if ((getDist(a,b) < nearDist) || farLink) {
                if (!a.join.includes(b) && !b.join.includes(a)) {
                    a.join.push(b);
                    b.join.push(a);
                    line(a.x,a.y,b.x,b.y);                    
                }
            }
        }
    }

    let seed = Math.floor(Math.random() * agentList.length);
    let seedAgent = agentList[seed];
    seedAgent.state = 1;
    wave.push(seedAgent);

    moment = {
        dead: 0,
        immune: 0,
        infected: 1,
    };
    history.push(moment);

}

function draw() {

    stroke(0);
    for (let agent of agentList) {
        if (agent.state > 0) {
            let shade = agent.state * colorInc;
            fill(255,255-shade,255-shade);
        } else if (agent.state == DEAD) {
            fill(0);
        } else if (agent.state == IMMUNE) {
            fill('green');
        } else {
            fill(255);            
        }
        ellipse(agent.x,agent.y,dot,dot);
    }

    for (const [i, moment] of history.entries()) {
        scale = plotHeight / agentList.length;
        x = side + i;

        y = 0;
        deadLen = moment.dead * scale;
        stroke(0);
        line(x,y,x,deadLen);

        y = deadLen;
        immuneLen = moment.immune * scale;
        stroke('green');
        line(x,y,x,immuneLen);

        y = plotHeight;
        infectLen = moment.infected * scale;
        stroke('red');
        line(x,y,x,y - infectLen);
    }


    newWave = [];
    for (let agent of wave) {
        if (agent.state > 0) {
            for (let near of agent.join) {
                if (Math.random() < transProb && near.state == 0) {
                    near.state = 1;
                    newWave.push(near);                    
                }
            }
        }
    }

    for (let agent of agentList) {
        if (agent.state > 0) {
            if (agent.state < virusLife) {
                if (Math.random() < deathProb) {
                    agent.state = DEAD;                    
                } else {
                    agent.state++;
                    newWave.push(agent);
                }
            } else {
                agent.state = IMMUNE;
            }
        }
    }

    let infected = 0;
    let dead = 0;
    let immune = 0;
    for (let agent of agentList) {
        if (agent.state > 0) {
            infected++;
        } else if (agent.state == DEAD) {
            dead++;
        } else if (agent.state == IMMUNE) {
            immune++;
        }
    }  
    let moment = {
        dead: dead,
        immune: immune,
        infected: infected,
    };
    history.push(moment);

    wave = newWave;

}
