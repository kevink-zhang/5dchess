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

const Npaths = [(1,2),];
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
  this.spacetime = {0:initBoard};
  
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
  if(pos.x>-1 && pos.x<8 && pos.y>-1 && pos.y<8 && pos.timeline in this.spacetime && pos.time<this.spacetime.length) return true;
  return false;
}
/**
 * Apply move and regenerate game state.
 * Returns true on success and false on failure.
 */
Game.prototype.move = function(moveData) {
  for(var onemove in moveData){
    if(valid)
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
  this.branch = {timeline: params.src.timeline, time:params.src.time};
  this.boards = [];
  for(var i = 0; i < params.src.time;i++){
    this.boards.push(null);
  }
  this.boards.push(params.init);
}


// Export the game object
module.exports = Game;
module.exports = Timeline;