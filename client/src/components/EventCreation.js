import React, { useState, useEffect } from 'react';
import getContracts from '../utils/getContracts';
import '../css/eventCreation.css';
import Web3 from 'web3';

function EventCreation() {
  const [date, setDate] = useState(''); // for ui
  const [eventManager, setEventManager] = useState(null);
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [eventDate, setEventDate] = useState('');
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
    await eventManager.methods.createEvent(name, details, eventDate, Web3.utils.toWei(ticketPrice, 'ether'), totalTickets).send({ from: accounts[0] });
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <label htmlFor="eventName">Event Name:</label>
      <input
        type="text"
        id="eventName" 
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter event name"
        required
      />
      <label htmlFor="eventDetails">Event Details:</label>
      <textarea
        id="eventDetails"
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="Describe your event"
        required
      />
      <label htmlFor="eventDate">Event Date:</label>
      <input
        type="date"
        id="eventDate"
        value={date}
        onChange={(e) => {
          setDate(e.target.value)
          setEventDate(Math.floor(e.target.valueAsDate.getTime() / 1000))
        }}
        required
      />
      <div className="ticket-info">
        <label htmlFor="ticketPrice">Ticket Price in ETH:</label>
        <input
          type="number"
          id="ticketPrice"
          value={ticketPrice}
          onChange={(e) => {
            if (e.target.value >= 0) 
              setTicketPrice(e.target.value)}}
          step="0.001"
          placeholder="Price per ticket"
          required
        />
        <label htmlFor="totalTickets">Total Tickets:</label>
        <input
          type="number"
          id="totalTickets"
          value={totalTickets}
          onChange={(e) => {
            if (e.target.value >= 0) 
              setTotalTickets(e.target.value)}}
          placeholder="Number of tickets available"
          required
        />
      </div>
      <button type="submit">Create Event</button>
    </form>
  );
}

export default EventCreation;