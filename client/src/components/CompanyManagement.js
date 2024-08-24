import React, { useState, useEffect } from 'react';
import getContracts from '../utils/getContracts';

function CompanyManagement({ eventId }) {
  const [eventManager, setEventManager] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const init = async () => {
      const { eventManager } = await getContracts();
      setEventManager(eventManager);
      const eventCompanies = await eventManager.methods.getEventCompanies(eventId).call();
      setCompanies(eventCompanies);
    };
    init();
  }, [eventId]);

  const handleAddCompany = async (e) => {
    e.preventDefault();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    await eventManager.methods.addCompanyToEvent(eventId, companyName).send({ from: accounts[0] });
    // Reload the company list
    const eventCompanies = await eventManager.methods.getEventCompanies(eventId).call();
    setCompanies(eventCompanies);
  };

  return (
    <div>
      <form onSubmit={handleAddCompany}>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Company Name"
        />
        <button type="submit">Add Company</button>
      </form>
      <ul>
        {companies.map((company, index) => (
          <li key={index}>{company.name} - {company.approved ? 'Approved' : 'Pending'}</li>
        ))}
      </ul>
    </div>
  );
}

export default CompanyManagement;