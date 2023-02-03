export const SELECT_DISCUSS_LIST = `query SELECT_DISCUSS_LIST(
  $pageParam: PageParam
  $query: String
  $user: String
  $category: String
  $term: String
  $prefix: String
  $progress: String
  $discussType: String
  $searchType: String
  $searchAfter: JSON
) {
  discussList(
    pageParam: $pageParam
    query: $query
    user: $user
    category: $category
    term: $term
    prefix: $prefix
    progress: $progress
    discussType: $discussType
    searchType: $searchType
    searchAfter: $searchAfter
  ) {
    total
    list {
      id
      title
      content
      seContent
      created
      commentsLength
      likesLength
      visit
      category
      prefix
      groupNotice
      user {
        id
        nickname
        username
        profileImage {
          id
          name
          label {
            ko
            en
            ja
            vn
          }
          filename
          imageType
          dimension {
            width
            height
          }
          trimmed {
            filename
            width
            height
          }
        }
        status {
          following
          follower
        }
        description
        role
      }
      images {
        filename
        imageUrl
      }
      sticker {
        id
        name
        label {
          ko
          en
          ja
          vn
        }
        filename
        imageType
        dimension {
          width
          height
        }
        trimmed {
          filename
          width
          height
        }
      }
      progress
      thumbnail
      reply
      bestComment {
        id
        user {
          id
          nickname
          username
          profileImage {
            id
            name
            label {
              ko
              en
              ja
              vn
            }
            filename
            imageType
            dimension {
              width
              height
            }
            trimmed {
              filename
              width
              height
            }
          }
          status {
            following
            follower
          }
          description
          role
        }
        content
        created
        removed
        blamed
        commentsLength
        likesLength
        isLike
        hide
        image {
          id
          name
          label {
            ko
            en
            ja
            vn
          }
          filename
          imageType
          dimension {
            width
            height
          }
          trimmed {
            filename
            width
            height
          }
        }
        sticker {
          id
          name
          label {
            ko
            en
            ja
            vn
          }
          filename
          imageType
          dimension {
            width
            height
          }
          trimmed {
            filename
            width
            height
          }
        }
      }
      blamed
    }
    searchAfter
  }
}`;

export const SELECT_MINIMAL_DISCUSS_LIST = `query SELECT_MINIMAL_DISCUSS_LIST(
  $pageParam: PageParam
  $query: String
  $user: String
  $category: String
  $term: String
  $prefix: String
  $progress: String
  $discussType: String
  $searchType: String
  $searchAfter: JSON
) {
  discussList(
    pageParam: $pageParam
    query: $query
    user: $user
    category: $category
    term: $term
    prefix: $prefix
    progress: $progress
    discussType: $discussType
    searchType: $searchType
    searchAfter: $searchAfter
  ) {
    list {
      id
      content
      created
      category
      user {
        id
        username
        nickname
        profileImage {
          id
          filename
          imageType
        }
        coverImage {
          id
          filename
          imageType
        }
        status {
          following
          follower
        }
        role
      }
      image {
        id
        name
        filename
        imageType
      }
      sticker {
        id
        name
        filename
        imageType
      }
    }
  }
}`;
