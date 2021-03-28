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
  this.spacetime = {0:Timeline({time:-1,timeline:-1,init:initBoard,id:0})};
  
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
    if()
      return true;
  return false;
}
//checks color based on piece
Game.prototype.getTeam = function(piece){
  if(piece<10) return "white";
  return "black";
}
//returns piece value at position
Game.prototype.getPiece = function(pos){
  if(!this.validPos(pos)) return false;
  return 
}
//adds move p2 to p1 and returns, order DOES matter
Game.prototype.addPos = function(p1,p2){
  //NOTE: time is scaled x2 due to black/white both on time
  return {x:p1.x+p2.x,y:p1.y+p2.y,timeline:p1.timeline+p2.timeline,time:p1.time+2*p2.time};
}

//checks to see if the position is being attacked by enemy pieces
Game.prototype.isSafe = function(pos,team){
  let modifier = team=="white"? 10:0;
  for(let delta of Npaths){
    //combines all time/space combos for 2 axis
    let newpos = this.addPos(pos,{x:delta[0],y:delta[1],time:0,timeline:0});
    if(this.validPos(newpos)&& ){
      
    }
    newpos = this.addPos(pos,{x:delta[0],y:0,time:0,timeline:delta[1]});
    if(this.validPos(newpos)){
      
    }
    newpos = this.addPos(pos,{x:0,y:delta[1],time:delta[0],timeline:0});
    if(this.validPos(newpos)){
      
    }
    newpos = this.addPos(pos,{x:0,y:0,time:delta[0],timeline:delta[1]});
    if(this.validPos(newpos)){
      
    }
  }
  for(let delta of Bpaths){
    
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
    else{
      return false;
    }
  }
  
  this.modifiedOn = Date.now();

  return true;
};

//generates and returns moves
Game.prototype.generateMoves = function() {
  
  for(let tline of this.spacetime){
    let pbool = this.activePlayer=="white" ? 0:1;
    
    //checks if timeline is currently playable
    if(tline.boards.length%2 == pbool){ 
      let B = tline.boards[tline.boards.length-1];
      for(let i = 0; i < 8; i++){
        for(let j = 0; j < 8; j++){
          let modifier = this.activePlayer=="white"? 0: -10;
          switch(B[i][j]+modifier){
            case wP:
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
      }
    }
  }
};
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
function Timeline(params) {
  
  //source timeline
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

Timeline.prototype.move = function(move) {
  
}
Timeline.prototype.undo = function(move) {
  
}
Timeline.prototype.place = function(move) {
  
}
// Export the game object
module.exports = Game;
module.exports = Timeline;