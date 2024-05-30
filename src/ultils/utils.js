// utils.js
export const bytesToHex = (bytes) => {
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  };
  
 export const bytesToBase64 = (bytes) => {
    return btoa(String.fromCharCode(...bytes));
  };
  