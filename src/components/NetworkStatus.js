import NetInfo from '@react-native-community/netinfo';

export class ReactNativeNetworkStatus {
   listeners = [];

   constructor() {
      NetInfo.addEventListener(this.handleNetworkStatusChange.bind(this));
   }

   addListener(listener) {
      this.listeners.push(listener);
   }

   removeListener(listener) {
      const index = this.listeners.indexOf(listener);
      if (index >= 0) {
         this.listeners.splice(index, 1);
      }
   }

   isOffline() {
      return new Promise((resolve) => {
         NetInfo.fetch().then((state) => {
            resolve(!state.isInternetReachable);
         });
      });
   }

   handleNetworkStatusChange(state) {
      const online = state.isInternetReachable;
      this.listeners.forEach((listener) => {
         console.log('netwrk', online);
         listener({ online });
      });
   }
}
