export const SELECT_TOPICS = `query SELECT_TOPICS($pageParam: PageParam, $searchAfter: JSON) {
  topicList(pageParam: $pageParam, searchAfter: $searchAfter) {
    searchAfter
    list {
      id
      params
      template
      thumbUrl
      category
      target
      isRead
      created
      updated
      link {
        category
        target
        hash
        groupId
      }
      topicinfo {
        category
        targetId
      }
    }
  }
}`;

export const PROHIBITED_WORD = `query ($type: String, $word: String) {
  prohibitedWord(type: $type, word: $word) {
    status
    result
  }
}`;
