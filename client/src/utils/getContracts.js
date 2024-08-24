import EventManagerContract from "../../build/contracts/EventManager.json";
import TicketNFTContract from "../../build/contracts/TicketNFT.json";
import getWeb3 from "./getWeb3";

const getContracts = async () => {
  const web3 = await getWeb3();
  const networkId = await web3.eth.net.getId();
  
  const eventManagerDeployedNetwork = EventManagerContract.networks[networkId];
  const eventManager = new web3.eth.Contract(
    EventManagerContract.abi,
    eventManagerDeployedNetwork && eventManagerDeployedNetwork.address,
  );

  const ticketNFTDeployedNetwork = TicketNFTContract.networks[networkId];
  const ticketNFT = new web3.eth.Contract(
    TicketNFTContract.abi,
    ticketNFTDeployedNetwork && ticketNFTDeployedNetwork.address,
  );

  return { eventManager, ticketNFT, web3 };
};

export default getContracts;