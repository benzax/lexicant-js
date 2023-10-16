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
              dictionary : Dictionary
            }
  * action = { type : "undo" } ||
              { type : "play", letter : string, isFront : boolean, isPlayer : boolean } ||
              { type : "initDict", dict : Dictionary }
  */
 console.log(action);
 switch(action.type) {
  case "undo": {
    if (state.letters.length === 0) {
      return state;
    }
    return { ...state,
            gameHistory : state.gameHistory.slice(0, -1)
          };
  }
  case "play": {
    if (state.gameHistory.length > 0 && state.gameHistory.at(-1).type === "play" && action.isPlayer === state.gameHistory.at(-1).isPlayer) { // idempotency for React compliance
      return state;
    }
    return { ...state,
            gameHistory : [...state.gameHistory, action ]
           }
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
    };
  }

  function getLetters(state) {
    let ret = "";
    for (const action of state.gameHistory) {
      if (action.type !== "play") {
        continue;
      }
      if (action.isFront) {
        ret = action.letter + ret;
      } else {
        ret = ret + action.letter;
      }
    }
    return ret;
  }
