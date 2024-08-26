import React, { useState } from 'react';
import './css/App.css';
import EventCreation from './components/EventCreation';
import CompanyManagement from './components/CompanyManagement';
import TicketPurchase from './components/TicketPurchase';
import EventList from './components/EventList';
import EventManagment from './components/EventManagment';
import ListTicketNFT from './components/ListTicketNFT';

window.global ||= window;

function App() {
  const [creationFormVisible, setCreationFormVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [userType, setUserType] = useState("company");

  const toggleCreationForm = () => {
    setCreationFormVisible(!creationFormVisible);
  };

  const handleUserTypeChange = (e) => {
    setUserType(e.target.value);
  };

  return (
    <div className="app">
      <ListTicketNFT/>
      <h1>Event Management DApp</h1>
      <button onClick={toggleCreationForm}>Toggle Event Creation Form</button>
      {creationFormVisible ? (<EventCreation/>) : null}

      <h1>Joining An Event As</h1>
      <div className="user-type-container">
        <input
          type="radio"
          id="company"
          name="userType"
          value="company"
          checked={userType === "company"}
          onChange={handleUserTypeChange}
        />
        <label htmlFor="company">Company (Join Event)</label>
        <input
          type="radio"
          id="individual"
          name="userType"
          value="individual"
          checked={userType === "individual"}
          onChange={handleUserTypeChange}
        />
        <label htmlFor="individual">Individual (Purchase Ticket)</label>
      </div>
      <button onClick={() => setSelectedEvent(null)}>Clear Selected event</button>
      <EventList onSelectEvent={setSelectedEvent} userType={userType} />
      {selectedEvent != null ? (
        userType === "individual" ? (
          <div>
            <TicketPurchase eventId={selectedEvent} />
          </div>
        ) : (
          <div>
            <EventManagment eventId={selectedEvent} />
            <CompanyManagement eventId={selectedEvent} />
          </div>
        )
      ) : null}
    </div>
  );
}

export default App;