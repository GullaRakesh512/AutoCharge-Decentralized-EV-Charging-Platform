const { ethers } = require("ethers");
const fs = require('fs');

// --- 1. CONFIGURATION ---
async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const stationSigner = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
    const evSigner = new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", provider);
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const abi = JSON.parse(fs.readFileSync('AutoCharge.json', 'utf8')).abi;
    const stationContract = new ethers.Contract(contractAddress, abi, stationSigner);
    const evContract = new ethers.Contract(contractAddress, abi, evSigner);

    // --- 2. THE SIMULATION ---
    console.log("--- AutoCharge Simulation Started (with MATLAB) ---");
    // ... (balance checking code remains the same) ...
    const balancesBefore = await getBalances();
    console.log(`Initial Balances -> Station: ${parseFloat(balancesBefore.station).toFixed(4)} ETH | EV: ${parseFloat(balancesBefore.ev).toFixed(4)} ETH\n`);

    // --- Step A: Start Session ---
    console.log("🔌 EV plugged in. Charger is initiating the session...");
    try {
        const startTx = await stationContract.startSession(evSigner.address);
        await startTx.wait();
        console.log("✅ Session started successfully on the blockchain!\n");
    } catch (error) {
        console.error("❌ Error starting session:", error);
        return;
    }

    // --- Step B: Read MATLAB Result ---
    console.log("⚡ Reading result from MATLAB simulation...");
    const kwhConsumedFloat = parseFloat(fs.readFileSync('result.txt', 'utf8'));
    console.log(`✅ Charging complete. Energy consumed: ${kwhConsumedFloat.toFixed(2)} kWh.\n`);

    // --- Step C: End the Charging Session (Called by EV) ---
    console.log("💳 EV is initiating payment...");
    try {
        // ▼▼▼ THIS IS THE FIX ▼▼▼
        const kwhToSend = Math.round(kwhConsumedFloat); // Use the rounded integer (20)
        const pricePerKwh = await stationContract.pricePerKwh();
        // Calculate the cost based on the SAME rounded integer
        const finalCostWei = pricePerKwh * BigInt(kwhToSend); 
        // ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲

        console.log(`Rounding to ${kwhToSend} kWh for the transaction.`);

        const endTx = await evContract.endSession(stationSigner.address, kwhToSend, { // Send the rounded integer
            value: finalCostWei
        });
        const receipt = await endTx.wait();
        console.log("✅ Payment successful! Session ended on the blockchain.");
        console.log(`Transaction Hash: ${receipt.hash}`);
    } catch (error) {
        console.error("❌ Error ending session:", error);
    }
    
    // ... (final balance checking code remains the same) ...
    const balancesAfter = await getBalances();
    console.log(`\nFinal Balances   -> Station: ${parseFloat(balancesAfter.station).toFixed(4)} ETH | EV: ${parseFloat(balancesAfter.ev).toFixed(4)} ETH`);
    console.log("--- Simulation Complete ---");
}

// Helper function for balances
async function getBalances() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const stationSigner = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
    const evSigner = new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", provider);
    const stationBal = await provider.getBalance(stationSigner.address);
    const evBal = await provider.getBalance(evSigner.address);
    return {
        station: ethers.formatEther(stationBal),
        ev: ethers.formatEther(evBal)
    };
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});