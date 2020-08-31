import React, { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
export const NetworkContext = React.createContext();
const NetworkProvider = ({ children }) => {
   const [isOnline, setisOnline] = useState({});
   useEffect(() => {
      NetInfo.addEventListener(handleConnectivityChange);
      return () => {};
   }, []);
   const handleConnectivityChange = (isConnected) => setisOnline(isConnected);
   return (
      <NetworkContext.Provider value={isOnline}>
         {children}
      </NetworkContext.Provider>
   );
};

export default NetworkProvider;
