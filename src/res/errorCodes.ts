// error names coming from server
// !!! Names must be the same as for field of validation_error locale
// !!! To get Error message from locale you must thransform it toLowerCase
export enum errCode {
  userExist = 'USER_EXISTS',
  userNoExist = 'USER_NOT_FOUND',
  wrongPassword = 'WRONG_PASSWORD',
}
