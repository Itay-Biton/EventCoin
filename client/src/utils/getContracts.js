import EventManagerContract from "../contracts/EventManager.json";
import TicketNFTContract from "../contracts/TicketNFT.json";
import getWeb3 from "./getWeb3";

async function getContracts() {
  const web3 = await getWeb3();
  const networkId = await web3.eth.net.getId();

  const eventManagerDeployedNetwork = EventManagerContract.networks[networkId];
  const eventManagerAddress = eventManagerDeployedNetwork ? eventManagerDeployedNetwork.address : null;
  const eventManager = new web3.eth.Contract(
    EventManagerContract.abi,
    eventManagerAddress,
  );

  const ticketNFTDeployedNetwork = TicketNFTContract.networks[networkId];
  const ticketNFT = new web3.eth.Contract(
    TicketNFTContract.abi,
    ticketNFTDeployedNetwork && ticketNFTDeployedNetwork.address,
  );
  return { eventManager, ticketNFT, web3 };
}

export default getContracts;