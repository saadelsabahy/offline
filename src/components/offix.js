// import { InMemoryCache } from 'apollo-cache-inmemory';
// import { HttpLink } from 'apollo-link-http';
// import AsyncStorage from '@react-native-community/async-storage';
// // import NetInfo from "@react-native-community/netinfo"
// import { ApolloOfflineClient } from 'offix-client';
// import { ReactNativeNetworkStatus } from './NetworkStatus';
// import { GET_REPOS } from './List';
// import { WebSocketLink } from 'apollo-link-ws';
// import { split } from 'apollo-link';
// const cacheStorage = {
//    getItem: async (key) => {
//       const data = await AsyncStorage.getItem(key);
//       if (typeof data === 'string') {
//          console.log('Get item string', data);
//          return JSON.parse(data);
//       }
//       console.log('Get item', data);
//       return data;
//    },
//    setItem: (key, value) => {
//       let valueStr = value;
//       if (typeof valueStr === 'object') {
//          valueStr = JSON.stringify(value);
//       }
//       console.log('set item', valueStr);
//       return AsyncStorage.setItem(key, valueStr);
//    },
//    removeItem: (key) => {
//       return AsyncStorage.removeItem(key);
//    },
// };

// const networkStatus = new ReactNativeNetworkStatus();
// const httpLink = new HttpLink({
//    uri: 'https://api.github.com/graphql',
//    headers: {
//       Authorization: 'Bearer  20fb9b4b7933e9141bd302631b30b9ff690d19a2',
//    },
// });
// /* const wsLink = new WebSocketLink({
//    uri: 'https://api.github.com/graphql',
//    options: {
//       reconnect: true,
//       lazy: true,
//       connectionParams: {
//          headers: {
//             Authorization: 'Bearer  20fb9b4b7933e9141bd302631b30b9ff690d19a2',
//          },
//       },
//    },
// });
// const link = split(
//    ({ query }) => {
//       const { kind, operation } = getMainDefinition(query);
//       return kind === 'OperationDefinition' && operation === 'subscription';
//    },
//    wsLink,
//    httpLink
// ); */

// export const offlineClient = new ApolloOfflineClient({
//    cache: new InMemoryCache(),
//    link: httpLink,
//    offlineStorage: cacheStorage,
//    cacheStorage,
//    networkStatus,

//    retryOptions: { attempts: { max: 100 }, delay: { initial: 1000 } },
// });

import {InMemoryCache} from 'apollo-cache-inmemory';
import {split} from 'apollo-link';
import {HttpLink} from 'apollo-link-http';
import {WebSocketLink} from 'apollo-link-ws';
import {getMainDefinition} from 'apollo-utilities';
import AsyncStorage from '@react-native-community/async-storage';
import {Platform} from 'react-native';
import {ReactNativeNetworkStatus} from './NetworkStatus';

const appDomain =
  Platform.OS === 'ios' ? 'localhost:4000' : '192.168.1.10:4000';

const wsLink = new WebSocketLink({
  uri: `https://api.github.com/graphql`,
  options: {
    reconnect: true,
    lazy: true,
    connectionParams: {
      authToken: '20fb9b4b7933e9141bd302631b30b9ff690d19a2',
    },
  },
});

const httpLink = new HttpLink({
  uri: `https://api.github.com/graphql`,
  headers: {
    Authorization: 'Bearer  20fb9b4b7933e9141bd302631b30b9ff690d19a2',
  },
});

const link = split(
  ({query}) => {
    const {kind, operation} = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink,
);

// Create cache wrapper
const cacheStorage = {
  getItem: async (key) => {
    const data = await AsyncStorage.getItem(key);
    if (typeof data === 'string') {
      return JSON.parse(data);
    }
    return data;
  },
  setItem: async (key, value) => {
    let valueStr = value;
    if (typeof valueStr === 'object') {
      valueStr = JSON.stringify(value);
    }
    return AsyncStorage.setItem(key, valueStr);
  },
  removeItem: async (key) => {
    return AsyncStorage.removeItem(key);
  },
};

const networkStatus = new ReactNativeNetworkStatus();

export const clientConfig = {
  link,
  cache: new InMemoryCache(),
  offlineStorage: cacheStorage,
  cacheStorage,
  networkStatus,
  retryOptions: {attempts: {max: 100}, delay: {initial: 1000}},
};
