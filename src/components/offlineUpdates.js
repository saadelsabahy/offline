import {GET_REPOS} from './List';

export const addStarUpdate = (
  cache,
  {
    data: {
      addStar: {
        starrable: {
          stargazers: {nodes},
        },
      },
    },
  },
  {id, totalCount, createdAt, isPrivate, name},
  index,
) => {
  try {
    console.log('unstar update');
    const data = cache.readQuery({query: GET_REPOS});

    const {
      viewer: {
        __typename: viewerTypeName,
        repositories: {nodes: cacheNodes, __typename: repositoriesTypeName},
      },
    } = data;

    const newRepos = cacheNodes.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          stargazers: {...t.stargazers, totalCount: +totalCount + 1},
        };
      } else {
        return t;
      }
    });

    cache.writeQuery({
      query: GET_REPOS,
      data: {
        viewer: {
          __typename: viewerTypeName,
          repositories: {
            __typename: repositoriesTypeName,
            nodes: newRepos,
          },
        },
      },
    });
  } catch (error) {
    console.log('update error', error);
  }
};

export const removeStarUpdate = (
  cache,
  {
    data: {
      removeStar: {
        starrable: {
          stargazers: {nodes},
        },
      },
    },
  },
  {id, totalCount, createdAt, isPrivate, name},
  index,
) => {
  try {
    const data = cache.readQuery({query: GET_REPOS});

    const {
      viewer: {
        __typename: viewerTypeName,
        repositories: {nodes: cacheNodes, __typename: repositoriesTypeName},
      },
    } = data;
    // console.log(nodes);
    const newRepos = cacheNodes.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          stargazers: {...t.stargazers, totalCount: +totalCount - 1},
        };
      } else {
        return t;
      }
    });

    cache.writeQuery({
      query: GET_REPOS,
      data: {
        viewer: {
          __typename: viewerTypeName,
          repositories: {
            __typename: repositoriesTypeName,
            nodes: newRepos,
          },
        },
      },
    });
  } catch (error) {
    console.log('update error', error);
  }
};
