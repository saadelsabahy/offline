import {InMemoryCache} from 'apollo-cache-inmemory';
import {HttpLink} from 'apollo-link-http';
import AsyncStorage from '@react-native-community/async-storage';
// import NetInfo from "@react-native-community/netinfo"
import {ApolloOfflineClient} from 'offix-client';
import {ReactNativeNetworkStatus} from './NetworkStatus';
import {CacheOperation, getUpdateFunction} from 'offix-cache';
import {GET_REPOS} from './List';
const cacheStorage = {
  getItem: async (key) => {
    const data = await AsyncStorage.getItem(key);
    if (typeof data === 'string') {
      console.log('Get item string', data);
      return JSON.parse(data);
    }
    console.log('Get item', data);
    return data;
  },
  setItem: (key, value) => {
    let valueStr = value;
    if (typeof valueStr === 'object') {
      valueStr = JSON.stringify(value);
    }
    console.log('set item', valueStr);
    return AsyncStorage.setItem(key, valueStr);
  },
  removeItem: (key) => {
    return AsyncStorage.removeItem(key);
  },
};

const networkStatus = new ReactNativeNetworkStatus();
const options = {
  updateQuery: GET_REPOS,
  returnType: 'Repo',
};
export const reposUpdate = {
  addStar: getUpdateFunction({
    mutationName: 'addStar',
    idField: 'id',
    operationType: CacheOperation.ADD,
    ...options,
  }),
  removeStar: getUpdateFunction({
    mutationName: 'removeStar',
    idField: 'id',
    operationType: CacheOperation.ADD,
    ...options,
  }),
};
export const offlineClient = new ApolloOfflineClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: 'https://api.github.com/graphql',
    headers: {
      Authorization: 'Bearer  20fb9b4b7933e9141bd302631b30b9ff690d19a2',
    },
  }),
  offlineStorage: cacheStorage,
  cacheStorage,
  networkStatus,
  mutationCacheUpdates: reposUpdate,
  retryOptions: {attempts: {max: 100}, delay: {initial: 1000}},
});
