// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract EventManager {
    struct Task {
        string name;
        string details;
        uint256 reward;
        uint8 minRating;
        bool completed;
        address assignedCompany;
        uint8 ratingSum;
        uint8 ratingCount;
    }

    struct Company {
        address companyAddress;
        string name;
    }

    struct Event {
        string name;
        string details;
        uint256 date;
        uint256 cashBank;
        uint256 ticketPrice;
        address owner;
        Task[] tasks;
        Company[] companies;
        mapping(address => bool) hasTicket;
    }

    mapping(uint => Event) public events;
    uint public eventCount;
    TicketNFT public ticketNFT;

    constructor(address _ticketNFT) {
        ticketNFT = TicketNFT(_ticketNFT);
    }

    function createEvent(
        string memory _name, 
        string memory _details, 
        uint256 _date, 
        uint256 _ticketPrice
    ) public {
        eventCount++;
        Event storage newEvent = events[eventCount];
        newEvent.name = _name;
        newEvent.details = _details;
        newEvent.date = _date;
        newEvent.ticketPrice = _ticketPrice;
        newEvent.owner = msg.sender;
        newEvent.cashBank = 0;
    }

    function addMoneyToCashBank(uint _eventId) public payable {
        Event storage eventInstance = events[_eventId];
        require(eventInstance.owner == msg.sender, "Only the event owner can add money.");
        eventInstance.cashBank += msg.value;
    }

    function createTask(
        uint _eventId, 
        string memory _name, 
        string memory _details, 
        uint256 _reward, 
        uint8 _minRating
    ) public {
        Event storage eventInstance = events[_eventId];
        require(eventInstance.owner == msg.sender, "Only the event owner can create tasks.");
        require(eventInstance.cashBank >= _reward, "Not enough money in the cash bank.");
        eventInstance.tasks.push(Task({
            name: _name,
            details: _details,
            reward: _reward,
            minRating: _minRating,
            completed: false,
            assignedCompany: address(0),
            ratingSum: 0,
            ratingCount: 0
        }));
    }

    function addCompany(uint _eventId, address _companyAddress, string memory _name) public {
        Event storage eventInstance = events[_eventId];
        require(eventInstance.owner == msg.sender, "Only the event owner can add companies.");
        eventInstance.companies.push(Company({
            companyAddress: _companyAddress,
            name: _name
        }));
    }

    function assignCompanyToTask(uint _eventId, uint _taskId, address _companyAddress) public {
        Event storage eventInstance = events[_eventId];
        require(eventInstance.owner == msg.sender, "Only the event owner can assign companies.");
        require(!eventInstance.tasks[_taskId].completed, "Cannot assign a company to a completed task.");
        eventInstance.tasks[_taskId].assignedCompany = _companyAddress;
    }

    function purchaseTicket(
        uint _eventId,
        uint256 _row, 
        uint256 _seat
    ) public payable {
        Event storage eventInstance = events[_eventId];
        require(!eventInstance.hasTicket[msg.sender], "Ticket already purchased.");
        require(msg.value == eventInstance.ticketPrice, "Incorrect ticket price.");

        uint256 tokenId = ticketNFT.mint(
            msg.sender, 
            eventInstance.name, 
            eventInstance.details, 
            eventInstance.date, 
            _row, 
            _seat
        );
        eventInstance.cashBank += msg.value;
        eventInstance.hasTicket[msg.sender] = true;
    }

    function completeTask(uint _eventId, uint _taskId) public {
        Event storage eventInstance = events[_eventId];
        require(eventInstance.tasks[_taskId].assignedCompany == msg.sender, "Only the assigned company can complete the task.");
        eventInstance.tasks[_taskId].completed = true;
    }

    function rateTask(uint _eventId, uint _taskId, uint8 _rating) public {
        Event storage eventInstance = events[_eventId];
        require(eventInstance.tasks[_taskId].completed, "Task must be completed to be rated.");
        require(eventInstance.tasks[_taskId].assignedCompany != msg.sender, "Executing company cannot rate their own task.");
        bool isCompanyInEvent = false;
        for (uint i = 0; i < eventInstance.companies.length; i++) {
            if (eventInstance.companies[i].companyAddress == msg.sender) {
                isCompanyInEvent = true;
                break;
            }
        }
        require(isCompanyInEvent, "Only companies in the event can rate tasks.");
        eventInstance.tasks[_taskId].ratingSum += _rating;
        eventInstance.tasks[_taskId].ratingCount++;
    }

    function finalizeEvent(uint _eventId) public {
        Event storage eventInstance = events[_eventId];
        require(eventInstance.owner == msg.sender, "Only the event owner can finalize the event.");
        require(block.timestamp >= eventInstance.date, "Event date has not passed yet.");

        for (uint i = 0; i < eventInstance.tasks.length; i++) {
            Task storage task = eventInstance.tasks[i];
            if (task.completed) {
                uint8 averageRating = task.ratingSum / task.ratingCount;
                if (averageRating >= task.minRating) {
                    payable(task.assignedCompany).transfer(task.reward);
                    eventInstance.cashBank -= task.reward;
                }
            }
        }

        payable(eventInstance.owner).transfer(eventInstance.cashBank);
    }
}