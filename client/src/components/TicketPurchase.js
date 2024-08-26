import React, { useState, useEffect } from 'react';
import getContracts from '../utils/getContracts';
import Web3 from 'web3';

function TicketPurchase({ eventId }) {
  const [eventManager, setEventManager] = useState(null);
  const [ticketNFT, setTicketNFT] = useState(null);
  const [ticketPrice, setTicketPrice] = useState(null);
  const [ticketsSold, setTicketsSold] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);
  const [seatAvailability, setSeatAvailability] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [ticketId, setTicketId] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { eventManager, ticketNFT} = await getContracts();
      setEventManager(eventManager);
      setTicketNFT(ticketNFT)
      const event = await eventManager.methods.events(eventId).call();
      setTicketPrice(Web3.utils.fromWei(event.ticketPrice, 'ether'));
      setTotalTickets(event.totalTickets)
      setTicketsSold(event.ticketsSold);
      const availability = await eventManager.methods.getSeatAvailability(eventId).call();
      setSeatAvailability(availability);
    };
    init();
  }, [eventId]);

  const handlePurchaseTicket = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const ticketPriceInWei = Web3.utils.toWei(ticketPrice, 'ether');
      
      const receipt = await eventManager.methods.purchaseTicket(eventId, selectedSeat-1).send({
        from: accounts[0],
        value: ticketPriceInWei
      });
      setTicketId(receipt.events.TicketPurchased.returnValues.ticketID)
      const event = await eventManager.methods.events(eventId).call();
      setTicketsSold(event.ticketsSold);
    } catch (error) {
      console.error("Error purchasing ticket:", error);
    }
  };

  return (
    <div>
      <h2>Ticket Price: {ticketPrice ? `${ticketPrice} ETH` : 'Loading...'}</h2>

      {eventManager !== null && totalTickets !== ticketsSold? (
        <div>
          <label htmlFor="seatSelect">Select a Seat:</label>
            <select
            id="seatSelect"
            value={selectedSeat || ""}
            onChange={(e) => setSelectedSeat(e.target.value)}
          >
            <option value="" disabled={true}>Select a seat</option>
            {seatAvailability !== null && seatAvailability.map((isAvailable, i) => (
              isAvailable && (
                <option key={i + 1} value={i + 1}>
                  Seat {i + 1}
                </option>
              )
            ))}
          </select>
          <br/>
          <button onClick={handlePurchaseTicket} disabled={!ticketPrice || !selectedSeat}>Buy Ticket</button>
        </div>
      ) : (
        <h3>sold out</h3>
      )}

      {ticketId && (
        <div>
          <p>You need to add this ticket to your wallet manualy</p>
          <p>Contract Address: {ticketNFT._address}</p>
          <p>Tocken ID: {ticketId ? `${ticketId}` : 'Loading...'}</p>
        </div>
      )}
      <p>Tickets Sold: {ticketsSold ? `${ticketsSold}` : '0'}</p>
    </div>
  );
}

export default TicketPurchase;