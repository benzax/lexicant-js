function reducer(state, action) {
  /*
  * State = {
              initialLetters : string,
              gameHistory : array of Actions,
              status : "IN_PROGRESS" || "COMPLETED",
              dictionary : Dictionary,
              played_words : list
            }
  * action = { type : "undo" } ||
              { type : "reset" } ||
              { type : "play", letter : string, isFront : boolean, isPlayer : boolean } ||
              { type : "initDict", dict : Dictionary } ||
              { type : "challenge", isPlayer : boolean } ||
              { type : "respondToChallenge", isPlayer : boolean, prepend : string, append : string } ||
              { type : "declareVictory", isPlayer : boolean, prepend : string, append : string }
  */
  console.log(action);
  switch (action.type) {
    case "undo": {
      const { gameHistory } = state;
      if (!gameHistory || gameHistory.length === 0) {
        return state;
      }
      let i = -1;
      for (; i <= gameHistory.length && !gameHistory.at(i).isPlayer; i--) {}
      return {
        ...state,
        gameHistory: gameHistory.slice(0, i),
        status: "IN_PROGRESS",
      };
    }
    case "challenge":
    case "play": {
      if (
        state.gameHistory.length > 0 &&
        (action.isPlayer === state.gameHistory.at(-1).isPlayer ||
          state.status === "COMPLETED")
      ) {
        return state;
      }
      return { ...state, gameHistory: [...state.gameHistory, action] };
    }
    case "respondToChallenge":
    case "declareVictory": {
      if (state.status === "COMPLETED" || (!state.dictionary.set.has(getLetters(state)) && action.isPlayer)) {
        return state;
      }
      return {
        ...state,
        gameHistory: [...state.gameHistory, action],
        status: "COMPLETED",
      };
    }
    case "reset": {
      if (state.status === "IN_PROGRESS") {
        return state;
      }
      return {
        ...state,
        initialLetters: "",
        gameHistory: [],
        status: "IN_PROGRESS",
        playedWords: [...state.playedWords, getLetters(state)],
      };
    }
    case "initDict": {
      return { ...state, dictionary: action.dictionary };
    }
  }
  return state;
}

function getInitialState() {
  const url = new URL(window.location);
  const sequenceFromUrl = url.searchParams.get("sequence") ?? "";
  return {
    initialLetters: sequenceFromUrl,
    gameHistory: [],
    status: "IN_PROGRESS",
    dictionary: null,
    playedWords: [],
  };
}

function getLetters(state) {
  let ret = state.initialLetters;
  for (const action of state.gameHistory) {
    if (action.type === "respondToChallenge" || action.type === "declareVictory") {
      ret = action.prepend + ret + action.append;
    } else if (action.type !== "play") {
      continue;
    } else {
      if (action.isFront) {
        ret = action.letter + ret;
      } else {
        ret = ret + action.letter;
      }
    }
  }
  return ret;
}
