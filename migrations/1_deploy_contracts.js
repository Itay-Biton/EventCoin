const EventManager = artifacts.require("EventManager");
const TicketNFT = artifacts.require("TicketNFT");

module.exports = async function (deployer) {
    await deployer.deploy(TicketNFT);
    const ticketNFTInstance = await TicketNFT.deployed();

    await deployer.deploy(EventManager, ticketNFTInstance.address);
};