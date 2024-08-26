import React, { useState, useEffect } from 'react';
import getContracts from '../utils/getContracts';
import Web3 from 'web3';
import '../css/EventList.css';

function EventList({ onSelectEvent }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const init = async () => {
      const { eventManager } = await getContracts();
      const eventCount = await eventManager.methods.eventCount().call();
      let eventList = [];
      for (let i = 1; i <= eventCount; i++) {
        const event = await eventManager.methods.events(i).call();
        eventList.push(event);
      }
      setEvents(eventList);
    };
    init();
  }, []);

  return (
    <div className="event-list">
      <h2>Select an Event</h2>
      <ul>
        {events.map((event, index) => (
          !event.isFinalized && (
          <li key={index} onClick={() => onSelectEvent(index + 1)}>
            <div>
              <h4>{event.name}</h4>
              <p>{event.details}</p>
              <p>Date: {new Date(Number(event.date) * 1000).toLocaleDateString('en-GB')}</p>
              <p>Ticket price is {Web3.utils.fromWei(event.ticketPrice, 'ether')} ETH</p>
              <p>Event owner address: {event.owner}</p>
              <p>Tickets sold: {Number(event.ticketsSold)}</p>
              <p>Tickets Left: {Number(event.totalTickets - event.ticketsSold)}</p>
            </div>
          </li>
        )))}
      </ul>
    </div>
  );
}

export default EventList;