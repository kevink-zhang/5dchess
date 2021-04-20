const c = document.querySelector("#c");
const ctx = c.getContext("2d");

//defining constants so I dont need to quote
const boardScale = 200;

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

var Client = (function(window) {

  var socket      = null;
  var gameState   = null;
  //NOTE: gameState.validMoves keys should be stringified before referencing

  var gameID      = null;
  var playerColor = null;
  var playerName  = null;

  var container   = null;
  var messages    = null;
  

  var move = {}; 

  var selection   = null;
  var CAMERA      = {x:200,y:200};

  var gameOverMessage     = null;
  var pawnPromotionPrompt = null;
  var forfeitPrompt       = null;


  
  
  
  //canvas part
  //c.style.width = "800px";
  //c.style.height = "800px";
  
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
  
  function draw(){
    //resizes canvas, if necessary
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    
    //console.log(gameState);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0,0,c.width,c.height);
    ctx.translate(CAMERA.x, CAMERA.y);
    
    //reversals for black client vs white client
    let ymod = playerColor=="white"?1:-1;
    
    if(gameState!=null){
      for(let tli in gameState.spacetime){
        //draws the timeline branching lines
        ctx.beginPath();
        if(gameState.spacetime[tli].branch.time>-1) {//filters out start timeline
          ctx.moveTo(gameState.spacetime[tli].branch.time * (boardScale+20)+boardScale, -ymod*(gameState.spacetime[tli].branch.timeline* (boardScale+20) )+ (boardScale/2));
          ctx.lineTo(gameState.spacetime[tli].branch.time* (boardScale+20)+boardScale+20, -ymod*(gameState.spacetime[tli].timeline* (boardScale+20) )+ (boardScale/2));
        }
        ctx.strokeStyle = "purple";
        ctx.stroke();
        ctx.closePath();
        for(let i = 0; i < gameState.spacetime[tli].boards.length;i++){
          //b = current board
          let b = gameState.spacetime[tli].boards[i];
          
          if(b!=null){ //draw pieces on the board
            ctx.drawImage(bIMG,0+(boardScale+20)*i, -ymod*(boardScale+20)*gameState.spacetime[tli].timeline,boardScale,boardScale);
            if(playerColor=="white"){
              for(let j = 0; j < 8; j++){
                for(let k = 0; k < 8; k++){
                  ctx.drawImage(pIMG[b[k][j]],(boardScale+20)*i+k*boardScale/8, -ymod*(boardScale+20)*gameState.spacetime[tli].timeline+(7-j)*boardScale/8,boardScale/8,boardScale/8);
                }
              }
            }
            else if(playerColor=="black"){
              for(let j = 0; j < 8; j++){
                for(let k = 0; k < 8; k++){
                  ctx.drawImage(pIMG[b[7-k][7-j]],(boardScale+20)*i+k*boardScale/8, -ymod*(boardScale+20)*gameState.spacetime[tli].timeline+(7-j)*boardScale/8,boardScale/8,boardScale/8);
                }
              }
            }
          }
        }
      }
      
      if(selected!=null && JSON.stringify(deepClone(selected)) in gameState.validMoves){
        ctx.beginPath();
        if(playerColor=="white") ctx.rect((boardScale+20)*selected.time+(boardScale/8)*selected.x,-(boardScale+20)*selected.timeline+(boardScale/8)*(7-selected.y),boardScale/8,boardScale/8);
        else ctx.rect((boardScale+20)*selected.time+(boardScale/8)*(7-selected.x),(boardScale+20)*selected.timeline+(boardScale/8)*(selected.y),boardScale/8,boardScale/8);
        ctx.strokeStyle = "blue";
        ctx.stroke();
        ctx.closePath();
        for(let onemove of gameState.validMoves[JSON.stringify(deepClone(selected))]){
          let ooo = onemove.end;
          let ooox = playerColor=="white"?(boardScale+20)*ooo.time+(boardScale/8)*ooo.x:(boardScale+20)*ooo.time+(boardScale/8)*(7-ooo.x);
          let oooy = playerColor=="white"?-(boardScale+20)*ooo.timeline+(boardScale/8)*(7-ooo.y):(boardScale+20)*ooo.timeline+(boardScale/8)*ooo.y;
          ctx.beginPath();
          ctx.rect(ooox,oooy,boardScale/8,boardScale/8);
          ctx.strokeStyle = "green";
          ctx.stroke();
          ctx.closePath();
        }
      }
    }
    window.requestAnimationFrame(draw);
  }
  
  draw();
  
  c.addEventListener("mousedown",e=>{
    let xx = e.clientX - c.getBoundingClientRect().left;
    let yy = e.clientY - c.getBoundingClientRect().top;
    
    let x = xx-CAMERA.x;
    let y = yy-CAMERA.y;
    
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
        if (y>tli*boardScale+20*tli && y<(tli+1)*boardScale+20*tli){
          addon.timeline = Number(tli);
          break;
        }  
      }
      else{
        if (y>-tli*boardScale-20*tli && y<-(tli-1)*boardScale-20*tli){
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
      if (gameState.spacetime[addon.timeline].boards[ti]!=null && x>ti*boardScale+20*ti && x<(ti+1)*boardScale+20*ti){
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
      if (x>addon.time*(boardScale+20)+boardScale/8*i && x<addon.time*(boardScale+20)+boardScale/8*(i+1)){
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
      
      if (y>-ymod*addon.timeline*(boardScale+20)+boardScale/8*i && y<-ymod*addon.timeline*(boardScale+20)+boardScale/8*(i+1)){
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
      if(!((addon.piece>-1&&addon.piece<10&&playerColor=="white") || (addon.piece>9&&addon.piece<20&&playerColor=="black"))) return;
      selected= addon;
      //not a valid move start position, back to null
      if(!(JSON.stringify(deepClone(selected)) in gameState.validMoves)) selected = null;
    }
    else if(selected.x==addon.x&&selected.y==addon.y&&selected.time==addon.time&&selected.timeline==addon.timeline) selected = null;
    else{
      //not a valid end move pos, sed
      let validEndMove = false;
      for(let onemove of gameState.validMoves[JSON.stringify(deepClone(selected))]){
        let ed = onemove.end;
        if(ed.x==addon.x&&ed.y==addon.y&&ed.time==addon.time&&ed.timeline==addon.timeline){
          validEndMove = true;
          
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
              gameState.spacetime[onemove.src.timeline].boards[onemove.src.time+1][onemove.src.x][onemove.src.y-ymod] = __;
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
          else if(onemove.type == "debug"){
            gameState.spacetime[onemove.src.timeline].boards.push(gameState.spacetime[onemove.src.timeline].boards.last());
            gameState.spacetime[onemove.src.timeline].boards[onemove.src.time+1][onemove.src.x][onemove.src.y] = __;
            gameState.spacetime[onemove.end.timeline].boards[onemove.end.time+1][onemove.end.x][onemove.end.y] = onemove.src.piece;
          }
          move.push(onemove);
          CAMERA.x-=boardScale+20;
          socket.emit('recalc',{gameID: gameID, player:playerColor, data:gameState.spacetime});
          
          break;
        }
      }
      if(!validEndMove) return;
      //socket.emit('move',{gameID:gameID, move:[{src:selected,end:addon,type:"debug"}]});
      
      selected = null;
    }
    
  });
  c.addEventListener("mousemove", e => {
    //drags camera
    if(mouseDownPos!=null){
      let x = e.clientX - c.getBoundingClientRect().left;
      let y = e.clientY - c.getBoundingClientRect().top;
      CAMERA.x = cameraDownPos.x+ x-mouseDownPos[0];
      CAMERA.y = cameraDownPos.y + y-mouseDownPos[1];
    }
  });
  c.addEventListener("mouseup",e=>{
    let x = e.clientX - c.getBoundingClientRect().left;
    let y = e.clientY - c.getBoundingClientRect().top;
    
    mouseDownPos = null;
    cameraDownPos = null;
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
      //update();
    });
    //recieveing validMove computation updates
    socket.on('recalc',function(data){
      if(playerColor==data.player){
        console.log("Calculation requested! Valid moves: ",data.data);
        gameState.validMoves = data.data;
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
      socket.emit('move',{gameID:gameID, move:move});
    });
    container.on('click', '#undo', function(ev) {
      if(move.length==0) return;
      
      let onemove = move.pop();
       
      if(onemove.type == "normal"){
        gameState.spacetime[onemove.src.timeline].boards.push(gameState.spacetime[onemove.src.timeline].boards.last());
        gameState.spacetime[onemove.src.timeline].boards[onemove.src.time+1][onemove.src.x][onemove.src.y] = __;
        gameState.spacetime[onemove.end.timeline].boards[onemove.end.time+1][onemove.end.x][onemove.end.y] = onemove.src.piece;
      }
      else if(onemove.type == "castle"){

      }
      else if(onemove.type == "en passant"){

      }
      else if(onemove.type == "time travel"){

      }
      else if(onemove.type == "debug"){
        gameState.spacetime[onemove.src.timeline].boards.push(gameState.spacetime[onemove.src.timeline].boards.last());
        gameState.spacetime[onemove.src.timeline].boards[onemove.src.time+1][onemove.src.x][onemove.src.y] = __;
        gameState.spacetime[onemove.end.timeline].boards[onemove.end.time+1][onemove.end.x][onemove.end.y] = onemove.src.piece;
      }
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

    // Set the pieces' color to match the player's color
    pawnPromotionPrompt.find('label').removeClass('black white').addClass(playerColor);

    // Temporarily attach click handler for the Promote button, note the use of .one()
    pawnPromotionPrompt.one('click', 'button', function(ev) {
      var selection = pawnPromotionPrompt.find("input[type='radio'][name='promotion']:checked").val();
      callback('p'+selection);
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

