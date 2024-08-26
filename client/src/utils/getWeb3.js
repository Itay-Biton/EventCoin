import Web3 from 'web3';

const getWeb3 = async () => {
  try {
    // Check for injected Web3 (MetaMask)
    if (window.ethereum) {
      const web3Injected = new Web3(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' }); // Request account access
      console.log('Injected web3 detected.');
      return web3Injected;
    } else if (window.web3) {
      // Legacy dapp browsers (less common)
      const web3Legacy = window.web3;
      console.log('Injected web3 detected (legacy).');
      return web3Legacy;
    } else {
      // No injected web3 instance is detected, fall back to Ganache
      const localProvider = new Web3.providers.HttpProvider('http://127.0.0.1:8888');
      const web3Local = new Web3(localProvider);
      console.log('Using Ganache provider.');
      return web3Local;
    }
  } catch (error) {
    console.error('Error obtaining web3:', error);
    throw error; // Re-throw the error for handling in the calling code
  }
};

export default getWeb3;