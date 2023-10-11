const { BehaviorSubject } = rxjs;
const { useSyncExternalStore } = React;

const store = (() => {
  const subject = new BehaviorSubject({
    isInitialized: false,
    dictionary: null,
    trie: null,

    letters: "",
    lettersState: [],
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
          lettersState: { $set: [] },
        })
      );
    },

    setLettersState(newLettersState) {
      subject.next(
        immutableUpdate(getSnapshot(), {
          lettersState: { $set: newLettersState },
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

    getLettersState() {
      return getSnapshot().lettersState;
    },
  };
})();
