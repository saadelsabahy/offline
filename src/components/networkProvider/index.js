import React, {useEffect, useState, useCallback} from 'react';
import NetInfo from '@react-native-community/netinfo';
export const NetworkContext = React.createContext();
const NetworkProvider = ({children}) => {
  const [isOnline, setisOnline] = useState({});
  useEffect(() => {
    NetInfo.addEventListener(handleConnectivityChange);
    return () => {};
  }, [isOnline]);
  const handleConnectivityChange = useCallback(
    (isConnected) => {
      setisOnline(isConnected);
    },
    [isOnline],
  );
  return (
    <NetworkContext.Provider value={isOnline}>
      {children}
    </NetworkContext.Provider>
  );
};

export default NetworkProvider;
