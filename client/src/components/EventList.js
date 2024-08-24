import React, { useState, useEffect } from 'react';
import getContracts from '../utils/getContracts';

function EventList({ onSelectEvent }) {
  const [eventManager, setEventManager] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const init = async () => {
      const { eventManager } = await getContracts();
      setEventManager(eventManager);
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
    <div>
      <h2>Select an Event</h2>
      <ul>
        {events.map((event, index) => (
          <li key={index} onClick={() => onSelectEvent(index + 1)}>
            {event.name} - {new Date(event.date * 1000).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EventList;