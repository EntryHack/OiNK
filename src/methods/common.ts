// import { SELECT_TOPICS } from "@/queries/common";
// import { Fetch } from "@/types";
// import gql from "@/utils/graphql";

// export const getTopics = (fetch: Fetch, display: number) =>
//   gql<{
//     topicList: {
//       searchAfter: string;
//       list: {
//         id: string;
//         params: string[];
//         template: string;
//         thumbUrl: string | null;
//         category: string;
//         target: string;
//         isRead: boolean;
//         created: string;
//         updated: string;
//         link: { category: string; target: string; hash: string | null; groupId: string | null };
//         topicInfo: { category: string | null; targetId: string | null };
//       }[];
//     };
//   }>(fetch, SELECT_TOPICS, { pageParam: { display } }).then((data) => {
//     if (data.success) return { success: true, data: data.data.topicList };
//     else return data;
//   });
