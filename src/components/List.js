import React, {useEffect, useState, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {useQuery, gql} from '@apollo/client';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useOfflineMutation} from 'react-offix-hooks';
import NetworkProvider, {NetworkContext} from './networkProvider';
const {width, height} = Dimensions.get('screen');
export const GET_REPOS = gql`
  {
    viewer {
      repositories(
        first: 100
        affiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER]
      ) {
        nodes {
          name
          id
          createdAt
          isPrivate
          stargazers {
            totalCount
          }
        }
      }
    }
  }
`;
const ADD_STAR = gql`
  mutation($id: ID!) {
    addStar(input: {starrableId: $id}) {
      starrable {
        stargazers(first: 3) {
          nodes {
            name
          }
        }
      }
    }
  }
`;

const REMOVE_STAR = gql`
  mutation($id: ID!) {
    removeStar(input: {starrableId: $id}) {
      starrable {
        stargazers(first: 3) {
          nodes {
            name
          }
        }
      }
    }
  }
`;
const List = () => {
  const {isConnected} = useContext(NetworkContext);
  const [refreshing, setrefreshing] = useState(false);
  const {loading, error, data, refetch} = useQuery(GET_REPOS, {});
  const [starRepo, {data: mutationData, error: starError}] = useOfflineMutation(
    ADD_STAR,
    {
      refetchQueries: [{query: GET_REPOS}],
      awaitRefetchQueries: true,
    },
  );
  const [unStarRepo, {error: unStarError}] = useOfflineMutation(REMOVE_STAR, {
    refetchQueries: [{query: GET_REPOS}],
    awaitRefetchQueries: true,
  });

  const starThSelectedRepo = (id, totalCount) => {
    if (totalCount) {
      unStarRepo({
        variables: {id},
      });
    } else {
      starRepo({
        variables: {id},
      });
    }
  };
  console.log('isConnected', isConnected);
  const [reftchList, setreftchList] = useState(true);
  useEffect(() => {
    reftchRepos();
    return () => {};
  }, [reftchList, isConnected]);
  const reftchRepos = async () => {
    await refetch();
    setreftchList(!reftchList);
  };
  const handleRefresh = async () => {
    setrefreshing(true);
    await reftchRepos();
    setrefreshing(false);
  };
  return (
    <View style={styles.container}>
      {(loading || refreshing) && (
        <Text style={styles.textStyle}>loading...</Text>
      )}
      {error && !data && <Text style={styles.textStyle}>oops ...</Text>}
      {data?.viewer?.repositories?.nodes && (
        <View style={{flex: 1, paddingVertical: 5}}>
          <FlatList
            data={data.viewer.repositories.nodes}
            keyExtractor={(item, index) => `${item.id}`}
            extraData={reftchList}
            renderItem={({
              item: {
                name,
                stargazers: {totalCount},
                id,
              },
              index,
            }) => {
              return (
                <View style={styles.card}>
                  <Text style={styles.textStyle}>{name}</Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      flex: 0.5,
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      height: '100%',
                    }}>
                    <TouchableOpacity
                      onPress={() => starThSelectedRepo(id, totalCount)}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 50 / 2,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#f6f6f6',
                      }}>
                      <Icon
                        name={totalCount ? 'star' : 'star-outline'}
                        size={30}
                        onPress={() => starThSelectedRepo(id, totalCount)}
                      />
                    </TouchableOpacity>
                    <Text style={{fontSize: 20, marginHorizontal: 10}}>
                      {totalCount}
                    </Text>
                  </View>
                </View>
              );
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#000']}
              />
            }
          />
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  textStyle: {
    fontSize: 17,
    letterSpacing: 1,
  },
  card: {
    width: width - 20,
    height: 80,
    backgroundColor: '#eee',
    marginVertical: 5,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    elevation: 3,
  },
});

export default List;
