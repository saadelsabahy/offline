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
import {addStarUpdate, removeStarUpdate} from './offlineUpdates';
const {width, height} = Dimensions.get('screen');
export const GET_REPOS = gql`
  {
    viewer {
      repositories(
        first: 10
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
  const {loading, error, data, refetch} = useQuery(GET_REPOS, {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
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

  const starThSelectedRepo = (
    {id, totalCount, createdAt, isPrivate, name},
    index,
  ) => {
    if (totalCount) {
      const updatedRepo = {
        id,
        totalCount: totalCount - 1,
        createdAt,
        isPrivate,
        name,
        __typename: 'StargazerConnection',
      };
      // data[index] = updatedRepo;
      unStarRepo({
        variables: {id},
        optimisticResponse: {
          removeStar: {
            starrable: {
              stargazers: {
                nodes: updatedRepo,
                ...updatedRepo,
              },
              __typename: 'Repository',
            },
            __typename: 'RemoveStarPayload',
          },
        },
        update: (cache, {data}) =>
          removeStarUpdate(
            cache,
            {data},
            {id, totalCount, createdAt, isPrivate, name},
            index,
          ),
      })
        .then((res) => console.log('unstar success,', res))
        .catch((e) => console.log('offline unstar error', error));
    } else {
      const addStarToRepo = {
        id,
        totalCount: totalCount + 1,
        createdAt,
        isPrivate,
        name,
        __typename: 'StargazerConnection',
      };
      starRepo({
        variables: {id},
        optimisticResponse: {
          addStar: {
            __typename: 'AddStarPayload',
            starrable: {
              __typename: 'Repository',
              stargazers: {
                nodes: addStarToRepo,
                ...addStarToRepo,
              },
            },
          },
        },
        update: (cache, {data}) =>
          addStarUpdate(
            cache,
            {data},
            {id, totalCount, createdAt, isPrivate, name},
            index,
          ),
      })
        .then((res) => console.log('star success,', res))
        .catch((e) => console.log('offline star error', error));
    }
  };

  const [reftchList, setreftchList] = useState(true);
  useEffect(() => {
    reftchRepos();
    return () => {};
  }, [reftchList, isConnected]);
  // console.log({data});
  const reftchRepos = async () => {
    await refetch();
    setreftchList(false);
  };
  const handleRefresh = async () => {
    setrefreshing(true);
    await reftchRepos();
    setrefreshing(false);
  };

  return (
    <View style={styles.container}>
      {loading && <Text style={styles.textStyle}>loading...</Text>}
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
                createdAt,
                isPrivate,
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
                      onPress={() =>
                        starThSelectedRepo(
                          {
                            id,
                            totalCount,
                            createdAt,
                            isPrivate,
                            name,
                          },
                          index,
                        )
                      }
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
                        onPress={() =>
                          starThSelectedRepo(
                            {
                              id,
                              totalCount,
                              createdAt,
                              isPrivate,
                              name,
                            },
                            index,
                          )
                        }
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
