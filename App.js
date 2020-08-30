import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import List from './src/components/List';
import { ApolloProvider, InMemoryCache, HttpLink } from '@apollo/client';
import { ApolloOfflineProvider } from 'react-offix-hooks';
import { offlineClient } from './src/components/offix';
const App = () => {
   const cache = new InMemoryCache({});
   const link = new HttpLink({ uri: 'https://api.github.com/graphql' });
   const [initialized, setInitialized] = useState(false);

   // initialize the offix client and set the apollo client
   useEffect(() => {
      offlineClient.init().then(() => setInitialized(true));
      console.log(offlineClient.queue);
   }, []);

   return (
      <ApolloOfflineProvider client={offlineClient}>
         <ApolloProvider client={offlineClient}>
            <View style={styles.container}>
               {!initialized ? (
                  <Text style={{ alignSelf: 'center', fontSize: 18 }}>
                     loading..
                  </Text>
               ) : (
                  <List />
               )}
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
