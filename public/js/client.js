const c = document.querySelector("#c");
const dpi = window.devicePixelRatio;
const dpiinv = 1/dpi;
const ctx = c.getContext("2d");

//sounds
const sfx = {
  move: new Audio('https://cdn.glitch.com/5e0f9006-3453-41ad-b0eb-222438390afa%2Fpublic_sound_standard_Move.mp3?v=1619558550313'),
  capture: new Audio('https://cdn.glitch.com/5e0f9006-3453-41ad-b0eb-222438390afa%2Fpublic_sound_standard_Capture.mp3?v=1619561706712'),
  notification: new Audio('https://cdn.glitch.com/5e0f9006-3453-41ad-b0eb-222438390afa%2Fpublic_sound_standard_GenericNotify.mp3?v=1619562589599')
};

//defining constants so I dont need to write it out later
var boardScale = 30*8; const oboardScale = 30*8;
var boardBuffer = 60; const oboardBuffer = 60;
var scale = 1;

const __ = -1;

const wP = 0;
const wR = 1;
const wN = 2;
const wB = 3;
const wQ = 4;
const wK = 5;
const wP_ = 6;
const wR_ = 7;
const wK_ = 8;

const bP = 10;
const bR = 11;
const bN = 12;
const bB = 13;
const bQ = 14;
const bK = 15;
const bP_ = 16;
const bR_ = 17;
const bK_ = 18;

const initBoard =[[wR_,  wP_,   __,   __,  __,  __,  bP_,  bR_],
                  [wN ,  wP_,   __,   __,  __,  __,  bP_,  bN ],
                  [wB ,  wP_,   __,   __,  __,  __,  bP_,  bB ],
                  [wQ ,  wP_,   __,   __,  __,  __,  bP_,  bQ ],
                  [wK_,  wP_,   __,   __,  __,  __,  bP_,  bK_],
                  [wB ,  wP_,   __,   __,  __,  __,  bP_,  bB ],
                  [wN ,  wP_,   __,   __,  __,  __,  bP_,  bN ],
                  [wR_,  wP_,   __,   __,  __,  __,  bP_,  bR_]];

//note: time <-> x, timeline <-> y
const Npaths = [(1,2),(-1,2),(1,-2),(-1,-2),(2,1),(2,-1),(-2,1),(-2,-1)];
const Bpaths = [(1,1),(1,-1),(-1,1),(-1,-1)];
const Rpaths = [(1,0),(0,-1),(-1,0),(0,1)];
const Ppaths = [(1,1),(-1,1)]; //note: y*= -1 for black //note2: this is for normal capture movement only
const Qpaths = [[-1, -1, -1, -1], [0, -1, -1, -1], [1, -1, -1, -1], [-1, 0, -1, -1], [0, 0, -1, -1], [1, 0, -1, -1], [-1, 1, -1, -1], [0, 1, -1, -1], [1, 1, -1, -1], [-1, -1, 0, -1], [0, -1, 0, -1], [1, -1, 0, -1], [-1, 0, 0, -1], [0, 0, 0, -1], [1, 0, 0, -1], [-1, 1, 0, -1], [0, 1, 0, -1], [1, 1, 0, -1], [-1, -1, 1, -1], [0, -1, 1, -1], [1, -1, 1, -1], [-1, 0, 1, -1], [0, 0, 1, -1], [1, 0, 1, -1], [-1, 1, 1, -1], [0, 1, 1, -1], [1, 1, 1, -1], [-1, -1, -1, 0], [0, -1, -1, 0], [1, -1, -1, 0], [-1, 0, -1, 0], [0, 0, -1, 0], [1, 0, -1, 0], [-1, 1, -1, 0], [0, 1, -1, 0], [1, 1, -1, 0], [-1, -1, 0, 0], [0, -1, 0, 0], [1, -1, 0, 0], [-1, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 0], [-1, 1, 0, 0], [0, 1, 0, 0], [1, 1, 0, 0], [-1, -1, 1, 0], [0, -1, 1, 0], [1, -1, 1, 0], [-1, 0, 1, 0], [0, 0, 1, 0], [1, 0, 1, 0], [-1, 1, 1, 0], [0, 1, 1, 0], [1, 1, 1, 0], [-1, -1, -1, 1], [0, -1, -1, 1], [1, -1, -1, 1], [-1, 0, -1, 1], [0, 0, -1, 1], [1, 0, -1, 1], [-1, 1, -1, 1], [0, 1, -1, 1], [1, 1, -1, 1], [-1, -1, 0, 1], [0, -1, 0, 1], [1, -1, 0, 1], [-1, 0, 0, 1], [0, 0, 0, 1], [1, 0, 0, 1], [-1, 1, 0, 1], [0, 1, 0, 1], [1, 1, 0, 1], [-1, -1, 1, 1], [0, -1, 1, 1], [1, -1, 1, 1], [-1, 0, 1, 1], [0, 0, 1, 1], [1, 0, 1, 1], [-1, 1, 1, 1], [0, 1, 1, 1], [1, 1, 1, 1]];
//note: all 4 are for travel along any number of axes //note2: for all purposes, a king is a 1-range queen

//CLONE FUNCTION
//
//
function deepClone(obj, hash = new WeakMap()) {
  // Do not try to clone primitives or functions
  if (Object(obj) !== obj || obj instanceof Function) return obj;
  if (hash.has(obj)) return hash.get(obj); // Cyclic reference
  try {
    // Try to run constructor (without arguments, as we don't know them)
    var result = new obj.constructor();
  } catch (e) {
    // Constructor failed, create object without running the constructor
    result = Object.create(Object.getPrototypeOf(obj));
  }
  // Optional: support for some standard constructors (extend as desired)
  if (obj instanceof Map)
    Array.from(obj, ([key, val]) =>
      result.set(deepClone(key, hash), deepClone(val, hash))
    );
  else if (obj instanceof Set)
    Array.from(obj, key => result.add(deepClone(key, hash)));
  // Register in hash
  hash.set(obj, result);
  // Clone and assign enumerable own properties recursively
  return Object.assign(
    result,
    ...Object.keys(obj).map(key => ({ [key]: deepClone(obj[key], hash) }))
  );
}

Array.prototype.last = function() {
    return deepClone(this[this.length - 1]);
}

//ZOOM FUNCTION
//
//
function zoom(event) {
  event.preventDefault();

  scale += event.deltaY * -0.005;

  // Restrict scale
  scale = Math.min(Math.max(.125, scale), 2);
  boardScale = scale*oboardScale;
  boardBuffer = scale*oboardBuffer;
}
c.onwheel = zoom;

//CLIENT
//
//
var Client = (function(window) {

  var socket      = null;
  var gameState   = null;
  //NOTE: gameState.validMoves keys should be stringified before referencing

  var gameID      = null;
  var playerColor = null;
  var playerName  = null;

  var container   = null;
  var messages    = null;
  var statusblip  = null;
  

  var move = {}; 
  var nextPresent;

  var selection   = null;
  var CAMERA      = {x:0,y:0};
  centerCAM({time:0,timeline:0});
  
  var gameOverMessage     = null;
  var pawnPromotionPrompt = null;
  var forfeitPrompt       = null;
  
  var pIMG = {};
  if(true){ //for collapsing
    pIMG[__] = new Image;
    pIMG[wP] = new Image; pIMG[wP].src = "https://cdn.glitch.com/5e0f9006-3453-41ad-b0eb-222438390afa%2FwP.svg?v=1617102031643";
    pIMG[wR] = new Image; pIMG[wR].src = "https://cdn.glitch.com/5e0f9006-3453-41ad-b0eb-222438390afa%2FwR.svg?v=1617102031925";
    pIMG[wN] = new Image; pIMG[wN].src = "https://cdn.glitch.com/5e0f9006-3453-41ad-b0eb-222438390afa%2FwN.svg?v=1617102031915";
    pIMG[wB] = new Image; pIMG[wB].src = "https://cdn.glitch.com/5e0f9006-3453-41ad-b0eb-222438390afa%2FwB.svg?v=1617102037456";
    pIMG[wQ] = new Image; pIMG[wQ].src = "https://cdn.glitch.com/5e0f9006-3453-41ad-b0eb-222438390afa%2FwQ.svg?v=1617102031643";
    pIMG[wK] = new Image; pIMG[wK].src = "https://cdn.glitch.com/5e0f9006-3453-41ad-b0eb-222438390afa%2FwK.svg?v=1617102031712";
    pIMG[wP_] = pIMG[wP];
    pIMG[wR_] = pIMG[wR];
    pIMG[wK_] = pIMG[wK];
    pIMG[bP] = new Image; pIMG[bP].src = "https://cdn.glitch.com/5e0f9006-3453-41ad-b0eb-222438390afa%2FbP.svg?v=1617102118623";
    pIMG[bR] = new Image; pIMG[bR].src = "https://cdn.glitch.com/5e0f9006-3453-41ad-b0eb-222438390afa%2FbR.svg?v=1617102119358";
    pIMG[bN] = new Image; pIMG[bN].src = "https://cdn.glitch.com/5e0f9006-3453-41ad-b0eb-222438390afa%2FbN.svg?v=1617102119524";
    pIMG[bB] = new Image; pIMG[bB].src = "https://cdn.glitch.com/5e0f9006-3453-41ad-b0eb-222438390afa%2FbB.svg?v=1617102118548";
    pIMG[bQ] = new Image; pIMG[bQ].src = "https://cdn.glitch.com/5e0f9006-3453-41ad-b0eb-222438390afa%2FbQ.svg?v=1617102119676";
    pIMG[bK] = new Image; pIMG[bK].src = "https://cdn.glitch.com/5e0f9006-3453-41ad-b0eb-222438390afa%2FbK.svg?v=1617102118749";
    pIMG[bP_] = pIMG[bP];
    pIMG[bR_] = pIMG[bR];
    pIMG[bK_] = pIMG[bK];
  }
  var bIMG = new Image; bIMG.src = "https://cdn.glitch.com/5e0f9006-3453-41ad-b0eb-222438390afa%2Fbrown.svg?v=1617102060746";
  
  
  var selected = null;
  var mouseDownPos = null;
  var cameraDownPos = null;
  
  
  ctx.imageSmoothingEnabled = 'false';
  //draws a small curved arrow
  function drawArrow(src, end, color){
    let ymod = playerColor=="white"?1:-1;
    let srcpt = playerColor=="white"?[src.time*(boardScale+boardBuffer)+src.x*boardScale/8+boardScale/16,-ymod*(boardScale+boardBuffer)*src.timeline+(7-src.y)*boardScale/8+boardScale/16]:[src.time*(boardScale+boardBuffer)+(7-src.x)*boardScale/8+boardScale/16,-ymod*(boardScale+boardBuffer)*src.timeline+(src.y)*boardScale/8+boardScale/16];
    let endpt = playerColor=="white"?[end.time*(boardScale+boardBuffer)+end.x*boardScale/8+boardScale/16,-ymod*(boardScale+boardBuffer)*end.timeline+(7-end.y)*boardScale/8+boardScale/16]:[end.time*(boardScale+boardBuffer)+(7-end.x)*boardScale/8+boardScale/16,-ymod*(boardScale+boardBuffer)*end.timeline+(end.y)*boardScale/8+boardScale/16];
    
    let deltapt = [endpt[0]-srcpt[0],endpt[1]-srcpt[1]];
    let pmag = 1/Math.sqrt(deltapt[0]*deltapt[0]+deltapt[1]*deltapt[1]);
    
    srcpt = [srcpt[0]+deltapt[0]*pmag*boardScale/16,srcpt[1]+deltapt[1]*pmag*boardScale/16];
    endpt = [endpt[0]-deltapt[0]*pmag*boardScale/16,endpt[1]-deltapt[1]*pmag*boardScale/16];
    
    deltapt = [endpt[0]-srcpt[0],endpt[1]-srcpt[1]];
    pmag = 1/Math.sqrt(deltapt[0]*deltapt[0]+deltapt[1]*deltapt[1]);
    let pslope = [-deltapt[1],deltapt[0]];
    let hscale = 0.06;
    
    ctx.beginPath();
    ctx.moveTo(endpt[0],endpt[1]);
    ctx.lineTo(endpt[0]+(pslope[0]-deltapt[0])*pmag*boardScale*hscale,endpt[1]+(pslope[1]-deltapt[1])*pmag*boardScale*hscale);
    ctx.lineTo(endpt[0]+(-pslope[0]-deltapt[0])*pmag*boardScale*hscale,endpt[1]+(-pslope[1]-deltapt[1])*pmag*boardScale*hscale);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
    
    //negates perpendicular slope if negative to curve upwarxs
    if((pslope[0]<0&&pslope[1]>0) || (pslope[0]>0&&pslope[1]<0)) pslope[1]=-pslope[1];
    
    ctx.beginPath();
    ctx.moveTo(srcpt[0],srcpt[1]);
    //ctx.quadraticCurveTo(srcpt[0]+deltapt[0]*0.5+pslope[0]*0.2,srcpt[1]+deltapt[1]*0.5+pslope[1]*0.2,endpt[0]-deltapt[0]*hscale*boardScale*pmag,endpt[1]-deltapt[1]*hscale*boardScale*pmag);
    ctx.lineTo(endpt[0]-deltapt[0]*hscale*boardScale*pmag,endpt[1]-deltapt[1]*hscale*boardScale*pmag);
    ctx.strokeStyle = color;
    ctx.lineWidth = boardScale*0.125*0.5;
    ctx.stroke();
    ctx.closePath();
  }
  
  function draw(){
    //canvas part
    //resizes canvas, if necessary
    if(window.innerWidth*dpi!=c.width||window.innerHeight*dpi!=c.height){
      c.width = window.innerWidth*dpi;
      c.height = window.innerHeight*dpi;
      c.style.width = window.innerWidth +"px";
      c.style.height = window.innerHeight +"px";
      console.log("dpi: ",dpi);
    }
    
    
    //console.log(gameState);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpi,dpi);
    ctx.clearRect(0,0,c.width,c.height);
    ctx.translate(CAMERA.x*scale+c.width*0.5*dpiinv, CAMERA.y*scale+c.height*0.5*dpiinv);
    
    //reversals for black client vs white client
    let ymod = playerColor=="white"?1:-1;
    
    if(gameState!=null){
      //draws the board connectors
      for(let tli in gameState.spacetime){
        ctx.strokeStyle = "rgba(140, 50, 215, 0.75)"
        ctx.beginPath();
        if(gameState.spacetime[tli].branch.time>-1) {//filters out start timeline parent
          
          let startpt = [gameState.spacetime[tli].branch.time * (boardScale+boardBuffer)+boardScale, -ymod*(gameState.spacetime[tli].branch.timeline* (boardScale+boardBuffer) )+ (boardScale/2)];
          let endpt = [gameState.spacetime[tli].branch.time* (boardScale+boardBuffer)+boardScale+boardBuffer, -ymod*(gameState.spacetime[tli].timeline* (boardScale+boardBuffer) )+ (boardScale/2)];
          let deltapt = [endpt[0]-startpt[0],endpt[1]-startpt[1]];
          ctx.moveTo(startpt[0],startpt[1]);
          ctx.quadraticCurveTo(startpt[0]+deltapt[0]*0.5, startpt[1], startpt[0]+deltapt[0]*0.5,startpt[1]+deltapt[1]*0.5);
          ctx.quadraticCurveTo(startpt[0]+deltapt[0]*0.5, endpt[1],endpt[0],endpt[1]);
        }
        ctx.lineWidth = boardScale*0.35;
        if((tli>0 && !(-Number(tli)+1 in gameState.spacetime)) || (tli<0 && !(-Number(tli)-1 in gameState.spacetime))) ctx.strokeStyle = tli>0?"rgba(255,255,255,0.75)":"rgba(0,0,0,0.75)";
        else ctx.strokeStyle = "rgba(140, 50, 215, 0.75)";
        ctx.stroke();
        ctx.closePath();
        for(let i =0; i < gameState.spacetime[tli].boards.length; i++){
          if(gameState.spacetime[tli].boards[i]!=null&&i+1<gameState.spacetime[tli].boards.length){
            ctx.beginPath();
            ctx.moveTo(i*(boardScale+boardBuffer)+boardScale,-ymod*(tli* (boardScale+boardBuffer) )+ (boardScale/2));
            ctx.lineTo((i+1)*(boardScale+boardBuffer),-ymod*(tli* (boardScale+boardBuffer) )+ (boardScale/2));
            ctx.lineWidth = boardScale*0.35;
            ctx.stroke();
            ctx.closePath();
          }
        }
      }
      //draws present line
      ctx.beginPath();
      ctx.rect(gameState.present*(boardScale+boardBuffer)+(0.5-0.2)*boardScale, -CAMERA.y*scale-c.height*0.5, 2*(0.2)*boardScale, c.height);
      ctx.fillStyle = gameState.present%2==0?"rgba(255, 255, 255, 0.8)":"rgba(0, 0, 0, 0.8)";
      ctx.fill();
      ctx.closePath();
      //draws color board borders
      for(let tli in gameState.spacetime){
        for(let i=0; i < gameState.spacetime[tli].boards.length;i++){
          if(gameState.spacetime[tli].boards[i]!=null){ //draws board if it exists
            //draws color border
            ctx.beginPath();
            ctx.rect(0+(boardScale+boardBuffer)*i, -ymod*(boardScale+boardBuffer)*gameState.spacetime[tli].timeline,boardScale,boardScale);
            ctx.strokeStyle = i%2==0?"white":"black";
            ctx.lineWidth = boardScale/16;
            ctx.stroke();
            ctx.closePath();
          }
        }
      }
      //draws check board borders
      for(let onemove of gameState.checks[playerColor]){
        ctx.beginPath();
        ctx.rect(0+(boardScale+boardBuffer)*onemove.src.time, -ymod*(boardScale+boardBuffer)*onemove.src.timeline,boardScale,boardScale);
        ctx.strokeStyle = "rgb(204,0,0)";
        ctx.lineWidth = boardScale/16;
        ctx.stroke();
        ctx.closePath();
      }
      //draws the boards
      for(let tli in gameState.spacetime){
        for(let i=0; i < gameState.spacetime[tli].boards.length;i++){
          if(gameState.spacetime[tli].boards[i]!=null){ //draws board if it exists
            //draws board img
            ctx.drawImage(bIMG,0+(boardScale+boardBuffer)*i, -ymod*(boardScale+boardBuffer)*gameState.spacetime[tli].timeline,boardScale,boardScale);
          }
        }
      }
      //draws highlighted last moves
      for(let onemove of gameState.lastMove){
        ctx.beginPath();
        if(playerColor=="white"){
          if(onemove.type== "normal"){
            ctx.rect((boardScale+boardBuffer)*onemove.src.time+boardScale/8*onemove.src.x,-ymod*(boardScale+boardBuffer)*onemove.src.timeline+boardScale/8*(7-onemove.src.y),boardScale/8,boardScale/8);
            ctx.rect((boardScale+boardBuffer)*(onemove.end.time+1)+boardScale/8*onemove.end.x,-ymod*(boardScale+boardBuffer)*onemove.end.timeline+boardScale/8*(7-onemove.end.y),boardScale/8,boardScale/8);
          }
          else if(onemove.type== "castle"){
            ctx.rect((boardScale+boardBuffer)*onemove.src.time+boardScale/8*onemove.src.x,-ymod*(boardScale+boardBuffer)*onemove.src.timeline+boardScale/8*(7-onemove.src.y),boardScale/8,boardScale/8);
            ctx.rect((boardScale+boardBuffer)*(onemove.end.time+1)+boardScale/8*onemove.end.x,-ymod*(boardScale+boardBuffer)*onemove.end.timeline+boardScale/8*(7-onemove.end.y),boardScale/8,boardScale/8);
          }
          else if(onemove.type=="en passant"){
            ctx.rect((boardScale+boardBuffer)*onemove.src.time+boardScale/8*onemove.src.x,-ymod*(boardScale+boardBuffer)*onemove.src.timeline+boardScale/8*(7-onemove.src.y),boardScale/8,boardScale/8);
            ctx.rect((boardScale+boardBuffer)*(onemove.end.time+1)+boardScale/8*onemove.end.x,-ymod*(boardScale+boardBuffer)*onemove.end.timeline+boardScale/8*(7-onemove.end.y),boardScale/8,boardScale/8);
          }
          else if(onemove.type=="time travel"){
            ctx.rect((boardScale+boardBuffer)*onemove.src.time+boardScale/8*onemove.src.x,-ymod*(boardScale+boardBuffer)*onemove.src.timeline+boardScale/8*(7-onemove.src.y),boardScale/8,boardScale/8);
            ctx.rect((boardScale+boardBuffer)*onemove.end.time+boardScale/8*onemove.end.x,-ymod*(boardScale+boardBuffer)*onemove.end.timeline+boardScale/8*(7-onemove.end.y),boardScale/8,boardScale/8);
          }
          else if(onemove.type== "promotion"){
            ctx.rect((boardScale+boardBuffer)*onemove.src.time+boardScale/8*onemove.src.x,-ymod*(boardScale+boardBuffer)*onemove.src.timeline+boardScale/8*(7-onemove.src.y),boardScale/8,boardScale/8);
            ctx.rect((boardScale+boardBuffer)*(onemove.end.time+1)+boardScale/8*onemove.end.x,-ymod*(boardScale+boardBuffer)*onemove.end.timeline+boardScale/8*(7-onemove.end.y),boardScale/8,boardScale/8);
          }
        }
        else{
          if(onemove.type == "normal"){
            ctx.rect((boardScale+boardBuffer)*onemove.src.time+boardScale/8*(7-onemove.src.x),-ymod*(boardScale+boardBuffer)*onemove.src.timeline+boardScale/8*onemove.src.y,boardScale/8,boardScale/8);
            ctx.rect((boardScale+boardBuffer)*(onemove.end.time+1)+boardScale/8*(7-onemove.end.x),-ymod*(boardScale+boardBuffer)*onemove.end.timeline+boardScale/8*onemove.end.y,boardScale/8,boardScale/8);
          }
          else if(onemove.type == "castle"){
            ctx.rect((boardScale+boardBuffer)*onemove.src.time+boardScale/8*(7-onemove.src.x),-ymod*(boardScale+boardBuffer)*onemove.src.timeline+boardScale/8*onemove.src.y,boardScale/8,boardScale/8);
            ctx.rect((boardScale+boardBuffer)*(onemove.end.time+1)+boardScale/8*(7-onemove.end.x),-ymod*(boardScale+boardBuffer)*onemove.end.timeline+boardScale/8*onemove.end.y,boardScale/8,boardScale/8);
          }
          else if(onemove.type == "en passant"){
            ctx.rect((boardScale+boardBuffer)*onemove.src.time+boardScale/8*(7-onemove.src.x),-ymod*(boardScale+boardBuffer)*onemove.src.timeline+boardScale/8*onemove.src.y,boardScale/8,boardScale/8);
            ctx.rect((boardScale+boardBuffer)*(onemove.end.time+1)+boardScale/8*(7-onemove.end.x),-ymod*(boardScale+boardBuffer)*onemove.end.timeline+boardScale/8*onemove.end.y,boardScale/8,boardScale/8);
          }
          else if(onemove.type == "time travel"){
            ctx.rect((boardScale+boardBuffer)*onemove.src.time+boardScale/8*(7-onemove.src.x),-ymod*(boardScale+boardBuffer)*onemove.src.timeline+boardScale/8*onemove.src.y,boardScale/8,boardScale/8);
            ctx.rect((boardScale+boardBuffer)*onemove.end.time+boardScale/8*(7-onemove.end.x),-ymod*(boardScale+boardBuffer)*onemove.end.timeline+boardScale/8*onemove.end.y,boardScale/8,boardScale/8);
          }
          else if(onemove.type == "promotion"){
            ctx.rect((boardScale+boardBuffer)*onemove.src.time+boardScale/8*(7-onemove.src.x),-ymod*(boardScale+boardBuffer)*onemove.src.timeline+boardScale/8*onemove.src.y,boardScale/8,boardScale/8);
            ctx.rect((boardScale+boardBuffer)*(onemove.end.time+1)+boardScale/8*(7-onemove.end.x),-ymod*(boardScale+boardBuffer)*onemove.end.timeline+boardScale/8*onemove.end.y,boardScale/8,boardScale/8);
          }
        }
        ctx.fillStyle = "rgba(255, 255, 0, 0.3)";
        ctx.fill();
        ctx.closePath();
      }
      //draws highlighted current move squares
      for(let onemove of move){
        ctx.beginPath();
        if(playerColor=="white"){
          if(onemove.type== "normal"){
            ctx.rect((boardScale+boardBuffer)*onemove.src.time+boardScale/8*onemove.src.x,-ymod*(boardScale+boardBuffer)*onemove.src.timeline+boardScale/8*(7-onemove.src.y),boardScale/8,boardScale/8);
            ctx.rect((boardScale+boardBuffer)*(onemove.end.time+1)+boardScale/8*onemove.end.x,-ymod*(boardScale+boardBuffer)*onemove.end.timeline+boardScale/8*(7-onemove.end.y),boardScale/8,boardScale/8);
          }
          else if(onemove.type== "castle"){
            ctx.rect((boardScale+boardBuffer)*onemove.src.time+boardScale/8*onemove.src.x,-ymod*(boardScale+boardBuffer)*onemove.src.timeline+boardScale/8*(7-onemove.src.y),boardScale/8,boardScale/8);
            ctx.rect((boardScale+boardBuffer)*(onemove.end.time+1)+boardScale/8*onemove.end.x,-ymod*(boardScale+boardBuffer)*onemove.end.timeline+boardScale/8*(7-onemove.end.y),boardScale/8,boardScale/8);
          }
          else if(onemove.type=="en passant"){
            ctx.rect((boardScale+boardBuffer)*onemove.src.time+boardScale/8*onemove.src.x,-ymod*(boardScale+boardBuffer)*onemove.src.timeline+boardScale/8*(7-onemove.src.y),boardScale/8,boardScale/8);
            ctx.rect((boardScale+boardBuffer)*(onemove.end.time+1)+boardScale/8*onemove.end.x,-ymod*(boardScale+boardBuffer)*onemove.end.timeline+boardScale/8*(7-onemove.end.y),boardScale/8,boardScale/8);
          }
          else if(onemove.type=="time travel"){
            ctx.rect((boardScale+boardBuffer)*onemove.src.time+boardScale/8*onemove.src.x,-ymod*(boardScale+boardBuffer)*onemove.src.timeline+boardScale/8*(7-onemove.src.y),boardScale/8,boardScale/8);
            ctx.rect((boardScale+boardBuffer)*onemove.end.time+boardScale/8*onemove.end.x,-ymod*(boardScale+boardBuffer)*onemove.end.timeline+boardScale/8*(7-onemove.end.y),boardScale/8,boardScale/8);
          }
          else if(onemove.type== "promotion"){
            ctx.rect((boardScale+boardBuffer)*onemove.src.time+boardScale/8*onemove.src.x,-ymod*(boardScale+boardBuffer)*onemove.src.timeline+boardScale/8*(7-onemove.src.y),boardScale/8,boardScale/8);
            ctx.rect((boardScale+boardBuffer)*(onemove.end.time+1)+boardScale/8*onemove.end.x,-ymod*(boardScale+boardBuffer)*onemove.end.timeline+boardScale/8*(7-onemove.end.y),boardScale/8,boardScale/8);
          }
        }
        else{
          if(onemove.type == "normal"){
            ctx.rect((boardScale+boardBuffer)*onemove.src.time+boardScale/8*(7-onemove.src.x),-ymod*(boardScale+boardBuffer)*onemove.src.timeline+boardScale/8*onemove.src.y,boardScale/8,boardScale/8);
            ctx.rect((boardScale+boardBuffer)*(onemove.end.time+1)+boardScale/8*(7-onemove.end.x),-ymod*(boardScale+boardBuffer)*onemove.end.timeline+boardScale/8*onemove.end.y,boardScale/8,boardScale/8);
          }
          else if(onemove.type == "castle"){
            ctx.rect((boardScale+boardBuffer)*onemove.src.time+boardScale/8*(7-onemove.src.x),-ymod*(boardScale+boardBuffer)*onemove.src.timeline+boardScale/8*onemove.src.y,boardScale/8,boardScale/8);
            ctx.rect((boardScale+boardBuffer)*(onemove.end.time+1)+boardScale/8*(7-onemove.end.x),-ymod*(boardScale+boardBuffer)*onemove.end.timeline+boardScale/8*onemove.end.y,boardScale/8,boardScale/8);
          }
          else if(onemove.type == "en passant"){
            ctx.rect((boardScale+boardBuffer)*onemove.src.time+boardScale/8*(7-onemove.src.x),-ymod*(boardScale+boardBuffer)*onemove.src.timeline+boardScale/8*onemove.src.y,boardScale/8,boardScale/8);
            ctx.rect((boardScale+boardBuffer)*(onemove.end.time+1)+boardScale/8*(7-onemove.end.x),-ymod*(boardScale+boardBuffer)*onemove.end.timeline+boardScale/8*onemove.end.y,boardScale/8,boardScale/8);
          }
          else if(onemove.type == "time travel"){
            ctx.rect((boardScale+boardBuffer)*onemove.src.time+boardScale/8*(7-onemove.src.x),-ymod*(boardScale+boardBuffer)*onemove.src.timeline+boardScale/8*onemove.src.y,boardScale/8,boardScale/8);
            ctx.rect((boardScale+boardBuffer)*onemove.end.time+boardScale/8*(7-onemove.end.x),-ymod*(boardScale+boardBuffer)*onemove.end.timeline+boardScale/8*onemove.end.y,boardScale/8,boardScale/8);
          }
          else if(onemove.type == "promotion"){
            ctx.rect((boardScale+boardBuffer)*onemove.src.time+boardScale/8*(7-onemove.src.x),-ymod*(boardScale+boardBuffer)*onemove.src.timeline+boardScale/8*onemove.src.y,boardScale/8,boardScale/8);
            ctx.rect((boardScale+boardBuffer)*(onemove.end.time+1)+boardScale/8*(7-onemove.end.x),-ymod*(boardScale+boardBuffer)*onemove.end.timeline+boardScale/8*onemove.end.y,boardScale/8,boardScale/8);
          }
        }
        ctx.fillStyle = "rgba(100, 0, 155, 0.3)";
        ctx.fill();
        ctx.closePath();
      }
      //highlights selected piece squares
      if(selected!=null && JSON.stringify(deepClone(selected)) in gameState.validMoves){
        ctx.beginPath();
        if(playerColor=="white") ctx.rect((boardScale+boardBuffer)*selected.time+(boardScale/8)*selected.x,-(boardScale+boardBuffer)*selected.timeline+(boardScale/8)*(7-selected.y),boardScale/8,boardScale/8);
        else ctx.rect((boardScale+boardBuffer)*selected.time+(boardScale/8)*(7-selected.x),(boardScale+boardBuffer)*selected.timeline+(boardScale/8)*(selected.y),boardScale/8,boardScale/8);
        ctx.fillStyle = "rgba(0, 153, 25, 0.3)";
        ctx.fill();
        ctx.closePath();
        for(let onemove of gameState.validMoves[JSON.stringify(deepClone(selected))]){
          let ooo = onemove.end;
          let ooox = playerColor=="white"?(boardScale+boardBuffer)*ooo.time+(boardScale/8)*ooo.x:(boardScale+boardBuffer)*ooo.time+(boardScale/8)*(7-ooo.x);
          let oooy = playerColor=="white"?-(boardScale+boardBuffer)*ooo.timeline+(boardScale/8)*(7-ooo.y):(boardScale+boardBuffer)*ooo.timeline+(boardScale/8)*ooo.y;
          ctx.beginPath();
          ctx.rect(ooox,oooy,boardScale/8,boardScale/8);
          ctx.fillStyle = "rgba(0, 153, 25, 0.3)";
          ctx.fill();
          ctx.closePath();
        }
      }
      //draws pieces
      for(let tli in gameState.spacetime){
        for(let i = 0; i < gameState.spacetime[tli].boards.length;i++){
          //b = current board
          let b = gameState.spacetime[tli].boards[i];
          
          if(b!=null){ //draw pieces on the board
            if(playerColor=="white"){
              for(let j = 0; j < 8; j++){
                for(let k = 0; k < 8; k++){
                  ctx.drawImage(pIMG[b[k][j]],(boardScale+boardBuffer)*i+k*boardScale/8, -ymod*(boardScale+boardBuffer)*gameState.spacetime[tli].timeline+(7-j)*boardScale/8,boardScale/8,boardScale/8);
                }
              }
            }
            else if(playerColor=="black"){
              for(let j = 0; j < 8; j++){
                for(let k = 0; k < 8; k++){
                  ctx.drawImage(pIMG[b[7-k][7-j]],(boardScale+boardBuffer)*i+k*boardScale/8, -ymod*(boardScale+boardBuffer)*gameState.spacetime[tli].timeline+(7-j)*boardScale/8,boardScale/8,boardScale/8);
                }
              }
            }
          }
        }
      }
      //draws timeline arrows
      
      //draws check arrows
      for(let onemove of gameState.checks[playerColor]){
        drawArrow(onemove.src,onemove.end,"rgb(204,0,0,0.75)");
      }
    }
    
    if(!socket==null && !socket.connected) statusblip.css('color','red');
    window.requestAnimationFrame(draw);
  }
  
  draw();
  
  //returns canvas coordinate system for mouse coords
  function trueMousePos(mPos){
    return {x: mPos.x-CAMERA.x*scale-c.width*0.5*dpiinv,y: mPos.y-CAMERA.y*scale-c.height*0.5*dpiinv};
  }
  
  //centers camera on a board
  function centerCAM(pos){
    CAMERA.x = -(pos.time*(boardScale+boardBuffer)+boardScale*0.5)/scale;
    CAMERA.y = playerColor=="white"?(pos.timeline*(boardScale+boardBuffer)+boardScale*0.5)/scale:-(pos.timeline*(boardScale+boardBuffer)+boardScale*0.5)/scale;
  }
  
  //disables/enables submission button
  function disableSubmit(){
    //no moves, no submitting
    if(move.length==0){
      $("#submit")[0].disabled = true;
      return;
    }
    
    //moves in present, same color
    let unlocksub = true;
    for(let tli in gameState.spacetime){
      if(((tli>0&&-tli+1 in gameState.spacetime)||(tli<0&&-tli-1 in gameState.spacetime)) && gameState.spacetime[tli].boards.length-1==gameState.present && ((gameState.spacetime[tli].boards.length%2==1&&playerColor=="white")||(gameState.spacetime[tli].boards.length%2==0&&playerColor=="black"))){
        unlocksub = false;
        break;
      }
    }
    //checks that no potential checks are present
    let danger = false;
    gameState.checks[playerColor].forEach(x=>danger = danger||x.src.time==nextPresent);
    if(!unlocksub || danger) $("#submit")[0].disabled = true;
    else $("#submit")[0].disabled = false;
  }
  

  //does move
  function doMove(onemove) {
    let sfxtype = "move";
    console.log(onemove.src.piece,onemove.end.piece);
    if(onemove.src.piece>=0 && onemove.src.piece<10&&onemove.end.piece>=10&&onemove.end.piece<20) sfxtype = 'capture';
    else if(onemove.end.piece>=0 && onemove.end.piece<10&&onemove.src.piece>=10&&onemove.src.piece<20) sfxtype = 'capture';
    else if(onemove.type=="en passant") sfxtype = 'capture';
    
    if(onemove.type == "normal"){
      gameState.spacetime[onemove.src.timeline].boards.push(gameState.spacetime[onemove.src.timeline].boards.last());
      gameState.spacetime[onemove.src.timeline].boards[onemove.src.time+1][onemove.src.x][onemove.src.y] = __;
      gameState.spacetime[onemove.end.timeline].boards[onemove.end.time+1][onemove.end.x][onemove.end.y] = onemove.src.piece;
    }
    else if(onemove.type == "castle"){
      gameState.spacetime[onemove.src.timeline].boards.push(gameState.spacetime[onemove.src.timeline].boards.last());
      gameState.spacetime[onemove.src.timeline].boards[onemove.src.time+1][onemove.src.x][onemove.src.y] = __;
      gameState.spacetime[onemove.end.timeline].boards[onemove.end.time+1][onemove.end.x][onemove.end.y] = onemove.src.piece;
      if(onemove.src.x>onemove.end.x){ //queenside 
        gameState.spacetime[onemove.end.timeline].boards[onemove.end.time+1][3][onemove.end.y] = deepClone(gameState.spacetime[onemove.src.timeline].boards[onemove.src.time+1][0][onemove.src.y]);
        gameState.spacetime[onemove.src.timeline].boards[onemove.src.time+1][0][onemove.src.y] = __;
      }
      else{ //kindside
        gameState.spacetime[onemove.end.timeline].boards[onemove.end.time+1][5][onemove.end.y] = deepClone(gameState.spacetime[onemove.src.timeline].boards[onemove.src.time+1][7][onemove.src.y]);
        gameState.spacetime[onemove.src.timeline].boards[onemove.src.time+1][7][onemove.src.y] = __;
      }
    }
    else if(onemove.type == "en passant"){
      if(onemove.src.timeline==onemove.end.timeline){
        gameState.spacetime[onemove.src.timeline].boards.push(gameState.spacetime[onemove.src.timeline].boards.last());
        let ymod = playerColor=="white"?1:-1;
        gameState.spacetime[onemove.src.timeline].boards[onemove.src.time+1][onemove.end.x][onemove.end.y-ymod] = __;
        gameState.spacetime[onemove.src.timeline].boards[onemove.src.time+1][onemove.src.x][onemove.src.y] = __;
        gameState.spacetime[onemove.end.timeline].boards[onemove.end.time+1][onemove.end.x][onemove.end.y] = onemove.src.piece;
      }
      else{ //time travel en passant, be sad
        //disabling this for now cause multi-timeline en passant is just confusing
      }
    }
    else if(onemove.type == "time travel"){
      //travelling back in time
      if(gameState.spacetime[onemove.end.timeline].boards.length-1>onemove.end.time){
        let bmax = Math.max( ...Object.keys(gameState.spacetime));
        let bmin = Math.min( ...Object.keys(gameState.spacetime));
        let bnew = deepClone(gameState.spacetime[onemove.end.timeline].boards[onemove.end.time]);

        gameState.spacetime[onemove.src.timeline].boards.push(gameState.spacetime[onemove.src.timeline].boards.last());
        gameState.spacetime[onemove.src.timeline].boards[onemove.src.time+1][onemove.src.x][onemove.src.y] = __;
        bnew[onemove.end.x][onemove.end.y] = onemove.src.piece;

        if(playerColor=="white"){
          gameState.spacetime[bmax+1] = new Timeline({src:{time:onemove.end.time,timeline:onemove.end.timeline},init:bnew,id:bmax+1});
        }
        else{
          gameState.spacetime[bmin-1] = new Timeline({src:{time:onemove.end.time,timeline:onemove.end.timeline},init:bnew,id:bmin-1});
        }
      }
      //travelling onto another board, no new timelines created
      else{
        gameState.spacetime[onemove.src.timeline].boards.push(gameState.spacetime[onemove.src.timeline].boards.last());
        gameState.spacetime[onemove.end.timeline].boards.push(gameState.spacetime[onemove.end.timeline].boards.last());
        gameState.spacetime[onemove.src.timeline].boards[onemove.src.time+1][onemove.src.x][onemove.src.y] = __;
        gameState.spacetime[onemove.end.timeline].boards[onemove.end.time+1][onemove.end.x][onemove.end.y] = onemove.src.piece;
      }
    }
    else if(onemove.type== "promotion"){
      showPawnPromotionPrompt(function(p) {
        gameState.spacetime[onemove.src.timeline].boards.push(gameState.spacetime[onemove.src.timeline].boards.last());
        gameState.spacetime[onemove.src.timeline].boards[onemove.src.time+1][onemove.src.x][onemove.src.y] = __;
        gameState.spacetime[onemove.end.timeline].boards[onemove.end.time+1][onemove.end.x][onemove.end.y] = playerColor=="white"?p:p+10;
        onemove.src.piece = playerColor=="white"?p:p+10;

        move.push(onemove);
        centerCAM({time:onemove.src.time+1,timeline:onemove.src.timeline});
        socket.emit('recalc',{gameID: gameID, player:playerColor, data:gameState.spacetime});

        disableSubmit();

        messages.empty();
      });
    }
    else if(onemove.type == "debug"){
      gameState.spacetime[onemove.src.timeline].boards.push(gameState.spacetime[onemove.src.timeline].boards.last());
      gameState.spacetime[onemove.src.timeline].boards[onemove.src.time+1][onemove.src.x][onemove.src.y] = __;
      gameState.spacetime[onemove.end.timeline].boards[onemove.end.time+1][onemove.end.x][onemove.end.y] = onemove.src.piece;
    }
    //except promotion type b/c promotion has pop-up that needs input first
    if(onemove.type!="promotion"){
      move.push(onemove);
      centerCAM({time:onemove.src.time+1,timeline:onemove.src.timeline});
      socket.emit('recalc',{gameID: gameID, player:playerColor, data:gameState.spacetime});
      
      disableSubmit();
    }
    
    //play the sound
    sfx[sfxtype].play();
  }
  
  c.addEventListener("mousedown",e=>{
    let xx = e.clientX - c.getBoundingClientRect().left;
    let yy = e.clientY - c.getBoundingClientRect().top;
    
    let x = trueMousePos({x:xx,y:yy}).x;
    let y = trueMousePos({x:xx,y:yy}).y;
    
    if(gameState.status!="ongoing") {
      mouseDownPos = [xx,yy];
      cameraDownPos = deepClone(CAMERA);
      return;
    }
        
    console.log("click at: ",x,y);
    let addon = {timeline:null,time:null,x:null,y:null,piece:null};
    let ymod = playerColor=="white"?1:-1;
    for(let tli in gameState.spacetime){
      tli = Number(tli);
      if(playerColor=="black"){
        if (y>tli*boardScale+boardBuffer*tli && y<(tli+1)*boardScale+boardBuffer*tli){
          addon.timeline = Number(tli);
          break;
        }  
      }
      else{
        if (y>-tli*boardScale-boardBuffer*tli && y<-(tli-1)*boardScale-boardBuffer*tli){
          addon.timeline = Number(tli);
          break;
        }  
      }
    }
    if(addon.timeline==null) {
      console.log("No timeline found");
      mouseDownPos = [xx,yy];
      cameraDownPos = deepClone(CAMERA);
      return;
    }
    
    for(let ti =0; ti< gameState.spacetime[addon.timeline].boards.length; ti++){
      if (gameState.spacetime[addon.timeline].boards[ti]!=null && x>ti*boardScale+boardBuffer*ti && x<(ti+1)*boardScale+boardBuffer*ti){
        addon.time = Number(ti);
        break;
      }
    }
    if(addon.time==null) {
      console.log("No time found");
      mouseDownPos = [xx,yy];
      cameraDownPos = deepClone(CAMERA);
      return;
    }
    
    for(let i= 0; i < 8; i++){
      if (x>addon.time*(boardScale+boardBuffer)+boardScale/8*i && x<addon.time*(boardScale+boardBuffer)+boardScale/8*(i+1)){
        addon.x = playerColor=="white"?i:7-i;
        break;
      }
    }
    if(addon.x==null) {
      console.log("No boardx found");
      mouseDownPos = [xx,yy];
      cameraDownPos = deepClone(CAMERA);
      return;
    }
    
    for(let i= 0; i < 8; i++){
      
      if (y>-ymod*addon.timeline*(boardScale+boardBuffer)+boardScale/8*i && y<-ymod*addon.timeline*(boardScale+boardBuffer)+boardScale/8*(i+1)){
        addon.y = playerColor=="white"?7-i:i;
        addon.piece = gameState.spacetime[addon.timeline].boards[addon.time][addon.x][addon.y];
        break;
      }
    }
    if(addon.y==null) {
      console.log("No boardy found");
      mouseDownPos = [xx,yy];
      cameraDownPos = deepClone(CAMERA);
      return;
    }
        
    console.log("Board Pos: ", addon);
    if(selected==null){
      if(!((addon.piece>-1&&addon.piece<10&&playerColor=="white"&&addon.time%2==0) || (addon.piece>9&&addon.piece<20&&playerColor=="black"&&addon.time%2==1))) return;
      selected= addon;
      //not a valid move start position, back to null
      if(!(JSON.stringify(deepClone(selected)) in gameState.validMoves)) selected = null;
    }
    else if(selected.x==addon.x&&selected.y==addon.y&&selected.time==addon.time&&selected.timeline==addon.timeline) selected = null;
    else{
      let validEndMove = false;
      for(let onemove of gameState.validMoves[JSON.stringify(deepClone(selected))]){
        let ed = onemove.end;
        if(ed.x==addon.x&&ed.y==addon.y&&ed.time==addon.time&&ed.timeline==addon.timeline){
          validEndMove = true;
          doMove(onemove);
        }
      }
      if(!validEndMove) return;
      else $("#undo")[0].disabled = false;
      
      selected = null;
    }
    
  });
  c.addEventListener("mousemove", e => {
    //drags camera
    if(mouseDownPos!=null){
      let x = e.clientX - c.getBoundingClientRect().left;
      let y = e.clientY - c.getBoundingClientRect().top;
      CAMERA.x = cameraDownPos.x+ (x-mouseDownPos[0])/scale;
      CAMERA.y = cameraDownPos.y + (y-mouseDownPos[1])/scale;
    }
    else{
      // CAMERA.x -= e.movementX*0.2/scale;
      // CAMERA.y -= e.movementY*0.2/scale;
    }
  });
  c.addEventListener("mouseup",e=>{
    let x = e.clientX - c.getBoundingClientRect().left;
    let y = e.clientY - c.getBoundingClientRect().top;
    
    mouseDownPos = null;
    cameraDownPos = null;
  });
  c.addEventListener("onwheel",e=>{
    console.log(e);
    boardScale+=e.deltaY;
    boardBuffer+=e.deltaY;
  });
  
  
  /**
   * Initialize the UI
   */
  var init = function(config) {
    gameID      = config.gameID;
    playerColor = config.playerColor;
    playerName  = config.playerName;

    container           = $('#game');
    messages            = $('#messages');
    gameOverMessage     = $('#game-over');
    pawnPromotionPrompt = $('#pawn-promotion');
    forfeitPrompt       = $('#forfeit-game');
    statusblip          = $('#status');
    
    // Set the radio button images
    
    if(playerColor=="white"){
      document.getElementById("N").src = 'https://cdn.glitch.com/5e0f9006-3453-41ad-b0eb-222438390afa%2FwN.svg?v=1617102031915';
      document.getElementById("B").src = 'https://cdn.glitch.com/5e0f9006-3453-41ad-b0eb-222438390afa%2FwB.svg?v=1617102037456';
      document.getElementById("R").src = 'https://cdn.glitch.com/5e0f9006-3453-41ad-b0eb-222438390afa%2FwR.svg?v=1617102031925';
      document.getElementById("Q").src = 'https://cdn.glitch.com/5e0f9006-3453-41ad-b0eb-222438390afa%2FwQ.svg?v=1617102031643';
    }
    else{
      document.getElementById("N").src = 'https://cdn.glitch.com/5e0f9006-3453-41ad-b0eb-222438390afa%2FbN.svg?v=1617102119524';
      document.getElementById("B").src = 'https://cdn.glitch.com/5e0f9006-3453-41ad-b0eb-222438390afa%2FbB.svg?v=1619264125655';
      document.getElementById("R").src = 'https://cdn.glitch.com/5e0f9006-3453-41ad-b0eb-222438390afa%2FbR.svg?v=1617102119358';
      document.getElementById("Q").src = 'https://cdn.glitch.com/5e0f9006-3453-41ad-b0eb-222438390afa%2FbQ.svg?v=1617102119676';
      
    }

    // Create socket connection
    socket = io.connect();


    // Attach event handlers
    attachSocketEventHandlers();
    attachDOMEventHandlers();

    // Initialize modal popup windows
    gameOverMessage.modal({show: false, keyboard: false, backdrop: 'static'});
    pawnPromotionPrompt.modal({show: false, keyboard: false, backdrop: 'static'});
    forfeitPrompt.modal({show: false, keyboard: false, backdrop: 'static'});

    // Join game
    socket.emit('join', gameID);
  };
  
  var attachSocketEventHandlers = function() {

    // Update UI with new game state
    socket.on('update', function(data) {
      console.log(data);
      gameState = data;
      move = [];
      if(gameState.status=="ongoing") {
        statusblip.css('color','green');
        sfx['notification'].play();
      }
      else statusblip.css('color','yellow');
      
      $("#submit")[0].disabled = true;
      $("#undo")[0].disabled = true;
    });
    //recieveing validMove computation updates
    socket.on('recalc',function(data){
      if(playerColor==data.player){
        console.log("Calculation requested! Data received: ",data.data);
        gameState.validMoves = data.data.validMoves;
        gameState.checks = data.data.checks;
        //stores next present for submission check calculations
        nextPresent = data.data.present;
        //disables submitting
        disableSubmit();
      }
    });

    // Display an error
    socket.on('error', function(data) {
      console.log(data);
      showErrorMessage(data);
    });
  };

  
  //attaches DOM event handlers
  var attachDOMEventHandlers = function() {
    container.on('click', '#forfeit', function(ev) {
      showForfeitPrompt(function(confirmed) {
        if (confirmed) {
          messages.empty();
          socket.emit('forfeit', gameID);
        }
      });
    });
    container.on('click', '#submit', function(ev) {
      if(gameState.status!="ongoing" || move.length==0) return;
      console.log("submitting");
      $("#submit")[0].disabled = true;
      socket.emit('move',{player:playerColor,gameID:gameID, move:move});
    });
    container.on('click', '#undo', function(ev) {
      //no moves to undo, exits
      if(move.length==0) return;
      
      let onemove = move.pop();
       
      if(onemove.type == "normal"){
        gameState.spacetime[onemove.src.timeline].boards.pop();
        gameState.spacetime[onemove.src.timeline].boards[onemove.src.time][onemove.src.x][onemove.src.y] = onemove.src.piece;
        gameState.spacetime[onemove.end.timeline].boards[onemove.end.time][onemove.end.x][onemove.end.y] = onemove.end.piece;
      }
      else if(onemove.type == "castle"){

      }
      else if(onemove.type == "en passant"){

      }
      else if(onemove.type == "time travel"){

      }
      else if(onemove.type == "promotion"){
        
      }
      else if(onemove.type == "debug"){
        gameState.spacetime[onemove.src.timeline].boards.push(gameState.spacetime[onemove.src.timeline].boards.last());
        gameState.spacetime[onemove.src.timeline].boards[onemove.src.time+1][onemove.src.x][onemove.src.y] = __;
        gameState.spacetime[onemove.end.timeline].boards[onemove.end.time+1][onemove.end.x][onemove.end.y] = onemove.src.piece;
      }
      //recalculates moves and checks
      socket.emit('recalc',{gameID: gameID, player:playerColor, data:gameState.spacetime});
      
      //shifts camera back
      centerCAM({time:onemove.src.time,timeline:onemove.src.timeline});
      
      //disableds button if no moves 
      if(move.length==0) $("#undo")[0].disabled = true;
      
    });
  }

  /**
   * Update UI from game state
   */
  var update = function() {
    var you, opponent = null;

    var container, name, status, captures = null;

    // Update player info
    for (var i=0; i<gameState.players.length; i++) {

      // Determine if player is you or opponent
      if (gameState.players[i].color === playerColor) {
        you = gameState.players[i];
        container = $('#you');
      }
      else if (gameState.players[i].color !== playerColor) {
        opponent = gameState.players[i];
        container = $('#opponent');
      }

      name     = container.find('strong');
      status   = container.find('.status');
      captures = container.find('ul');

      // Name
      if (gameState.players[i].name) {
        name.text(gameState.players[i].name);
      }

      // Active Status
      container.removeClass('active-player');
      if (gameState.activePlayer && gameState.activePlayer.color === gameState.players[i].color) {
        container.addClass('active-player');
      }

      // Check Status
      status.removeClass('label label-danger').text('');
      if (gameState.players[i].inCheck) {
        status.addClass('label label-danger').text('Check');
      }
    }

    

    // Test for checkmate
    if (gameState.status === 'checkmate') {
      if (opponent.inCheck) { showGameOverMessage('checkmate-win');  }
      if (you.inCheck)      { showGameOverMessage('checkmate-lose'); }
    }

    // Test for stalemate
    if (gameState.status === 'stalemate') { showGameOverMessage('stalemate'); }

    // Test for forfeit
    if (gameState.status === 'forfeit') {
      if (opponent.forfeited) { showGameOverMessage('forfeit-win');  }
      if (you.forfeited)      { showGameOverMessage('forfeit-lose'); }
    }
  };

  /**
   * Display an error message on the page
   */
  var showErrorMessage = function(data) {
    var msg, html = '';

    if (data == 'handshake unauthorized') {
      msg = 'Client connection failed';
    } else {
      msg = data.message;
    }

  };

  /**
   * Display the "Game Over" window
   */
  var showGameOverMessage = function(type) {
    var header = gameOverMessage.find('h2');

    // Set the header's content and CSS classes
    header.removeClass('alert-success alert-danger alert-warning');
    switch (type) {
      case 'checkmate-win'  : header.addClass('alert-success').text('Checkmate'); break;
      case 'checkmate-lose' : header.addClass('alert-danger').text('Checkmate'); break;
      case 'forfeit-win'    : header.addClass('alert-success').text('Your opponent has forfeited the game'); break;
      case 'forfeit-lose'   : header.addClass('alert-danger').text('You have forfeited the game'); break;
      case 'stalemate'      : header.addClass('alert-warning').text('Stalemate'); break;
    }

    gameOverMessage.modal('show');
  };

  /**
   * Display the "Pawn Promotion" prompt
   */
  var showPawnPromotionPrompt = function(callback) {
    // Temporarily attach click handler for the Promote button, note the use of .one()
    pawnPromotionPrompt.one('click', 'button', function(ev) {
      var selection = pawnPromotionPrompt.find("input[type='radio'][name='promotion']:checked").val();
      callback(selection);
      pawnPromotionPrompt.modal('hide');
    });

    pawnPromotionPrompt.modal('show');
  };

  /**
   * Display the "Forfeit Game" confirmation prompt
   */
  var showForfeitPrompt = function(callback) {

    // Temporarily attach click handler for the Cancel button, note the use of .one()
    forfeitPrompt.one('click', '#cancel-forfeit', function(ev) {
      callback(false);
      forfeitPrompt.modal('hide');
    });

    // Temporarily attach click handler for the Confirm button, note the use of .one()
    forfeitPrompt.one('click', '#confirm-forfeit', function(ev) {
      callback(true);
      forfeitPrompt.modal('hide');
    });

    forfeitPrompt.modal('show');
  };

  /**
   * Get the corresponding CSS classes for a given piece
   */
  var getPieceClasses = function(piece) {
    switch (piece) {
      case 'bP'  : return 'black pawn';
      case 'bP_' : return 'black pawn not-moved';
      case 'bR'  : return 'black rook';
      case 'bR_' : return 'black rook not-moved';
      case 'bN'  : return 'black knight';
      case 'bN_' : return 'black knight not-moved';
      case 'bB'  : return 'black bishop';
      case 'bB_' : return 'black bishop not-moved';
      case 'bQ'  : return 'black queen';
      case 'bQ_' : return 'black queen not-moved';
      case 'bK'  : return 'black king';
      case 'bK_' : return 'black king not-moved';
      case 'wP'  : return 'white pawn';
      case 'wP_' : return 'white pawn not-moved';
      case 'wR'  : return 'white rook';
      case 'wR_' : return 'white rook not-moved';
      case 'wN'  : return 'white knight';
      case 'wN_' : return 'white knight not-moved';
      case 'wB'  : return 'white bishop';
      case 'wB_' : return 'white bishop not-moved';
      case 'wQ'  : return 'white queen';
      case 'wQ_' : return 'white queen not-moved';
      case 'wK'  : return 'white king';
      case 'wK_' : return 'white king not-moved';
      default    : return 'empty';
    }
  };

  return init;

}(window));

//timeline object
class Timeline{
  
  //source timeline
  //console.log(params);
  constructor(params){
    this.branch = {timeline: params.src.timeline, time:params.src.time};

    //self info
    this.timeline = params.id;

    //list of pairs of coordinates to draw time travel arrows
    this.travelaway = [];

    //stores the list of boards in the timeline
    this.boards = [];
    for(var i = 0; i < params.src.time+1;i++){
      this.boards.push(null);
    }
    this.boards.push(params.init);
  }
  
}

