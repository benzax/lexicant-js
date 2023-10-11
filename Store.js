const { BehaviorSubject } = rxjs;
const { useSyncExternalStore } = React;

const store = (() => {
  const subject = new BehaviorSubject({
    isInitialized: false,

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
  };
})();
