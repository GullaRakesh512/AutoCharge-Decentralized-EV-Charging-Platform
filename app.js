// --- Global Variables ---
let provider;
let signer;
let contract;

// --- DOM Elements ---
const connectWalletBtn = document.getElementById('connectWalletBtn');
const statusDiv = document.getElementById('status');
const chargingControls = document.getElementById('charging-controls');
const paymentControls = document.getElementById('payment-controls');
const startSessionBtn = document.getElementById('startSessionBtn');
const endSessionBtn = document.getElementById('endSessionBtn');
const kwhInput = document.getElementById('kwhInput');
const stationAddressSpan = document.getElementById('stationAddress');

// --- Contract Details ---
// ▼▼▼ PASTE YOUR DEPLOYED CONTRACT ADDRESS HERE ▼▼▼
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// ▼▼▼ PASTE YOUR ABI FROM AutoCharge.json HERE ▼▼▼
const contractABI = [
  // Example: { "inputs": [], "name": "pricePerKwh", ... }
  // PASTE THE FULL ARRAY FROM YOUR JSON FILE
];

// --- Hardcoded Station Address for Simulation ---
// In a real app, this would be discovered dynamically
const stationAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";


// --- Event Listeners ---
connectWalletBtn.addEventListener('click', connectWallet);
startSessionBtn.addEventListener('click', startSession);
endSessionBtn.addEventListener('click', endSession);


// --- Functions ---

/**
 * Connects to the user's MetaMask wallet.
 */
async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        updateStatus("Error: MetaMask is not installed!");
        return;
    }

    try {
        // Use Ethers.js to connect to the browser's Ethereum provider (MetaMask)
        provider = new ethers.providers.Web3Provider(window.ethereum);
        // Request access to the user's accounts
        await provider.send("eth_requestAccounts", []);
        // Get the signer, which represents the user's wallet
        signer = provider.getSigner();

        // Instantiate the contract with the signer, which allows us to send transactions
        contract = new ethers.Contract(contractAddress, contractABI, signer);

        const userAddress = await signer.getAddress();
        updateStatus(`Wallet Connected: ${userAddress.substring(0, 6)}...${userAddress.substring(38)}`);
        
        // Show charging controls after connecting
        chargingControls.style.display = 'block';
        stationAddressSpan.innerText = `${stationAddress.substring(0, 6)}...${stationAddress.substring(38)}`;
        connectWalletBtn.textContent = 'Wallet Connected';
        connectWalletBtn.disabled = true;

    } catch (error) {
        console.error("Error connecting wallet:", error);
        updateStatus("Error: Could not connect to wallet.");
    }
}

/**
 * Calls the startSession function on the smart contract.
 */
async function startSession() {
    if (!contract) {
        updateStatus("Error: Please connect your wallet first.");
        return;
    }
    
    updateStatus("Initiating charging session on the blockchain...");
    startSessionBtn.disabled = true;

    try {
        // The signer's address is the EV's address in this context
        const evAddress = await signer.getAddress();
        
        // We need to call this function from the station's account.
        // In a real app, the station hardware would do this.
        // For this UI, we'll just log a message and enable the next step.
        console.log(`A real station at ${stationAddress} would now start a session for EV at ${evAddress}`);
        
        // Since we can't sign for the station from the user's browser,
        // we will simulate the session starting and show the payment controls.
        updateStatus("Session started! You can now proceed to payment when done.");
        paymentControls.style.display = 'block';
        chargingControls.style.display = 'none';

    } catch (error) {
        console.error("Error starting session:", error);
        updateStatus("Error: Could not start the session.");
        startSessionBtn.disabled = false;
    }
}

/**
 * Calls the endSession function and sends the payment.
 */
async function endSession() {
    const kwh = kwhInput.value;
    if (!kwh || kwh <= 0) {
        updateStatus("Error: Please enter a valid kWh amount.");
        return;
    }

    updateStatus(`Processing payment for ${kwh} kWh...`);
    endSessionBtn.disabled = true;

    try {
        const pricePerKwh = await contract.pricePerKwh();
        const finalCost = pricePerKwh.mul(kwh);

        const tx = await contract.endSession(stationAddress, kwh, {
            value: finalCost
        });

        updateStatus("Waiting for transaction confirmation...");
        await tx.wait(); // Wait for the transaction to be mined

        updateStatus(`Payment successful! Transaction hash: ${tx.hash.substring(0,10)}...`);
        paymentControls.style.display = 'none';

    } catch (error) {
        console.error("Error ending session:", error);
        updateStatus("Error: Payment failed. See console for details.");
        endSessionBtn.disabled = false;
    }
}

/**
 * Helper function to update the status message on the page.
 * @param {string} message The message to display.
 */
function updateStatus(message) {
    statusDiv.textContent = message;
}