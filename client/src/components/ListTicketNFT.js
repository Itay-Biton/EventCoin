import React, { useState, useEffect } from 'react';
import getContracts from '../utils/getContracts';
import TicketNFTDisplay from './TicketNFTDisplay';
import '../css/ListTicketNFT.css';

function ListTicketNFT() {
  const [ticketIds, setTicketIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAccountAndNFTs = async () => {
      const { ticketNFT } = await getContracts();
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const ids = await ticketNFT.methods.getOwnedTokens(accounts[0]).call();
      setTicketIds(ids);
      setLoading(false);
    };

    loadAccountAndNFTs();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (ticketIds.length === 0) {
    return <div>No TicketNFTs found for this account.</div>;
  }

  return (
    <div className="nft-list">
      <h2>My TicketNFTs</h2>
      {ticketIds.map((tokenId) => (
        <TicketNFTDisplay key={tokenId} tokenId={tokenId} />
      ))}
    </div>
  );
}

export default ListTicketNFT;