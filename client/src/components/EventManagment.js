import React, { useState, useEffect } from 'react';
import getContracts from '../utils/getContracts';
import Web3 from 'web3';

function EventManagement({ eventId }) {
    const [account, setAccount] = useState(null);
    const [eventOwner, setEventOwner] = useState(null);
    const [eventManager, setEventManager] = useState(null);
    const [event, setEvent] = useState({});
    const [cashBank, setCashBank] = useState('');
    const [amountToAdd, setAmountToAdd] = useState('');
    const [canFinalize, setCanFinalize] = useState(false);

    useEffect(() => {
        const init = async () => {
            const { eventManager } = await getContracts();
            setEventManager(eventManager);
            const event = await eventManager.methods.events(eventId).call();
            setEvent(event);
            setCashBank(Web3.utils.fromWei(event.cashBank, 'ether'));

            const today = new Date();
            if (today > new Date(Number(event.date) * 1000)) 
                setCanFinalize(true);

            setEventOwner(event.owner.toLowerCase());
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setAccount(accounts[0]);
        };
        init();
    }, [eventId]);

    const handleAddMoney = async (e) => {
        e.preventDefault();
        if (amountToAdd <= 0) {
            alert("Amount should be greater than 0");
            return;
        }

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        await eventManager.methods.addMoneyToCashBank(eventId).send({ 
            from: accounts[0],
            value: Web3.utils.toWei(amountToAdd, 'ether') 
        });
        // Reload cash bank amount
        setCashBank(Web3.utils.fromWei(event.cashBank, 'ether'));
    };

    const handleFinalizeEvent = async () => {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        await eventManager.methods.finalizeEvent(eventId).send({ from: accounts[0] });
        alert("Event finalized");
    };

    if (eventOwner !== account) {
        return null;
    }

    return (
        <div>
        <h1>{event.name} Management</h1>
        <p>Cash Bank: {cashBank} ETH</p>
        
        <form onSubmit={handleAddMoney}>
            <input
            type="number"
            value={amountToAdd}
            onChange={(e) => setAmountToAdd(e.target.value)}
            placeholder="Amount to add (ETH)"
            step="0.001"
            min="0"
            />
            <button type="submit">Add Money</button>
        </form>

        {canFinalize && (
            <div>
            <h2>Finalize Event</h2>
            <button onClick={handleFinalizeEvent}>Finalize Event</button>
            </div>
        )}
        </div>
    );
}

export default EventManagement;