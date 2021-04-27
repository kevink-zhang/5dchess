var _ = require('underscore');

//defining constants so I dont need to quote
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
// const initBoard = [[wR_,  wP_,   __,   __,  __,  __,  bP_,  bR_],
//                   [wN ,  wP_,   __,   __,  __,  __,  bP_,  bN ],
//                   [wB ,  wP_,   __,   __,  __,  __,  bP_,  bB ],
//                   [wQ ,  wP_,   __,   __,  __,  __,  bP_,  bQ ],
//                   [wK_,  wP_,   __,   __,  __,  __,  bP_,  bK_],
//                   [wB ,  wP_,   __,   __,  __,  __,  bP_,  bB ],
//                   [wN ,  wP_,   __,   __,  __,  __,  bP_,  bN ],
//                   [wR_,  wP_,   __,   __,  __,  __,  wP,  bR_]];

//note: time <-> x, timeline <-> y
const Npaths = [[1,2],[-1,2],[1,-2],[-1,-2],[2,1],[2,-1],[-2,1],[-2,-1]];
const Bpaths = [[1,1],[1,-1],[-1,1],[-1,-1]];
const Rpaths = [[1,0],[0,-1],[-1,0],[0,1]];
const Ppaths = [[1,1],[-1,1]]; //note: y*= -1 for black //note2: this is for normal capture movement only
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
/*
 * The Game object
 */

/**
 * Create new game and initialize
 */
function Game(params) {

  // pending/ongoing/checkmate/stalemate/forfeit
  this.status = 'pending';

  this.activePlayer = null;

  this.players = [
    {color: null, name: null, joined: false, inCheck: false, forfeited: false},
    {color: null, name: null, joined: false, inCheck: false, forfeited: false}
  ];
  
  //spacetime, indexed by timeline
  this.spacetime = {0:new Timeline({src:{time:-1,timeline:-1},init:initBoard,id:0})};
  
  //present bar
  this.present = 0;
  
  //move format: src(pos+piece), end(pos+piece), type(string)
  //pos format: timeline, time, x, y

  this.lastMove = [];
  
  this.validMoves = null;
  
  this.checks = {white:[],black:[]};
  
  this.modifiedOn = Date.now();

  // Set player colors
  // params.playerColor is the color of the player who created the game
  if (params.playerColor === 'white') {
    this.players[0].color = 'white';
    this.players[1].color = 'black';
  }
  else if (params.playerColor === 'black') {
    this.players[0].color = 'black';
    this.players[1].color = 'white';
  }
}

/**
 * Add player to game, and after both players have joined activate the game.
 * Returns true on success and false on failure.
 */
Game.prototype.addPlayer = function(playerData) {

  // Check for an open spot
  var p = _.findWhere(this.players, {color: playerData.playerColor, joined: false});
  if (!p) { return false; }

  // Set player info
  p.name = playerData.playerName;
  p.joined = true;

  // If both players have joined, start the game
  if (this.players[0].joined && this.players[1].joined && this.status === 'pending') {
    this.activePlayer = _.findWhere(this.players, {color: 'white'});
    this.status = 'ongoing';
  }

  this.modifiedOn = Date.now();

  return true;
};

/**
 * Remove player from game, this does not end the game, players may come and go as they please.
 * Returns true on success and false on failure.
 */
Game.prototype.removePlayer = function(playerData) {

  // Find player in question
  var p = _.findWhere(this.players, {color: playerData.playerColor});
  if (!p) { return false; }

  // Set player info
  p.joined = false;

  this.modifiedOn = Date.now();

  return true;
};

//checks to see if a position is a valid location
Game.prototype.validPos = function(pos){
  if(pos.x>-1 && pos.x<8 && pos.y>-1 && pos.y<8) 
    if(pos.timeline in this.spacetime)
      if(pos.time>-1 && pos.time<this.spacetime[pos.timeline].boards.length)
        if(this.spacetime[pos.timeline].boards[pos.time]!=null)
          return true;
  return false;
}

//checks color based on piece
Game.prototype.getTeam = function(piece){
  if(piece.piece>-100) piece = piece.piece;
  else if(piece.x>-1){ //is position input, convert to piece
    piece = this.spacetime[piece.timeline].boards[piece.time][piece.x][piece.y];
  }
  if(piece<0) return "none";
  if(piece>-1 && piece<10) return "white";
  if(piece>9&&piece<20) return "black";
  return null;
}

//returns piece value at position
Game.prototype.getPiece = function(pos){
  if(!this.validPos(pos)) return false;
  return this.spacetime[pos.timeline].boards[pos.time][pos.x][pos.y];
}

//adds move p2 to position p1 and returns new position, order DOES matter
Game.prototype.addPos = function(p1,p2){
  let ret = {x:p1.x+p2.x,y:p1.y+p2.y,timeline:Number(p1.timeline)+Number(p2.timeline),time:Number(p1.time)+2*Number(p2.time)};
  //NOTE: time is scaled x2 due to black/white both on time
  if(!this.validPos(ret)) {
    return {x:-1,y:-1,time:-1,timeline:-1,piece:-100};
  }
  if(p1.piece) {
    let pp = this.getPiece(ret);
    return {x:ret.x,y:ret.y,timeline:ret.timeline,time:ret.time,piece:pp};
  }
  return ret;
}

//returns the lists of pair of positions that are checking and in check 
Game.prototype.getChecks = function(){
  let ret = {"white":[],"black":[]};
  for(let tli in this.spacetime){
    for(let ooo = 0; ooo < this.spacetime[tli].boards.length; ooo++){
      let b = this.spacetime[tli].boards[ooo];
      if(b!=null){
        for(let i = 0; i < 8; i++){
          for(let j = 0; j < 8; j++){
            if(b[i][j]==wK || b[i][j]==wK_){
              let allchecks = this.findChecks({x:i,y:j,timeline:tli,time:ooo},"white");
              for(let x of allchecks){
                if(x.time==this.spacetime[x.timeline].boards.length-1){
                  ret["white"].push({src:x,end:{x:i,y:j,timeline:Number(tli),time:ooo}})
                }
              }
            }
            else if(b[i][j]==bK || b[i][j]==bK_){
              let allchecks = this.findChecks({x:i,y:j,timeline:tli,time:ooo},"black");
              for(let x of allchecks){
                console.dir(x);
                if(x.time==this.spacetime[x.timeline].boards.length-1){
                  ret["black"].push({src:x,end:{x:i,y:j,timeline:Number(tli),time:ooo}})
                }
              }
            }
          }
        }
      }
    }
  }
  this.checks = ret;
}

//checks to see if the position is being attacked by enemy pieces
Game.prototype.findChecks = function(pos,team){
  let ret = [];
  let modifier = team=="white"? 10:0;
  //checks for knight attacks
  for(let delta of Npaths){
    //combines all time/space combos for 2 axis
    let newpos = this.addPos(pos,{x:delta[0],y:delta[1],time:0,timeline:0});
    if(this.validPos(newpos)&& this.getPiece(newpos)==wN+modifier) ret.push(newpos);
    
    newpos = this.addPos(pos,{x:delta[0],y:0,time:0,timeline:delta[1]});
    if(this.validPos(newpos)&& this.getPiece(newpos)==wN+modifier) ret.push(newpos);
      
    newpos = this.addPos(pos,{x:0,y:delta[1],time:delta[0],timeline:0});
    if(this.validPos(newpos)&& this.getPiece(newpos)==wN+modifier) ret.push(newpos);
      
    newpos = this.addPos(pos,{x:0,y:0,time:delta[0],timeline:delta[1]});
    if(this.validPos(newpos)&& this.getPiece(newpos)==wN+modifier) ret.push(newpos);
  }
  
  //checks for bishop attacks
  for(let delta of Bpaths){
    let newdeltas = [{x:delta[0],y:delta[1],time:0,timeline:0},{x:delta[0],y:0,time:0,timeline:delta[1]},{x:0,y:delta[1],time:delta[0],timeline:0},{x:0,y:0,time:delta[0],timeline:delta[1]}];
    for(let newdelta of newdeltas){
      while(true){
        let newpos = this.addPos(pos,newdelta);
        //off the board position, break
        if(!this.validPos(newpos)) break;
        //enemy bishop spotted
        if(this.getPiece(newpos)==wB+modifier){
          ret.push(newpos);
          break;
        } 
        //other piece blocking LOS
        if(this.getPiece(newpos)!=__) break;
        //increments the distance along axes
        for(let key in newdelta){
          if(newdelta[key]>0) newdelta[key]++;
          if(newdelta[key]<0) newdelta[key]--;
        }
      }
    }
  }
  
  //checks for rook attacks
  for(let delta of Rpaths){
    let newdeltas = [{x:delta[0],y:delta[1],time:0,timeline:0},{x:delta[0],y:0,time:0,timeline:delta[1]},{x:0,y:delta[1],time:delta[0],timeline:0},{x:0,y:0,time:delta[0],timeline:delta[1]}];
    for(let newdelta of newdeltas){
      while(true){
        let newpos = this.addPos(pos,newdelta);
        //off the board position, break
        if(!this.validPos(newpos)) break;
        //enemy rook spotted
        if(this.getPiece(newpos)==wR+modifier || this.getPiece(newpos)==wR_+modifier) {
          ret.push(newpos);
          break;
        }
        //other piece blocking LOS
        if(this.getPiece(newpos)!=__) break;
        
        //increments the distance along axes
        for(let key in newdelta){
          if(newdelta[key]>0) newdelta[key]++;
          if(newdelta[key]<0) newdelta[key]--;
        }
      }
    }
  }
  
  //checks for pawn attacks
  for(let delta of Ppaths){
    //reverses for black
    let newpos = this.addPos(pos,{x:delta[0],y:team=="white"?delta[1]:-1*delta[1],time:0,timeline:0});
    if(this.validPos(newpos)&& (this.getPiece(newpos)==wP+modifier||this.getPiece(newpos)==wP_+modifier)) ret.push(newpos);
    
    newpos = this.addPos(pos,{x:0,y:0,time:delta[0],timeline:team=="white"?delta[1]:-1*delta[1]});
    if(this.validPos(newpos)&& (this.getPiece(newpos)==wP+modifier||this.getPiece(newpos)==wP_+modifier)) ret.push(newpos);
  }
  
  //checks for queen/king attacks
  for(let delta of Qpaths){
    let newdeltas = [{x:delta[0],y:delta[1],time:delta[2],timeline:delta[3]}];
    for(let newdelta of newdeltas){
      //checks king 1-radius first
      let newpos = this.addPos(pos,newdelta);
      //off the board position, break
      if(this.validPos(newpos) && (this.getPiece(newpos)==wK+modifier||this.getPiece(newpos)==wK_+modifier)) ret.push(newpos);
      
      //checks queen
      while(true){
        let newpos = this.addPos(pos,newdelta);
        //off the board position, break
        if(!this.validPos(newpos)) break;        
        if(this.getPiece(newpos)==wQ+modifier){
          ret.push(newpos);
          break;
        }
        //other piece blocking LOS
        if(this.getPiece(newpos)!=__) break;
        
        //increments the distance along axes
        for(let key in newdelta){
          if(newdelta[key]>0) newdelta[key]++;
          if(newdelta[key]<0) newdelta[key]--;
        }
      }
    }
  }
  return ret;
}

//checks to see if any player is checkmated
//note: you are checkmated if your king remains attacked by an ACTIVE piece. If the piece cannot take your king the next move, then it is not checkmate
Game.prototype.getCheckmate = function(){
  
}

//recalculates the present bar
Game.prototype.findPresent = function() {
  let i = 0;
  let ppp = -1;
  for(let x in this.spacetime) ppp = Math.max(ppp,this.spacetime[x].boards.length);
  while(true){
    //1 shift
    if((i in this.spacetime && -i+1 in this.spacetime)||(i-1 in this.spacetime && -i in this.spacetime)){
      if(i in this.spacetime) ppp = Math.min(ppp,this.spacetime[i].boards.length);
      if(-i in this.spacetime) ppp = Math.min(ppp,this.spacetime[-i].boards.length);
    }
    else break;
    i++;
  }
  this.present = ppp-1;
}

/**
 * Apply move and regenerate game state.
 * Returns true on success and false on failure.
 */
Game.prototype.move = function(moveData) {
  //backups a copy for overriding
  let datacopy = {spacetime:deepClone(this.spacetime),checks:deepClone(this.checks)};
  //iterates and performs each move
  for(let onemove of moveData){
    let pp = onemove.end.piece;
    switch (pp){
      case wP_:
        pp = wP;
        break;
      case wR_:
        pp = wR;
        break;
      case wK_:
        pp = wK;
        break;
      case bP_:
        pp = bP;
        break;
      case bR_:
        pp = bR;
        break;
      case bK_:
        pp = bK;
        break;
    }
    onemove.end.piece = pp;
    
    if(onemove.type == "normal"){
      this.spacetime[onemove.src.timeline].boards.push(this.spacetime[onemove.src.timeline].boards.last());
      this.spacetime[onemove.src.timeline].boards[onemove.src.time+1][onemove.src.x][onemove.src.y] = __;
      this.spacetime[onemove.end.timeline].boards[onemove.end.time+1][onemove.end.x][onemove.end.y] = onemove.src.piece;
    }
    else if(onemove.type == "castle"){
      this.spacetime[onemove.src.timeline].boards.push(this.spacetime[onemove.src.timeline].boards.last());
      this.spacetime[onemove.src.timeline].boards[onemove.src.time+1][onemove.src.x][onemove.src.y] = __;
      this.spacetime[onemove.end.timeline].boards[onemove.end.time+1][onemove.end.x][onemove.end.y] = onemove.src.piece;
      if(onemove.src.x>onemove.end.x){ //queenside 
        this.spacetime[onemove.end.timeline].boards[onemove.end.time+1][3][onemove.end.y] = deepClone(this.spacetime[onemove.src.timeline].boards[onemove.src.time+1][0][onemove.src.y]);
        this.spacetime[onemove.src.timeline].boards[onemove.src.time+1][0][onemove.src.y] = __;
      }
      else{ //kindside
        this.spacetime[onemove.end.timeline].boards[onemove.end.time+1][5][onemove.end.y] = deepClone(this.spacetime[onemove.src.timeline].boards[onemove.src.time+1][7][onemove.src.y]);
        this.spacetime[onemove.src.timeline].boards[onemove.src.time+1][7][onemove.src.y] = __;
      }
    }
    else if(onemove.type == "en passant"){
      if(onemove.src.timeline==onemove.end.timeline){
        this.spacetime[onemove.src.timeline].boards.push(this.spacetime[onemove.src.timeline].boards.last());
        let ymod = this.getTeam(onemove.src.piece)=="white"?1:-1;
        this.spacetime[onemove.src.timeline].boards[onemove.src.time+1][onemove.src.x][onemove.src.y-ymod] = __;
        this.spacetime[onemove.end.timeline].boards[onemove.end.time+1][onemove.end.x][onemove.end.y] = onemove.src.piece;
      }
      else{ //time travel en passant, be sad
        //disabling this for now cause multi-timeline en passant is just confusing
      }
    }
    else if(onemove.type == "time travel"){
      //travelling back in time
      if(this.spacetime[onemove.end.timeline].boards.length-1>onemove.end.time){
        let bmax = Math.max( ...Object.keys(this.spacetime));
        let bmin = Math.min( ...Object.keys(this.spacetime));
        let bnew = deepClone(this.spacetime[onemove.end.timeline].boards[onemove.end.time]);
        
        this.spacetime[onemove.src.timeline].boards.push(this.spacetime[onemove.src.timeline].boards.last());
        this.spacetime[onemove.src.timeline].boards[onemove.src.time+1][onemove.src.x][onemove.src.y] = __;
        bnew[onemove.end.x][onemove.end.y] = onemove.src.piece;
        
        if(this.getTeam(onemove.src.piece)=="white"){
          this.spacetime[bmax+1] = new Timeline({src:{time:onemove.end.time,timeline:onemove.end.timeline},init:bnew,id:bmax+1});
        }
        else{
          this.spacetime[bmin-1] = new Timeline({src:{time:onemove.end.time,timeline:onemove.end.timeline},init:bnew,id:bmin-1});
        }
      }
      //travelling onto another board, no new timelines created
      else{
        this.spacetime[onemove.src.timeline].boards.push(this.spacetime[onemove.src.timeline].boards.last());
        this.spacetime[onemove.end.timeline].boards.push(this.spacetime[onemove.end.timeline].boards.last());
        this.spacetime[onemove.src.timeline].boards[onemove.src.time+1][onemove.src.x][onemove.src.y] = __;
        this.spacetime[onemove.end.timeline].boards[onemove.end.time+1][onemove.end.x][onemove.end.y] = onemove.src.piece;
      }
    }
    else if(onemove.type== "promotion"){
      this.spacetime[onemove.src.timeline].boards.push(this.spacetime[onemove.src.timeline].boards.last());
      this.spacetime[onemove.src.timeline].boards[onemove.src.time+1][onemove.src.x][onemove.src.y] = __;
      this.spacetime[onemove.end.timeline].boards[onemove.end.time+1][onemove.end.x][onemove.end.y] = onemove.src.piece;
    }
    else if(onemove.type == "debug"){
      this.spacetime[onemove.src.timeline].boards.push(this.spacetime[onemove.src.timeline].boards.last());
      this.spacetime[onemove.src.timeline].boards[onemove.src.time+1][onemove.src.x][onemove.src.y] = __;
      this.spacetime[onemove.end.timeline].boards[onemove.end.time+1][onemove.end.x][onemove.end.y] = onemove.src.piece;
    }
    else{
      return false;
    }
  }
  
  this.getChecks();
  
  //enable this conditional if input data can be forged
  if(false){
    this.spacetime = datacopy.spacetime;
    this.checks = datacopy.checks;
    console.log("Invalid move! Resetting data");
    return false;
  }
  
  this.lastMove = deepClone(moveData);
  this.getMoves();
  this.findPresent();
  this.activePlayer = this.activePlayer.color=="white"? this.players[1]:this.players[0];
  this.modifiedOn = Date.now();

  return true;
}

//loops through findMoves on each valid board
Game.prototype.getMoves = function(){
  this.validMoves = {};
  for(let tli in this.spacetime){
    for(let i = 0; i < 8; i++){
      for(let j = 0; j < 8; j++){
        let pos = {timeline:Number(tli),time:this.spacetime[tli].boards.length-1,x:i,y:j};
        let rest = this.findMove(pos);
        //JSON stringify to maintain object for emitting
        this.validMoves[JSON.stringify(pos)] = rest;
      }
    }
  }
}

//finds possible moves for piece at pos, returns nothing if not active player
Game.prototype.findMove = function(pos) {
  let ret = []; //move syntax: {src, end, type}
  
  if(!this.validPos(pos)){
    console.log("tf is this position");
    return ret;
  }
  
  let B = this.spacetime[pos.timeline].boards[pos.time];
  //filters for active player from time
  let modifier = pos.time%2==0? 0: -10;
  let bcolor = pos.time%2==0? "white": "black";
  let opcolor = pos.time%2==0? "black":"white";
  //y multiplier for pawns, -1/1
  let ymod = B[pos.x][pos.y]>=10? -1:1;
  let x = pos.x; let y = pos.y;
  pos.piece = B[pos.x][pos.y];
  let newpos = null;
  
  switch(B[pos.x][pos.y]+modifier){
    case wP:
      if(B[x][y+ymod]==__){
        if((bcolor=="white"&&y==6)||(bcolor=="black"&&y==1)) ret.push({src: pos,end:this.addPos(pos,{x:0,y:ymod,time:0,timeline:0}),type:"promotion"});
        else ret.push({src: pos,end:this.addPos(pos,{x:0,y:ymod,time:0,timeline:0}),type:"normal"});
      }
      
      //check for timeline travel
      newpos = this.addPos(pos,{x:0,y:0,time:0,timeline:ymod});
      if(this.validPos(newpos) && this.getTeam(newpos)=="none"){
        ret.push({src: pos,end:newpos,type:"time travel"});
      }
      //checks for pawn captures
      for(let delta of Ppaths){
        //reverses for black
        newpos = this.addPos(pos,{x:delta[0],y:delta[1]*ymod,time:0,timeline:0});
        if(this.validPos(newpos)&& opcolor==this.getTeam(newpos)) {
          if((bcolor=="white"&&y==6)||(bcolor=="black"&&y==1)) ret.push({src: pos,end:newpos,type:"promotion"});
          else ret.push({src: pos,end:newpos,type:"normal"});
        }
        //en passant, WIP
        for(let m of this.lastMove){
          console.log(m.src.piece, bP_+modifier,m.src.x, newpos.x);
          if(m.src.piece==bP_+modifier && m.src.x==newpos.x){
            console.log(m.src.y,bP_+modifier,m.end.y);
            console.log(ymod);
            console.log(newpos.y);
            if((m.end.y-m.src.y)/-ymod==2){
              if(newpos.y-m.end.y==ymod){
                ret.push({src:pos,end:newpos,type:"en passant"});
              }
            }
          }
        }
      }
      //time travel pawn capture
      for(let delta of Ppaths){
        //reverses for black
        newpos = this.addPos(pos,{x:0,y:0,time:delta[0],timeline:delta[1]*ymod});
        if(this.validPos(newpos)&& opcolor==this.getTeam(newpos)) {
          ret.push({src:pos,end:newpos,type:"time travel"});
        }
      }
      
      break;
    case wR:
      for(let delta of Rpaths){
        let newdeltas = [{x:delta[0],y:delta[1],time:0,timeline:0},{x:delta[0],y:0,time:0,timeline:delta[1]},{x:0,y:delta[1],time:delta[0],timeline:0},{x:0,y:0,time:delta[0],timeline:delta[1]}];
        for(let newdelta of newdeltas){
          let ttt = (newdelta.time!=0 || newdelta.timeline!=0)?"time travel":"normal";
          while(true){
            newpos = this.addPos(pos,newdelta);
            //off the board position, break
            if(!this.validPos(newpos)) break;
            //friend blocking the way, break
            if(this.getTeam(newpos)==bcolor) break;
            //enemy piece for capture
            else if(this.getTeam(newpos)==opcolor){
              ret.push({src:pos,end:newpos,type:ttt})
              break;
            }
            else{
              ret.push({src:pos,end:newpos,type:ttt})
            }
            //increments the distance along axes
            for(let key in newdelta){
              if(newdelta[key]>0) newdelta[key]++;
              if(newdelta[key]<0) newdelta[key]--;
            }
          }
        }
      }
      break;
    case wN:
      for(let delta of Npaths){
        //combines all time/space combos for 2 axis
        newpos = this.addPos(pos,{x:delta[0],y:delta[1],time:0,timeline:0});
        if(this.validPos(newpos)&& this.getTeam(newpos)!=bcolor) ret.push({src:pos,end:newpos,type:"normal"});
        newpos = this.addPos(pos,{x:delta[0],y:0,time:0,timeline:delta[1]});
        if(this.validPos(newpos)&& this.getTeam(newpos)!=bcolor) ret.push({src:pos,end:newpos,type:"time travel"});

        newpos = this.addPos(pos,{x:0,y:delta[1],time:delta[0],timeline:0});
        if(this.validPos(newpos)&& this.getTeam(newpos)!=bcolor) ret.push({src:pos,end:newpos,type:"time travel"});

        newpos = this.addPos(pos,{x:0,y:0,time:delta[0],timeline:delta[1]});
        if(this.validPos(newpos)&& this.getTeam(newpos)!=bcolor) ret.push({src:pos,end:newpos,type:"time travel"});
      }
      break;
    case wB: 
      for(let delta of Bpaths){
        let newdeltas = [{x:delta[0],y:delta[1],time:0,timeline:0},{x:delta[0],y:0,time:0,timeline:delta[1]},{x:0,y:delta[1],time:delta[0],timeline:0},{x:0,y:0,time:delta[0],timeline:delta[1]}];
        for(let newdelta of newdeltas){
          let ttt = (newdelta.time!=0 || newdelta.timeline!=0)?"time travel":"normal";
          while(true){
            newpos = this.addPos(pos,newdelta);
            //off the board position, break
            if(!this.validPos(newpos)) break;
            //friend blocking the way, break
            if(this.getTeam(newpos)==bcolor) break;
            //enemy piece for capture
            else if(this.getTeam(newpos)==opcolor){
              ret.push({src:pos,end:newpos,type:ttt})
              break;
            }
            else{
              ret.push({src:pos,end:newpos,type:ttt})
            }
            //increments the distance along axes
            for(let key in newdelta){
              if(newdelta[key]>0) newdelta[key]++;
              if(newdelta[key]<0) newdelta[key]--;
            }
          }
        }
      }
      break;
    case wQ:
      for(let delta of Qpaths){
        let newdeltas = [{x:delta[0],y:delta[1],time:delta[2],timeline:delta[3]}];
        for(let newdelta of newdeltas){
          let ttt = (newdelta.time!=0 || newdelta.timeline!=0)?"time travel":"normal";
          while(true){
            newpos = this.addPos(pos,newdelta);
            //off the board position, break
            if(!this.validPos(newpos)) break;
            //friend blocking the way, break
            if(this.getTeam(newpos)==bcolor) break;
            //enemy piece for capture
            else if(this.getTeam(newpos)==opcolor){
              ret.push({src:pos,end:newpos,type:ttt})
              break;
            }
            else{
              ret.push({src:pos,end:newpos,type:ttt})
            }
            //increments the distance along axes
            for(let key in newdelta){
              if(newdelta[key]>0) newdelta[key]++;
              if(newdelta[key]<0) newdelta[key]--;
            }
          }
        }
      }
      break;
    case wK: 
      for(let delta of Qpaths){
        let newdeltas = [{x:delta[0],y:delta[1],time:delta[2],timeline:delta[3]}];
        for(let newdelta of newdeltas){
          newpos = this.addPos(pos,newdelta);
          if(this.validPos(newpos)){
            if(this.getTeam(newpos)==opcolor || this.getTeam(newpos)=="none"){
              let ttt = (newdelta.time!=0 || newdelta.timeline!=0)?"time travel":"normal";
              ret.push({src:pos,end:newpos,type:ttt});
            }
          }
          
        }
      }
      break;
    case wP_:
      //moving along y axis
      if(B[x][y+ymod]==__){
        ret.push({src: pos,end:this.addPos(pos,{x:0,y:ymod,time:0,timeline:0}),type:"normal"});
        if(B[x][y+2*ymod]==__){
          ret.push({src: pos,end:this.addPos(pos,{x:0,y:ymod*2,time:0,timeline:0}),type:"normal"});
        }
      }
      //moving along timeline axis
      newpos = this.addPos(pos,{x:0,y:0,time:0,timeline:ymod});
      if(this.validPos(newpos) && this.getTeam(newpos)=="none"){
        ret.push({src: pos,end:newpos,type:"time travel"});
        newpos = this.addPos(pos,{x:0,y:0,time:0,timeline:2*ymod});
        
        if(this.validPos(newpos) && this.getTeam(newpos)=="none"){
          ret.push({src: pos,end:newpos,type:"time travel"});
        }
      }
      
      //checks for pawn captures
      for(let delta of Ppaths){
        //reverses for black
        newpos = this.addPos(pos,{x:delta[0],y:delta[1]*ymod,time:0,timeline:0});
        if(this.validPos(newpos)&& opcolor==this.getTeam(newpos)) {
          ret.push({src:pos,end:newpos,type:"normal"});
        }
      }
      //time travel pawn capture
      for(let delta of Ppaths){
        //reverses for black
        newpos = this.addPos(pos,{x:0,y:0,time:delta[0],timeline:delta[1]*ymod});
        if(this.validPos(newpos)&& opcolor==this.getTeam(newpos)) {
          ret.push({src:pos,end:newpos,type:"time travel"});
        }
      }
      break;
    case wR_:
      for(let delta of Rpaths){
        let newdeltas = [{x:delta[0],y:delta[1],time:0,timeline:0},{x:delta[0],y:0,time:0,timeline:delta[1]},{x:0,y:delta[1],time:delta[0],timeline:0},{x:0,y:0,time:delta[0],timeline:delta[1]}];
        for(let newdelta of newdeltas){
          let ttt = (newdelta.time!=0 || newdelta.timeline!=0)?"time travel":"normal";
          while(true){
            newpos = this.addPos(pos,newdelta);
            //off the board position, break
            if(!this.validPos(newpos)) break;
            //friend blocking the way, break
            if(this.getTeam(newpos)==bcolor) break;
            //enemy piece for capture
            else if(this.getTeam(newpos)==opcolor){
              ret.push({src:pos,end:newpos,type:ttt});
              break;
            }
            else{
              ret.push({src:pos,end:newpos,type:ttt});
            }
            //increments the distance along axes
            for(let key in newdelta){
              if(newdelta[key]>0) newdelta[key]++;
              if(newdelta[key]<0) newdelta[key]--;
            }
          }
        }
      }
      break;
    case wK_:
      for(let delta of Qpaths){
        let newdeltas = [{x:delta[0],y:delta[1],time:delta[2],timeline:delta[3]}];
        for(let newdelta of newdeltas){
          newpos = this.addPos(pos,newdelta);
          if(this.validPos(newpos)){
            if(this.getTeam(newpos)==opcolor || this.getTeam(newpos)=="none"){
              let ttt = (newdelta.time!=0 || newdelta.timeline!=0)?"time travel":"normal";
              ret.push({src:pos,end:newpos,type:ttt});
            }
          }
        }
      }
      if(B[0][y]==wR_-modifier && B[1][y]==__ && B[2][y]==__ && B[3][y]==__){
        ret.push({src:pos,end:this.addPos(pos,{x:-2,y:0,time:0,timeline:0}),type:"castle"});
      }
      if(B[7][y]==wR_-modifier && B[6][y]==__ && B[5][y]==__){
        ret.push({src:pos,end:this.addPos(pos,{x:2,y:0,time:0,timeline:0}),type:"castle"});
      }
      break;
  }
  return ret;
}
/**
 * Apply a player's forfeit to the game.
 * Returns true on success and false on failure.
 */
Game.prototype.forfeit = function(playerData) {

  // Find player in question
  var p = _.findWhere(this.players, {color: playerData.playerColor});
  if (!p) { return false; }

  // Set player info
  p.forfeited = true;

  // Set game status
  this.status = 'forfeit';

  this.modifiedOn = Date.now();

  return true;
};

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

// Export the game object
module.exports = Game;
//module.exports = Timeline;