'use strict';
const store = {};

function retrieveSession(bot, update, next) {
  // try to retrieve the session object for a certain id
  // if no session is found, set the session to an empty object
  if (store[update.sender.id]) {
    update.session = store[update.sender.id];
  } else {
    // on the first pass, this will be our session object
    update.session = {};
    update.session.context = {};
  }
  next();
}

function updateSession(userId, session) {
  // update or store the session for the first time.
  // the update is expected to be found in the message object
  // for the platform. 
  store[userId] = session;
}

module.exports = {
  retrieveSession,
  updateSession
};
