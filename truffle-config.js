module.exports = {
  networks: {
    development: {
        host: "127.0.0.1",    
        port: 8545,            
        network_id: "*",       
        gas: 80000000,           // Gas limit
        gasPrice: 20000000000,  // 20 gwei (in wei)
    }
},
  compilers: {
    solc: {
      version: "0.8.20"
    }
  }
};
