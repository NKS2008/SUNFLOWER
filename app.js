/*==========================================================
  Flower Bloom App
  Sunflower + Pink Lily
  MediaPipe Hand Tracking
==========================================================*/

// ----------------------------------------------------
// Select Flower
// ----------------------------------------------------

const FLOWER_TYPE = window.FLOWER_TYPE || "sunflower";

// ----------------------------------------------------
// HTML Elements
// ----------------------------------------------------

const video = document.getElementById("webcam");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const loading = document.getElementById("loading");
const instructions = document.getElementById("instructions");

// ----------------------------------------------------
// Canvas Size
// ----------------------------------------------------

function resizeCanvas(){

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

}

resizeCanvas();

window.addEventListener("resize",resizeCanvas);

// ----------------------------------------------------
// Flower Variables
// ----------------------------------------------------

let bloom = 0;
let growth = 0;

let targetBloom = 0;
let targetGrowth = 0;

let wind = 0;

let lastPalmX = 0;

// ----------------------------------------------------
// Particle Array
// ----------------------------------------------------

const particles = [];

// ----------------------------------------------------
// Particle Class
// ----------------------------------------------------

class Particle{

    constructor(){

        this.reset();

    }

    reset(){

        this.x = Math.random()*canvas.width;

        this.y = Math.random()*canvas.height;

        this.size = Math.random()*3+1;

        this.speed = Math.random()*1+0.3;

        this.alpha = Math.random();

    }

    update(){

        this.y -= this.speed;

        this.x += wind*2;

        if(this.y<0){

            this.reset();

            this.y = canvas.height;

        }

    }

    draw(){

        ctx.beginPath();

        ctx.fillStyle =
        "rgba(255,255,200,"+this.alpha+")";

        ctx.arc(
            this.x,
            this.y,
            this.size,
            0,
            Math.PI*2
        );

        ctx.fill();

    }

}

// ----------------------------------------------------
// Create Particles
// ----------------------------------------------------

for(let i=0;i<80;i++){

    particles.push(
        new Particle()
    );

}

// ----------------------------------------------------
// MediaPipe Hands
// ----------------------------------------------------

const hands = new Hands({

    locateFile:(file)=>{

        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;

    }

});

hands.setOptions({

    maxNumHands:2,

    modelComplexity:1,

    minDetectionConfidence:0.7,

    minTrackingConfidence:0.6

});

// ----------------------------------------------------
// Camera
// ----------------------------------------------------

const camera = new Camera(video,{

    onFrame:async()=>{

        await hands.send({

            image:video

        });

    },

    width:1280,

    height:720

});

camera.start();

// ----------------------------------------------------
// Hide Loading Screen
// ----------------------------------------------------

setTimeout(()=>{

    loading.classList.add("hidden");

},2000);

// ----------------------------------------------------
// Hide Instructions
// ----------------------------------------------------

setTimeout(()=>{

    instructions.classList.add("hidden");

},9000);

/*==========================================================
  Hand Detection
==========================================================*/

hands.onResults(onResults);

function onResults(results){

    if(!results.multiHandLandmarks){

        targetBloom *= 0.96;
        targetGrowth *= 0.96;
        wind *= 0.90;

        return;
    }

    for(let i=0;i<results.multiHandLandmarks.length;i++){

        const landmarks =
            results.multiHandLandmarks[i];

        const hand =
            results.multiHandedness[i].label;

        drawHand(landmarks);

        const pinch =
            getPinchStrength(landmarks);

        if(hand==="Left"){

            targetBloom = pinch;

        }
        else{

            targetGrowth = pinch;

        }

        const palm = getPalmCenter(landmarks);

        wind = (palm.x-lastPalmX)*10;

        lastPalmX = palm.x;

    }

}

/*==========================================================
  Pinch Strength
==========================================================*/

function getPinchStrength(landmarks){

    const thumb = landmarks[4];

    const index = landmarks[8];

    const wrist = landmarks[0];

    const middle = landmarks[9];

    const handSize = Math.hypot(

        middle.x-wrist.x,

        middle.y-wrist.y

    );

    const pinch = Math.hypot(

        thumb.x-index.x,

        thumb.y-index.y

    );

    let value = pinch/handSize;

    value = Math.max(0,Math.min(1,value));

    return value;

}

/*==========================================================
  Palm Center
==========================================================*/

function getPalmCenter(landmarks){

    const ids=[0,5,9,13,17];

    let x=0;

    let y=0;

    ids.forEach(id=>{

        x+=landmarks[id].x;

        y+=landmarks[id].y;

    });

    return{

        x:x/ids.length,

        y:y/ids.length

    };

}

/*==========================================================
  Draw Hand Landmarks
==========================================================*/

function drawHand(landmarks){

    ctx.save();

    ctx.strokeStyle="#00ff99";

    ctx.fillStyle="#00ff99";

    ctx.lineWidth=2;

    landmarks.forEach(point=>{

        ctx.beginPath();

        ctx.arc(

            point.x*canvas.width,

            point.y*canvas.height,

            5,

            0,

            Math.PI*2

        );

        ctx.fill();

    });

    ctx.restore();

}

/*==========================================================
  Smooth Animation Values
==========================================================*/

function updateFlower(){

    bloom +=

    (targetBloom-bloom)*0.08;

    growth +=

    (targetGrowth-growth)*0.06;

}

/*==========================================================
  Draw Stem
==========================================================*/

function drawStem(){

    const x = canvas.width/2;

    const bottom = canvas.height;

    const height = growth*350+80;

    const top = bottom-height;

    ctx.save();

    ctx.beginPath();

    ctx.moveTo(x,bottom);

    ctx.quadraticCurveTo(

        x+wind*20,

        bottom-height/2,

        x,

        top

    );

    ctx.lineWidth=8;

    ctx.strokeStyle="#2E8B57";

    ctx.lineCap="round";

    ctx.stroke();

    ctx.restore();

    drawLeaves(x,bottom,height);

}

/*==========================================================
  Draw Leaves
==========================================================*/

function drawLeaves(x,bottom,height){

    const positions=[0.35,0.60];

    positions.forEach((value,index)=>{

        const y=bottom-height*value;

        const side=index%2===0?-1:1;

        ctx.save();

        ctx.translate(x,y);

        ctx.rotate(side*0.7);

        ctx.beginPath();

        ctx.moveTo(0,0);

        ctx.quadraticCurveTo(

            side*45,

            -15,

            side*70,

            0

        );

        ctx.quadraticCurveTo(

            side*45,

            15,

            0,

            0

        );

        ctx.fillStyle="#3CB371";

        ctx.fill();

        ctx.restore();

    });

}

/*==========================================================
  Draw Floating Particles
==========================================================*/

function drawParticles(){

    particles.forEach(p=>{

        p.update();

        p.draw();

    });

}

/*==========================================================
  Get Flower Position
==========================================================*/

function getFlowerPosition(){

    return{

        x:canvas.width/2,

        y:canvas.height-(growth*350+80)

    };

}

/*==========================================================
                SUNFLOWER DRAWING
==========================================================*/

function drawSunflower(){

    const flower = getFlowerPosition();

    const x = flower.x;
    const y = flower.y;

    ctx.save();

    ctx.translate(x,y);

    ctx.rotate(wind*0.15);

    const petals = 24;

    const radius = 55 + growth*30;

    const open = bloom*40;

    /*--------------------------
        Draw Petals
    --------------------------*/

    for(let i=0;i<petals;i++){

        ctx.save();

        ctx.rotate(i*(Math.PI*2/petals));

        ctx.beginPath();

        ctx.moveTo(0,0);

        ctx.quadraticCurveTo(

            15,

            -(radius/2),

            0,

            -(radius+open)

        );

        ctx.quadraticCurveTo(

            -15,

            -(radius/2),

            0,

            0

        );

        const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            -(radius+open)
        );

        gradient.addColorStop(0,"#FFC107");
        gradient.addColorStop(1,"#FFEB3B");

        ctx.fillStyle = gradient;

        ctx.shadowBlur = 15;

        ctx.shadowColor = "#FFD700";

        ctx.fill();

        ctx.restore();

    }

    /*--------------------------
        Flower Center
    --------------------------*/

    const center =
    ctx.createRadialGradient(
        0,
        0,
        5,
        0,
        0,
        30
    );

    center.addColorStop(0,"#8B4513");
    center.addColorStop(1,"#3E2723");

    ctx.fillStyle = center;

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        28,
        0,
        Math.PI*2
    );

    ctx.fill();

    /*--------------------------
        Seeds
    --------------------------*/

    ctx.fillStyle="#111";

    for(let i=0;i<120;i++){

        const angle=i*2.4;

        const r=Math.sqrt(i)*2.2;

        ctx.beginPath();

        ctx.arc(

            Math.cos(angle)*r,

            Math.sin(angle)*r,

            1.2,

            0,

            Math.PI*2

        );

        ctx.fill();

    }

    ctx.restore();

}

/*==========================================================
                LIGHT PINK LILY DRAWING
==========================================================*/

function drawLily(){

    const flower = getFlowerPosition();

    const x = flower.x;
    const y = flower.y;

    ctx.save();

    ctx.translate(x,y);

    ctx.rotate(wind*0.15);

    const petals = 6;

    const radius = 75 + growth*25;

    const open = bloom*0.6;

    /*---------------------------------
          Draw Lily Petals
    ---------------------------------*/

    for(let i=0;i<petals;i++){

        ctx.save();

        ctx.rotate(i*(Math.PI*2/petals));

        ctx.rotate((open-0.5)*0.4);

        ctx.beginPath();

        ctx.moveTo(0,0);

        ctx.bezierCurveTo(

            22,

            -20,

            18,

            -radius,

            0,

            -radius*1.3

        );

        ctx.bezierCurveTo(

            -18,

            -radius,

            -22,

            -20,

            0,

            0

        );

        const petalGradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            -radius*1.3
        );

        petalGradient.addColorStop(
            0,
            "#FFF7FA"
        );

        petalGradient.addColorStop(
            0.5,
            "#FFD6E8"
        );

        petalGradient.addColorStop(
            1,
            "#FFB6D5"
        );

        ctx.fillStyle = petalGradient;

        ctx.shadowBlur = 20;

        ctx.shadowColor = "#FFC0CB";

        ctx.fill();

        /* Vein */

        ctx.beginPath();

        ctx.moveTo(
            0,
            0
        );

        ctx.lineTo(
            0,
            -radius*1.1
        );

        ctx.strokeStyle =
        "rgba(255,120,170,0.45)";

        ctx.lineWidth = 1;

        ctx.stroke();

        ctx.restore();

    }

    /*---------------------------------
            Flower Center
    ---------------------------------*/

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        10,
        0,
        Math.PI*2
    );

    ctx.fillStyle="#FFF8F8";

    ctx.fill();

    /*---------------------------------
             Yellow Stamens
    ---------------------------------*/

    for(let i=0;i<6;i++){

        const angle=i*(Math.PI*2/6);

        const sx=Math.cos(angle)*8;

        const sy=Math.sin(angle)*8;

        const ex=Math.cos(angle)*35;

        const ey=Math.sin(angle)*35;

        ctx.beginPath();

        ctx.moveTo(sx,sy);

        ctx.lineTo(ex,ey);

        ctx.strokeStyle="#E5C100";

        ctx.lineWidth=2;

        ctx.stroke();

        ctx.beginPath();

        ctx.fillStyle="#FFCC33";

        ctx.arc(
            ex,
            ey,
            3,
            0,
            Math.PI*2
        );

        ctx.fill();

    }

    ctx.restore();

}

/*==========================================================
            DRAW FLOWER
==========================================================*/

function drawFlower(){

    if(FLOWER_TYPE==="sunflower"){

        drawSunflower();

    }

    else if(FLOWER_TYPE==="lily"){

        drawLily();

    }

    else{

        drawSunflower();

    }

}

/*==========================================================
            DRAW BACKGROUND GLOW
==========================================================*/

function drawGlow(){

    const flower = getFlowerPosition();

    const gradient = ctx.createRadialGradient(

        flower.x,

        flower.y,

        20,

        flower.x,

        flower.y,

        180

    );

    if(FLOWER_TYPE==="sunflower"){

        gradient.addColorStop(0,"rgba(255,220,0,0.35)");
        gradient.addColorStop(1,"rgba(255,220,0,0)");

    }

    else{

        gradient.addColorStop(0,"rgba(255,182,193,0.35)");
        gradient.addColorStop(1,"rgba(255,182,193,0)");

    }

    ctx.fillStyle=gradient;

    ctx.beginPath();

    ctx.arc(

        flower.x,

        flower.y,

        180,

        0,

        Math.PI*2

    );

    ctx.fill();

}

/*==========================================================
            DRAW GROUND
==========================================================*/

function drawGround(){

    ctx.fillStyle="#3E7D2F";

    ctx.fillRect(

        0,

        canvas.height-30,

        canvas.width,

        30

    );

}

/*==========================================================
            MAIN DRAW FUNCTION
==========================================================*/

function drawScene(){

    ctx.clearRect(

        0,

        0,

        canvas.width,

        canvas.height

    );

    updateFlower();

    drawParticles();

    drawGround();

    drawStem();

    drawGlow();

    drawFlower();

}

/*==========================================================
            ANIMATION LOOP
==========================================================*/

function animate(){

    drawScene();

    requestAnimationFrame(animate);

}

animate();

/*==========================================================
            END OF APP
==========================================================*/

