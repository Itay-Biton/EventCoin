import React, { useState, useEffect } from 'react';
import getContracts from '../utils/getContracts';
import TaskManagement from './TaskManagement';
import '../css/CompanyManagement.css';  // Make sure this path is correct

function CompanyManagement({ eventId }) {
  const [eventManager, setEventManager] = useState(null);
  const [eventName, setEventName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companies, setCompanies] = useState([]);
  const [account, setAccount] = useState(null);
  const [eventOwner, setEventOwner] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { eventManager } = await getContracts();
      setEventManager(eventManager);
      const eventCompanies = await eventManager.methods.getAllCompanies(eventId).call();
      setCompanies(eventCompanies);
      const event = await eventManager.methods.events(eventId).call();
      setEventName(event.name);
      setEventOwner(event.owner.toLowerCase());
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
    };
    init();
  }, [eventId]);

  const handleAddCompany = async (e) => {
    e.preventDefault();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    await eventManager.methods.addCompany(eventId, companyAddress, companyName).send({ from: accounts[0] });
    const eventCompanies = await eventManager.methods.getAllCompanies(eventId).call();
    setCompanies(eventCompanies);
  };

  const handleRequestCompany = async (e) => {
    e.preventDefault();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    await eventManager.methods.requestToJoin(eventId, companyName).send({ from: accounts[0] });
    alert("Request sent");
  };

  const approveRequest = async (e, companyAddress) => {
    e.preventDefault();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    await eventManager.methods.approveCompany(eventId, companyAddress).send({ from: accounts[0] });
    const eventCompanies = await eventManager.methods.getAllCompanies(eventId).call();
    setCompanies(eventCompanies);
  };

  return (
    <div className="company-management">
      <h1>{eventName} Dashboard</h1>
      {eventOwner === account ? (
        <div>
          <h2>Add company to your event</h2>
          <form onSubmit={handleAddCompany}>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Company Name"
            />
            <input
              type="text"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              placeholder="Company Address"
            />
            <button type="submit">Add Company</button>
          </form>
          <h2>Current companies:</h2>
          <ul>
            {companies.map((company, index) => (
              <li key={index}>
                {company.name} - {company.approved ? 'Approved' : 'Pending: '}
                {!company.approved && <button onClick={(e) => approveRequest(e, company.companyAddress)}>Approve</button>}
              </li>
            ))}
          </ul>
          <TaskManagement eventId={eventId} isOwner={true} />
        </div>
      ) : (
        <div>
          {companies.find(company => company.companyAddress.toLowerCase() === account) ? (
            <div>
              {companies.find(company => company.companyAddress.toLowerCase() === account && company.approved) ? (
                <TaskManagement eventId={eventId} isOwner={false} />
              ) : (
                <p>waiting to be approved</p>
              )}
            </div>
          ) : (
            <form onSubmit={handleRequestCompany}>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Company Name"
              />
              <button type="submit">Request to join</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default CompanyManagement;