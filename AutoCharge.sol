// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AutoCharge {

    // Price of energy in WEI per kWh. (e.g., 0.0001 ETH per kWh)
    uint256 public pricePerKwh = 0.0001 ether;

    struct Session {
        address vehicle;
        address station;
        uint256 startTime;
        bool isActive;
    }

    mapping(address => Session) public activeSessions;

    event SessionCompleted(
        address indexed station,
        address indexed vehicle,
        uint256 energyKwh,
        uint256 cost
    );

    // Called by the station to start a session for a vehicle
    function startSession(address _vehicle) public {
        require(!activeSessions[msg.sender].isActive, "Station is already busy.");
        
        activeSessions[msg.sender] = Session({
            vehicle: _vehicle,
            station: msg.sender,
            startTime: block.timestamp,
            isActive: true
        });
    }

    // Called by the EV to end the session and pay for the energy
    function endSession(address _station, uint256 _energyKwh) public payable {
        Session memory currentSession = activeSessions[_station];

        require(currentSession.isActive, "No active session for this station.");
        require(msg.sender == currentSession.vehicle, "Only the vehicle can end this session.");
        
        uint256 finalCost = _energyKwh * pricePerKwh;
        require(msg.value >= finalCost, "Insufficient payment for energy consumed.");

        // Transfer payment to the station owner
        (bool success, ) = payable(_station).call{value: finalCost}("");
        require(success, "Payment transfer failed.");

        emit SessionCompleted(_station, msg.sender, _energyKwh, finalCost);
        delete activeSessions[_station];
    }
}