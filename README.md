# ⚡ AutoCharge: Decentralized EV Charging Platform

AutoCharge is a proof-of-concept project that demonstrates a seamless, automated payment system for Electric Vehicle (EV) charging using blockchain technology. It eliminates the need for credit cards, RFID fobs, or proprietary apps by allowing the vehicle itself to act as a secure wallet, paying for electricity directly via a smart contract.

This simulation integrates a realistic electrical model from **MATLAB** with a decentralized backend running on a local **Hardhat** blockchain network, controlled by an **Ethers.js** script.

---

## Workflow

The project simulates the entire charging process through a unique, hybrid workflow:

1.  **Session Start:** A Node.js script, simulating a charging station, initiates a charging session by calling the `startSession` function on the `AutoCharge` smart contract. The contract records that the station is now busy.
2.  **Electrical Simulation:** A **MATLAB** script runs a detailed simulation of the charging physics based on defined battery and charger parameters (e.g., charging a 75Ah battery from 20% to 90% SoC).
3.  **Data Hand-off:** After the simulation, MATLAB calculates the precise energy consumed (in kWh) and saves this single value to a `result.txt` file.
4.  **Session End & Payment:** The Node.js script, now simulating the EV, reads the `kwh_consumed` value from `result.txt`. It then calls the `endSession` function on the smart contract, sending the exact payment required in Ether.
5.  **Blockchain Settlement:** The smart contract verifies the payment, transfers the funds from the EV's account to the station's account, logs the event, and marks the station as available again.



---

## Technology Stack

* **Blockchain:** Hardhat (Local Ethereum Node)
* **Smart Contract:** Solidity
* **Backend Scripting & Interaction:** Node.js, Ethers.js
* **Electrical Simulation:** MATLAB
* **Frontend (Optional):** HTML, CSS, JavaScript (with Ethers.js CDN)

---

## Prerequisites

Before you begin, ensure you have the following software installed on your system:

* **Node.js** (v18.x or higher) & npm
* **MATLAB** (with Simulink if using the visual model)
* **VS Code** (or any other code editor)

---

## Setup and Installation

1.  **Clone the Repository (or create the project folder):**
    Open a terminal and navigate to where you want to store the project.

2.  **Initialize the Project:**
    Inside your `AutoChargeProject` folder, run the following commands to set up Hardhat and install all necessary dependencies.

    ```bash
    # Initialize a node project
    npm init -y

    # Install Hardhat
    npm install --save-dev hardhat

    # Initialize a Hardhat project (select "Create a JavaScript project")
    npx hardhat

    # Install Hardhat's toolbox and Ethers.js
    npm install --save-dev @nomicfoundation/hardhat-toolbox
    npm install ethers
    ```

3.  **Add Project Files:**
    Make sure all the project files (`AutoCharge.sol`, `deploy.js`, `simulation.js`, `simulate_charging_code.m`, etc.) are in their correct locations within the project directory.

---

## How to Run the Full Simulation

Follow these steps in order to execute a complete, end-to-end simulation.

### Step 1: Start the Local Blockchain

Open a **new terminal** and start the Hardhat blockchain node. This terminal must remain open for the entire duration of the simulation.

```bash
npx hardhat node
This will display a list of 20 test accounts, their balances, and their private keys.

Step 2: Deploy the Smart Contract
Open a second terminal. Deploy the AutoCharge.sol contract to the local node.

Bash

npx hardhat run scripts/deploy.js --network localhost
The terminal will output a contract address (e.g., 0x5FbDB2315678afecb367f032d93F642f64180aa3). Copy this new address.

Step 3: Update the Contract Address
In your simulation.js file, paste the newly deployed contract address into the contractAddress variable.

JavaScript

// In simulation.js
const contractAddress = "PASTE_YOUR_NEW_ADDRESS_HERE";
Step 4: Run the MATLAB Simulation
Open MATLAB.

In the MATLAB window, navigate its "Current Folder" to your AutoChargeProject directory.

Run the MATLAB simulation script by typing its name in the Command Window and pressing Enter:

Matlab

>> simulate_charging_code
This will run the code and create/update the result.txt file in your project folder.

Step 5: Run the Blockchain Script
Return to your second terminal. Run the main simulation script. This script will read the result from MATLAB and complete the payment on the blockchain.

Bash

node simulation.js
You will see the full log of the session starting, the energy value being read, and the final payment being processed, along with the initial and final balances of the station and EV.

(Optional) Running the Frontend UI
To interact with the dApp through a web interface:

Install Live Server:

Bash

npm install -g live-server
Navigate to the Frontend Directory:
In your second terminal, move into the frontend folder.

Bash

cd frontend
Start the Server:

Bash

live-server
Your default browser will automatically open index.html. You can then interact with the dApp using your MetaMask wallet connected to the local Hardhat network.
