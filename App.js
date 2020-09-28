import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ToastAndroid} from 'react-native';
import List from './src/components/List';
import {ApolloProvider, InMemoryCache, HttpLink} from '@apollo/client';
import {ApolloOfflineProvider} from 'react-offix-hooks';
import {ApolloOfflineClient} from 'offix-client';
// import { offlineClient } from './src/components/offix';
import {clientConfig} from './src/components/offix';
import {useNetInfo} from '@react-native-community/netinfo';
import NetworkProvider from './src/components/networkProvider';
import RNBootSplash from 'react-native-bootsplash';
const client = new ApolloOfflineClient(clientConfig);
const App = () => {
  const {isConnected} = useNetInfo();
  const cache = new InMemoryCache({});
  const link = new HttpLink({uri: 'https://api.github.com/graphql'});
  const [initialized, setInitialized] = useState(true);

  // initialize the offix client and set the apollo client
  useEffect(() => {
    client
      .init()
      .then(() => {
        setInitialized(false);
        RNBootSplash.hide({duration: 250});
      })
      .catch((e) => console.log('initiate offine error', e));
    client.queue.entries.length && isConnected
      ? ToastAndroid.show('syncing your offline data.. !', ToastAndroid.SHORT)
      : null;
  }, []);

  return (
    <ApolloOfflineProvider client={client}>
      <ApolloProvider client={client}>
        <NetworkProvider>
          <View style={styles.container}>
            {initialized ? (
              <Text style={{alignSelf: 'center', fontSize: 18}}>loading..</Text>
            ) : (
              <List />
            )}
          </View>
        </NetworkProvider>
      </ApolloProvider>
    </ApolloOfflineProvider>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
  },
});

export default App;
