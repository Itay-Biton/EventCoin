import React, { useState, useEffect } from 'react';
import getContracts from '../utils/getContracts';

function EventCreation() {
  const [eventManager, setEventManager] = useState(null);
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [date, setDate] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [totalTickets, setTotalTickets] = useState('');

  useEffect(() => {
    const init = async () => {
      const { eventManager } = await getContracts();
      setEventManager(eventManager);
    };
    init();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    await eventManager.methods.createEvent(name, details, new Date(date).getTime() / 1000, ticketPrice, totalTickets).send({ from: accounts[0] });
    // Handle success
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Event Name" />
      <input type="text" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Event Details" />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <input type="number" value={ticketPrice} onChange={(e) => setTicketPrice(e.target.value)} placeholder="Ticket Price" />
      <input type="number" value={totalTickets} onChange={(e) => setTotalTickets(e.target.value)} placeholder="Total Tickets" />
      <button type="submit">Create Event</button>
    </form>
  );
}

export default EventCreation;