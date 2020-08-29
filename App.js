import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import List from './src/components/List';
import {ApolloProvider, InMemoryCache, HttpLink} from '@apollo/client';
import {ApolloOfflineProvider} from 'react-offix-hooks';
import {offlineClient} from './src/components/offix';
const App = () => {
  const cache = new InMemoryCache({});
  const link = new HttpLink({uri: 'https://api.github.com/graphql'});
  const [initialized, setInitialized] = useState(false);

  // initialize the offix client and set the apollo client
  useEffect(() => {
    offlineClient.init().then(() => setInitialized(true));
  }, []);

  if (!initialized) {
    return (
      <View style={styles.container}>
        <Text>loading..</Text>
      </View>
    );
  }
  return (
    <ApolloOfflineProvider client={offlineClient}>
      <ApolloProvider client={offlineClient}>
        <View style={styles.container}>
          <List />
        </View>
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
