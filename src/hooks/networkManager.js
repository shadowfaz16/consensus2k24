// networkManager.js
let networkInstance = null;

export const setNetworkInstance = (network) => {
  networkInstance = network;
};

export const getNetworkInstance = () => {
  return networkInstance;
};
