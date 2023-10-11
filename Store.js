const { BehaviorSubject } = rxjs;
const { useSyncExternalStore } = React;

const store = (() => {
  const subject = new BehaviorSubject({
    isInitialized: false,
    dictionary: null,
    trie: null,

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
  };
})();
