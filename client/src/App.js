import React, { useState } from 'react';
import EventCreation from './components/EventCreation';
import CompanyManagement from './components/CompanyManagement';
import TaskManagement from './components/TaskManagement';
import TicketPurchase from './components/TicketPurchase';
import EventList from './components/EventList';

function App() {
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <div>
      <h1>Event Management DApp</h1>
      {!selectedEvent ? (
        <EventList onSelectEvent={setSelectedEvent} />
      ) : (
        <>
          <EventCreation />
          <CompanyManagement eventId={selectedEvent} />
          <TaskManagement eventId={selectedEvent} />
          <TicketPurchase eventId={selectedEvent} />
        </>
      )}
    </div>
  );
}

export default App;