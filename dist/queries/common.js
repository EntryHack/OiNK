"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROHIBITED_WORD = exports.SELECT_TOPICS = void 0;
exports.SELECT_TOPICS = `query SELECT_TOPICS($pageParam: PageParam, $searchAfter: JSON) {
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
exports.PROHIBITED_WORD = `query ($type: String, $word: String) {
  prohibitedWord(type: $type, word: $word) {
    status
    result
  }
}`;
