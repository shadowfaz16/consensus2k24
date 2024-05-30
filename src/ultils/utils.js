export const bytesToBase64 = (bytes) => {
  console.log('bytesToBase64 input:', bytes);

  if (bytes instanceof Uint8Array) {
    return btoa(String.fromCharCode(...bytes));
  } else if (Array.isArray(bytes)) {
    return btoa(String.fromCharCode(...Uint8Array.from(bytes)));
  } else if (typeof bytes === 'object' && bytes !== null) {
    // Convert object to Uint8Array
    const byteArray = Uint8Array.from(Object.values(bytes));
    return btoa(String.fromCharCode(...byteArray));
  } else if (typeof bytes === 'string') {
    return btoa(bytes);
  } else {
    throw new TypeError("Expected input to be a Uint8Array, an array of numbers, a string, or an object resembling an array");
  }
};

export const bytesToHex = (bytes) => {
  console.log('bytesToHex input:', bytes);

  if (bytes instanceof Uint8Array) {
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  } else if (Array.isArray(bytes)) {
    return Array.from(Uint8Array.from(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
  } else if (typeof bytes === 'object' && bytes !== null) {
    // Convert object to Uint8Array
    const byteArray = Uint8Array.from(Object.values(bytes));
    return Array.from(byteArray, byte => byte.toString(16).padStart(2, '0')).join('');
  } else if (typeof bytes === 'string') {
    return Array.from(new TextEncoder().encode(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
  } else {
    throw new TypeError("Expected input to be a Uint8Array, an array of numbers, a string, or an object resembling an array");
  }
};
