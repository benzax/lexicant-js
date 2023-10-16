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
              gameHistory : array of (action, boolean) tuples,
              status : "IN_PROGRESS" || "COMPLETED",
              dictionary : Dictionary
            }
  * action = { type : "undo" } ||
              { type : "play", letter : string, isFront : boolean } ||
              { type : "initDict", dict : Dictionary }
  */
 console.log(action);
 switch(action.type) {
  case "undo": {
    if (state.letters.length === 0) {
      return state;
    }
    return { ...state,
            letters : state.lettersHistory.at(-1).isFront ? state.letters.slice(1) : state.letters.slice(0, -1),
            lettersHistory : state.lettersHistory.slice(0, -1)
          };
  }
  case "play": {
    return { ...state,
            letters : action.isFront ? action.letter + state.letters : state.letters + action.letter,
            lettersHistory : [...state.lettersHistory, (action.letter, action.isFront) ]
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
