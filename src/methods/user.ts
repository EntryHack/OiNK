// import { SIGNIN_BY_USERNAME, SIGNUP_BY_USERNAME } from "@/queries/user";
// import { Fetch } from "@/types";
// import gql from "@/utils/graphql";

// export const signin = (fetch: Fetch, username: string, password: string, remember: boolean = true) =>
//   gql(fetch, SIGNIN_BY_USERNAME, { username, password, rememberme: remember });

// export const signup = (fetch: Fetch, username: string, password: string, nickname: string, email: string = "") =>
//   gql<{
//     signupByUsername: {
//       id: string;
//       username: string;
//       nickname: string;
//       role: "member";
//       isEmailAuth: boolean;
//       isSnsAuth: boolean;
//       isPhoneAuth: boolean;
//       studentTerm: boolean;
//       alarmDisabled: null;
//       status: { userStatus: "USE" };
//       profileImage: null;
//       banned: null;
//       isProfileBlocked: null;
//     };
//   }>(fetch, SIGNUP_BY_USERNAME, {
//     username,
//     password,
//     passwordConfirm: password,
//     role: "member",
//     grade: "11",
//     gender: "male",
//     nickname,
//     email,
//     mobileKey: "",
//   }).then((data) => {
//     if (data.success) return { success: true, data: data.data.signupByUsername };
//     else return data;
//   });
