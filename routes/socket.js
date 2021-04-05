var IO = null;
var DB = null;

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

/**
 * Add player to game
 * Emits an "update" event on success or an "error" event on failure
 */
var join = function(gameID) {

  var sess      = this.handshake.session;
  var debugInfo = {
    socketID : this.id,
    event    : 'join',
    gameID   : gameID,
    session  : sess
  };

  // Check if user has permission to access this game
  if (gameID !== sess.gameID) {
    console.log('ERROR: Access Denied', debugInfo);
    this.emit('error', {message: "You cannot join this game"});
    return;
  }

  // Lookup game in database
  var game = DB.find(gameID);
  if (!game) {
    console.log('ERROR: Game Not Found', debugInfo);
    this.emit('error', {message: "Game not found"});
    return;
  }

  // Add user to game
  var result = game.addPlayer(sess);
  if (!result) {
    console.log('ERROR: Failed to Add Player', debugInfo);
    this.emit('error', {message: "Unable to join game"});
    return;
  }

  // Add user to a socket.io "room" that matches the game ID
  this.join(gameID);

  // Emit the update event to everyone in this room/game
  if(game.status=="ongoing") game.getMoves();
  IO.sockets.in(gameID).emit('update', game);
};

/**
 * Apply move to game
 * Emits an "update" event on success or an "error" event on failure
 */
var move = function(data) {

  var sess      = this.handshake.session;
  var debugInfo = {
    socketID : this.id,
    event    : 'move',
    gameID   : data.gameID,
    move     : data.move,
    session  : sess
  };

  // Check if user has permission to access this game
  if (data.gameID !== sess.gameID) {
    console.log('ERROR: Access Denied', debugInfo);
    this.emit('error', {message: "You have not joined this game"});
    return;
  }

  // Lookup game in database
  var game = DB.find(data.gameID);
  if (!game) {
    console.log('ERROR: Game Not Found', debugInfo);
    this.emit('error', {message: "Game not found"});
    return;
  }

  // Apply move to game
  console.log("Applying move");
  
  var result = game.move(data.move);
  //console.log(game.spacetime[0]);
  
  if (!result) {
    console.log('ERROR: Failed to Apply Move', debugInfo);
    this.emit('error', {message: "Invalid move, please try again"});
    return;
  }

  // Emit the update event to everyone in this room/game
  game.getMoves();
  IO.sockets.in(data.gameID).emit('update', game);

  console.log(data.gameID+' '+sess.playerName+': '+data.move);
};

/**
  Recalculates and emits valid moves from input data
*/

var recalc = function(data){
  let temp = deepCopy(game.spacetime);
  game.spacetime = data;
  game.getMoves();
  IO.sockets.in(data.gameID).emit('recalc', game);
  game.spacetime = temp;
  game.getMoves();
}

/**
 * Forfeit a game
 * Emits an "update" event on success or an "error" event on failure
 */
var forfeit = function(gameID) {

  var sess      = this.handshake.session;
  var debugInfo = {
    socketID : this.id,
    event    : 'forfeit',
    gameID   : gameID,
    session  : sess
  };

  // Check if user has permission to access this game
  if (gameID !== sess.gameID) {
    console.log('ERROR: Access Denied', debugInfo);
    this.emit('error', {message: "You have not joined this game"});
    return;
  }

  // Lookup game in database
  var game = DB.find(gameID);
  if (!game) {
    console.log('ERROR: Game Not Found', debugInfo);
    this.emit('error', {message: "Game not found"});
    return;
  }

  // Forfeit game
  var result = game.forfeit(sess);
  if (!result) {
    console.log('ERROR: Failed to Forfeit', debugInfo);
    this.emit('error', {message: "Failed to forfeit game"});
    return;
  }

  // Emit the update event to everyone in this room/game
  IO.sockets.in(gameID).emit('update', game);

  console.log(gameID+' '+sess.playerName+': Forfeit');
};

/**
 * Remove player from game
 */
var disconnect = function() {

  var sess      = this.handshake.session;
  var debugInfo = {
    socketID : this.id,
    event    : 'disconnect',
    session  : sess
  };

  // Lookup game in database
  var game = DB.find(sess.gameID);
  if (!game) {
    console.log('ERROR: Game Not Found', debugInfo);
    return;
  }

  // Remove player from game
  var result = game.removePlayer(sess);
  if (!result) {
    console.log('ERROR: '+sess.playerName+' failed to leave '+sess.gameID);
    return;
  }

  console.log(sess.playerName+' left '+sess.gameID);
  console.log('Socket '+this.id+' disconnected');
};

/**
 * Attach route/event handlers for socket.io
 */
exports.attach = function(io, db) {
  IO = io;
  DB = db;

  // When a new socket connection is made
  io.sockets.on('connection', function (socket) {

    // Attach the event handlers
    socket.on('join', join);
    socket.on('move', move);
    socket.on('forfeit', forfeit);
    socket.on('disconnect', disconnect);
    socket.on('recalc', recalc);

    console.log('Socket '+socket.id+' connected');
  });
};