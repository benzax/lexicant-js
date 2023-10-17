const { BehaviorSubject } = rxjs;
const { useSyncExternalStore } = React;

function getInitialStoreStateFromUrl() {
  const url = new URL(window.location);
  const sequenceFromUrl = url.searchParams.get("sequence") ?? "";
  return {
    letters: sequenceFromUrl,
    lettersHistory: Array.from(sequenceFromUrl).map((letter) => [letter, false]),
  };
}

const store = (() => {
  const subject = new BehaviorSubject({
    isInitialized: false,
    dictionary: null,
    trie: null,

    ...getInitialStoreStateFromUrl(),
    playedWords: [],

    message: "",
  });

  const getSnapshot = () => subject.getValue();
  const subscribe = (callback) => {
    const subscription = subject.subscribe(callback);
    return () => subscription.unsubscribe();
  };

  return {
    useStoreData() {
      return useSyncExternalStore(subscribe, getSnapshot);
    },

    setMessage(newMessage) {
      subject.next(
        immutableUpdate(getSnapshot(), { message: { $set: newMessage } })
      );
    },

    setLetters(newLetters) {
      subject.next(
        immutableUpdate(getSnapshot(), { letters: { $set: newLetters } })
      );
    },

    resetGame() {
      subject.next(
        immutableUpdate(getSnapshot(), {
          letters: { $set: "" },
          lettersHistory: { $set: [] },
        })
      );
    },

    setLettersHistory(newLettersHistory) {
      subject.next(
        immutableUpdate(getSnapshot(), {
          lettersHistory: { $set: newLettersHistory },
        })
      );
    },

    addPlayedWord(word) {
      subject.next(
        immutableUpdate(getSnapshot(), { playedWords: { $push: [word] } })
      );
    },

    setDictionaryAndTrie(dictionary, trie) {
      subject.next(
        immutableUpdate(getSnapshot(), {
          dictionary: { $set: dictionary },
          trie: { $set: trie },
          isInitialized: { $set: true },
        })
      );
    },

    isDictionaryWord(s) {
      return getSnapshot().dictionary.has(s);
    },

    getTrie() {
      return getSnapshot().trie;
    },

    getLetters() {
      return getSnapshot().letters;
    },

    getLettersHistory() {
      return getSnapshot().lettersHistory;
    },
  };
})();

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
              { type : "declareVictory", isPlayer : boolean }
  */
 console.log(action);
 switch(action.type) {
  case "undo": {
    const { gameHistory } = state;
    if (!gameHistory || gameHistory.length === 0) {
      return state;
    }
    let i = -1;
    for (; i <= gameHistory.length && !gameHistory.at(i).isPlayer; i--) {}
    return { ...state,
            gameHistory : gameHistory.slice(0, i),
            status : "IN_PROGRESS",
          };
  }
  case "challenge":
  case "play": {
    if (state.gameHistory.length > 0 && (action.isPlayer === state.gameHistory.at(-1).isPlayer || state.status === "COMPLETED")) {
      return state;
    }
    return { ...state,
            gameHistory : [...state.gameHistory, action ]
           };
  }
  case "respondToChallenge":
  case "declareVictory": {
    if (state.status === "COMPLETED") {
      return state;
    }
    return { ...state,
      gameHistory : [...state.gameHistory, action ],
      status : "COMPLETED"
     };
  }
  case "reset": {
    if (state.status === "IN_PROGRESS") {
      return state;
    }
    return { ...state,
            initialLetters : "",
            gameHistory : [],
            status : "IN_PROGRESS",
            playedWords : [...state.playedWords, getLetters(state)]
          };
  }
  case "initDict" : {
    return { ...state,
            dictionary : action.dictionary
          };
    }
  }
  return state;
  }

  function getInitialState() {
    const url = new URL(window.location);
    const sequenceFromUrl = url.searchParams.get("sequence") ?? "";
    return {
      initialLetters : sequenceFromUrl,
      gameHistory : [],
      status : "IN_PROGRESS",
      dictionary : null,
      playedWords : []
    };
  }

  function getLetters(state) {
    let ret = state.initialLetters;
    for (const action of state.gameHistory) {
      if (action.type === "respondToChallenge") {
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
