import React, { useState, useEffect } from 'react';
import getContracts from '../utils/getContracts';
import '../css/TicketNFTDisplay.css';

function TicketNFTDisplay({ tokenId }) {
  const [metadata, setMetadata] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      const { ticketNFT } = await getContracts();
      const tokenURI = await ticketNFT.methods.tokenURI(tokenId).call();
      const response = await fetch(tokenURI);
      const metadata = await response.json();
      setMetadata(metadata);
      setImageUrl(metadata.image);
      setLoading(false);
    };

    fetchNFTMetadata();
  }, [tokenId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!metadata) {
    return <div>No metadata found for this NFT.</div>;
  }

  return (
    <div className="nft-display">
      <h2>{metadata.name}</h2>
      <img src={imageUrl} alt={metadata.name} style={{ width: '300px', height: '300px' }} />
      <p>{metadata.description}</p>
      <ul>
        <li><strong>Event Name:</strong> {metadata.eventName}</li>
        <li><strong>Date:</strong> {metadata.date}</li>
        <li><strong>Details:</strong> {metadata.details}</li>
        <li><strong>Seat:</strong> {metadata.seat}</li>
      </ul>
    </div>
  );
}

export default TicketNFTDisplay;