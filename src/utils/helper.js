const {userAgent} = navigator;

export const isMac = /macintosh/i.test(userAgent);
