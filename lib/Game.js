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
  
  //timelines per player
  this.playerlines = (0,0);
  
  //spacetime, indexed by timeline
  this.spacetime = {0:new Timeline({src:{time:-1,timeline:-1},init:initBoard,id:0})};
  
  //valid moves, format: src(pos), end(pos), type(string)
  //white to move if time is even, black to move if odd
  this.validMoves = [
    {src:{timeline:0, time:0, x:0, y:0, piece:__},end:{timeline:0, time:0, x:0, y:0,piece:__},type:'debug'},
  ];
  
  //generates validMoves at beginning
  this.validMoves = this.generateMoves();

  this.lastMove = null;

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
      if(pos.time<this.spacetime[pos.timeline].boards.length)
        if(this.spacetime[pos.timeline].boards[pos.time]!=null)
          return true;
  return false;
}
//checks color based on piece
Game.prototype.getTeam = function(piece){
  if(piece<0) return "none";
  if(piece<10) return "white";
  return "black";
}
//returns piece value at position
Game.prototype.getPiece = function(pos){
  if(!this.validPos(pos)) return false;
  return this.spacetime[pos.timeline].boards[pos.time][pos.x][pos.y];
}
//adds move p2 to position p1 and returns new position, order DOES matter
Game.prototype.addPos = function(p1,p2){
  //NOTE: time is scaled x2 due to black/white both on time
  return {x:p1.x+p2.x,y:p1.y+p2.y,timeline:p1.timeline+p2.timeline,time:p1.time+2*p2.time};
}

//checks to see if the position is being attacked by enemy pieces
Game.prototype.isSafe = function(pos,team){
  let modifier = team=="white"? 10:0;
  //checks for knight attacks
  for(let delta of Npaths){
    //combines all time/space combos for 2 axis
    let newpos = this.addPos(pos,{x:delta[0],y:delta[1],time:0,timeline:0});
    if(this.validPos(newpos)&& this.getPiece(newpos)==wN+modifier) return false;
    
    newpos = this.addPos(pos,{x:delta[0],y:0,time:0,timeline:delta[1]});
    if(this.validPos(newpos)&& this.getPiece(newpos)==wN+modifier) return false;
      
    newpos = this.addPos(pos,{x:0,y:delta[1],time:delta[0],timeline:0});
    if(this.validPos(newpos)&& this.getPiece(newpos)==wN+modifier) return false;
      
    newpos = this.addPos(pos,{x:0,y:0,time:delta[0],timeline:delta[1]});
    if(this.validPos(newpos)&& this.getPiece(newpos)==wN+modifier) return false;
  }
  
  //checks for bishop attacks
  for(let delta of Bpaths){
    let newdeltas = [{x:delta[0],y:delta[1],time:0,timeline:0},{x:delta[0],y:0,time:0,timeline:delta[1]},{x:0,y:delta[1],time:delta[0],timeline:0},{x:0,y:0,time:delta[0],timeline:delta[1]}];
    for(let newdelta of newdeltas){
      while(true){
        let newPos = this.addPos(pos,newdelta);
        //off the board position, break
        if(!this.validPos(newPos)) break;
        //friend blocking the way, break
        if(this.getTeam(newPos)==team) break;
        //enemy bishop spotted
        if(this.getPiece(newPos)==wB+modifier) return false;
        //increments the distance along axes
        for(let key of newdelta)
          if(newdelta[key]>0) newdelta[key]++;
      }
    }
  }
  
  //checks for rook attacks
  for(let delta of Rpaths){
    let newdeltas = [{x:delta[0],y:delta[1],time:0,timeline:0},{x:delta[0],y:0,time:0,timeline:delta[1]},{x:0,y:delta[1],time:delta[0],timeline:0},{x:0,y:0,time:delta[0],timeline:delta[1]}];
    for(let newdelta of newdeltas){
      while(true){
        let newPos = this.addPos(pos,newdelta);
        //off the board position, break
        if(!this.validPos(newPos)) break;
        //friend blocking the way, break
        if(this.getTeam(newPos)==team) break;
        //enemy rook spotted
        if(this.getPiece(newPos)==wR+modifier || this.getPiece(newPos)==wR_+modifier) return false;
        //increments the distance along axes
        for(let key of newdelta)
          if(newdelta[key]>0) newdelta[key]++;
      }
    }
  }
  
  //checks for pawn attacks
  for(let delta of Ppaths){
    //reverses for black
    if(team=="black") delta[1]*=-1;
    
    let newpos = this.addPos(pos,{x:delta[0],y:delta[1],time:0,timeline:0});
    if(this.validPos(newpos)&& (this.getPiece(newpos)==wP+modifier||this.getPiece(newpos)==wP_+modifier)) return false;
  }
  
  //checks for queen/king attacks
  for(let delta of Qpaths){
    let newdeltas = [{x:delta[0],y:delta[1],time:0,timeline:0},{x:delta[0],y:0,time:0,timeline:delta[1]},{x:0,y:delta[1],time:delta[0],timeline:0},{x:0,y:0,time:delta[0],timeline:delta[1]}];
    for(let newdelta of newdeltas){
      //checks king 1-radius first
      let newPos = this.addPos(pos,newdelta);
      //off the board position, break
      if(!this.validPos(newPos)) break;
      if(this.getPiece(newPos)==wK+modifier||this.getPiece(newPos)==wK_+modifier) return false;
      
      //checks queen
      while(true){
        let newPos = this.addPos(pos,newdelta);
        //off the board position, break
        if(!this.validPos(newPos)) break;
        //friend blocking the way, break
        if(this.getTeam(newPos)==team) break;
        //enemy rook spotted
        if(this.getPiece(newPos)==wQ+modifier) return false;
        //increments the distance along axes
        for(let key of newdelta)
          if(newdelta[key]>0) newdelta[key]++;
      }
    }
  }
}

/**
 * Apply move and regenerate game state.
 * Returns true on success and false on failure.
 */
Game.prototype.move = function(moveData) {
  for(let onemove of moveData){
    if(!this.validPos(onemove.src)||!this.validPos(onemove.end)) return false;
    
    if(onemove.type == "normal"){
       
    }
    else if(onemove.type == "castle"){
      
    }
    else if(onemove.type == "en passant"){
      
    }
    else if(onemove.type == "time travel"){
      
    }
    else if(onemove.type == "debug"){
      this.spacetime[onemove.src.timeline].boards.push(this.spacetime[onemove.src.timeline].boards.last());
      this.spacetime[onemove.src.timeline].boards[onemove.src.time+1][onemove.src.x][onemove.src.y] = __;
      this.spacetime[onemove.end.timeline].boards[onemove.end.time+1][onemove.end.x][onemove.end.y] = onemove.src.piece;
    }
    else{
      return false;
    }
    return true;
  }
  
  this.modifiedOn = Date.now();

  return true;
};

//generates and returns moves
Game.prototype.generateMoves = function() {
  
  console.log(this.spacetime)
  for(let tline in this.spacetime){
    let pbool = this.activePlayer=="white" ? 0:1;
    let pdir = this.activePlayer=="white" ? 1:-1;
    
    let titer = this.spacetime[tline];
    //checks if timeline is currently playable
    if(titer.boards.length%2 == pbool){ 
      let B = titer.boards[titer.boards.length-1];
      for(let i = 0; i < 8; i++){
        for(let j = 0; j < 8; j++){
          
        }
      }
    }
  }
};
Game.prototype.findMoves = function(pos, piece) {
  let ret = []; //move syntax: {src, end, type}
  
  if(!this.validPos(pos))return [];
  
  let B = this.spacetime[pos.timeline].boards[pos.time];
  //filters for active player
  let modifier = this.activePlayer=="white"? 0: -10;
  //y multiplier for pawns, -1/1
  let ymod = B[pos.x][pos.y]>10? -1:1;
  let x = pos.x; let y = pos.y;
    switch(B[pos.x][pos.y]+modifier){
      case wP:
        if(B[x][y+modifier]==__){
          ret.push({src: {},end:{},type:"normal"});
        }
        break;
      case wR:
        break;
      case wN:
        break;
      case wB: 
        break;
      case wQ: 
        break;
      case wK: 
        break;
      case wP_:
        break;
      case wR_:
        break;
      case wK_:
        break;
    }
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
    for(var i = 0; i < params.src.time;i++){
      this.boards.push(null);
    }
    this.boards.push(params.init);
  }
  
}

// Export the game object
module.exports = Game;
//module.exports = Timeline;