const { ethers } = require("ethers");
const fs = require('fs');

async function main() {
    console.log("--- Attempting to fix stuck session ---");

    // --- Configuration (Same as before) ---
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const evSigner = new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", provider);
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Use your current contract address
    const abi = JSON.parse(fs.readFileSync('AutoCharge.json', 'utf8')).abi;
    const evContract = new ethers.Contract(contractAddress, abi, evSigner);

    // --- The Fix ---
    // The address of the station that is stuck
    const stuckStationAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    // The kWh value from the FAILED transaction. We need to send this again.
    const kwhToClear = 20; 

    try {
        console.log(`Calling endSession for station ${stuckStationAddress} with ${kwhToClear} kWh...`);
        
        const pricePerKwh = await evContract.pricePerKwh();
        const finalCostWei = pricePerKwh * BigInt(kwhToClear);

        const endTx = await evContract.endSession(stuckStationAddress, kwhToClear, {
            value: finalCostWei
        });
        
        await endTx.wait();
        console.log("✅ Success! The stuck session has been cleared.");
        console.log("The station should now be free for a new session.");

    } catch (error) {
        console.error("❌ Failed to fix session:", error.reason);
    }
}

main().catch(console.error);