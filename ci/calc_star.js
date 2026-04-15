const C = [100, 100];
const R_out = 90;
const R_in = R_out * 0.381966; // 38.1966

function getPoint(radius, angle_deg) {
    let a = angle_deg * Math.PI / 180;
    let x = (C[0] + radius * Math.cos(a)).toFixed(1);
    let y = (C[1] + radius * Math.sin(a)).toFixed(1);
    return [x, y];
}

const outer_angles = [-90, -18, 54, 126, 198];
const inner_angles = [-54, 18, 90, 162, 234];

const O = outer_angles.map(a => getPoint(R_out, a));
const I = inner_angles.map(a => getPoint(R_in, a));

console.log("O:", O);
console.log("I:", I);

for (let k = 0; k < 5; k++) {
    let prev_i = (k + 4) % 5;
    console.log(`Shard ${k+1}: d="M100 100 L${I[prev_i][0]} ${I[prev_i][1]} L${O[k][0]} ${O[k][1]} L${I[k][0]} ${I[k][1]} Z"`);
}

for (let k = 0; k < 5; k++) {
    let push_dist = 12;
    let a = outer_angles[k] * Math.PI / 180;
    let tx = (push_dist * Math.cos(a)).toFixed(1);
    let ty = (push_dist * Math.sin(a)).toFixed(1);
    console.log(`.ci-shard.s${k+1} { transform: translate(${tx}px, ${ty}px) scale(0.92); }`);
}
