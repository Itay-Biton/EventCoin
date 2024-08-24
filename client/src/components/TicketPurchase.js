import React, { useState, useEffect } from 'react';
import getContracts from '../utils/getContracts';

function TicketPurchase({ eventId }) {
  const [eventManager, setEventManager] = useState(null);
  const [ticketPrice, setTicketPrice] = useState('');
  const [ticketsSold, setTicketsSold] = useState(0);

  useEffect(() => {
    const init = async () => {
      const { eventManager } = await getContracts();
      setEventManager(eventManager);
      const event = await eventManager.methods.events(eventId).call();
      setTicketPrice(event.ticketPrice);
      setTicketsSold(event.ticketsSold);
    };
    init();
  }, [eventId]);

  const handlePurchaseTicket = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    await eventManager.methods.purchaseTicket(eventId).send({ from: accounts[0], value: ticketPrice });
    // Update tickets sold
    const event = await eventManager.methods.events(eventId).call();
    setTicketsSold(event.ticketsSold);
  };

  return (
    <div>
      <h2>Ticket Price: {ticketPrice} wei</h2>
      <button onClick={handlePurchaseTicket}>Buy Ticket</button>
      <p>Tickets Sold: {ticketsSold}</p>
    </div>
  );
}

export default TicketPurchase;