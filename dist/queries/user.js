"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHANGE_USER_EMAIL = exports.CHECK_WORD = exports.USER_EXITS = exports.SIGNUP_BY_USERNAME = exports.SIGNIN_BY_USERNAME = void 0;
exports.SIGNIN_BY_USERNAME = `mutation (
  $username: String!
  $password: String!
  $rememberme: Boolean
  $captchaValue: String
  $captchaKey: String
  $captchaType: String
) {
  signinByUsername(
    username: $username
    password: $password
    rememberme: $rememberme
    captchaValue: $captchaValue
    captchaKey: $captchaKey
    captchaType: $captchaType
  ) {
    id
    username
    nickname
    role
    isEmailAuth
    isSnsAuth
    isPhoneAuth
    studentTerm
    alarmDisabled
    status {
      userStatus
    }
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
    banned {
      username
      nickname
      reason
      bannedCount
      bannedType
      projectId
      startDate
      userReflect {
        status
        endDate
      }
    }
    isProfileBlocked
  }
}`;
exports.SIGNUP_BY_USERNAME = `mutation (
  $role: String!
  $grade: String!
  $gender: String!
  $nickname: String!
  $email: String
  $username: String!
  $password: String!
  $passwordConfirm: String!
  $mobileKey: String
) {
  signupByUsername(
    role: $role
    grade: $grade
    gender: $gender
    nickname: $nickname
    email: $email
    username: $username
    password: $password
    passwordConfirm: $passwordConfirm
    mobileKey: $mobileKey
  ) {
    id
    username
    nickname
    role
    isEmailAuth
    isSnsAuth
    isPhoneAuth
    studentTerm
    alarmDisabled
    status {
      userStatus
    }
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
    banned {
      username
      nickname
      reason
      bannedCount
      bannedType
      projectId
      startDate
      userReflect {
        status
        endDate
      }
    }
    isProfileBlocked
  }
}`;
exports.USER_EXITS = `query ($username: String, $nickname: String, $email: String) {
  existsUser(username: $username, nickname: $nickname, email: $email) {
    exists
  }
}`;
exports.CHECK_WORD = `query ($type: String, $word: String) {
  prohibitedWord(type: $type, word: $word) {
    status
    result
  }
}`;
exports.CHANGE_USER_EMAIL = `mutation ($email: String!) {
  changeUserEmail(email: $email) {
    status
    result
  }
}`;
