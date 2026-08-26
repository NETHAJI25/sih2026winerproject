const { ethers } = require('ethers');

const RPC_URL = process.env.CHAIN_RPC_URL || 'http://127.0.0.1:8545';
const CONTRACT_ADDRESS = process.env.CHAIN_CONTRACT_ADDRESS || '';

const ABI = [
  'function createBatch(string batchId,string floraType,uint256 weightKg,string photoHash)',
  'function recordTransfer(string batchId,address toActor,uint256 weightKg,string geo)',
  'function recordQuality(string batchId,bool passed,string certificateHash)',
  'function recordMint(string batchId,uint256 jarCount)',
];

let provider = null;
let contract = null;

function getContract() {
  if (!CONTRACT_ADDRESS) return null;
  if (!provider) {
    provider = new ethers.JsonRpcProvider(RPC_URL);
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
  }
  return contract;
}

function mockResult(reason) {
  return { txHash: `0xMOCK${Date.now()}`, mock: true, reason: reason || 'mock-mode' };
}

function toUnits(weightKg) {
  const milli = Math.round(Number(weightKg || 0) * 1000);
  return BigInt(Number.isFinite(milli) && milli > 0 ? milli : 0);
}

async function send(fn) {
  try {
    const c = getContract();
    if (!c) return mockResult('mock-mode');
    const tx = await fn(c);
    return { txHash: tx.hash, mock: false };
  } catch (err) {
    return mockResult(err && err.message ? err.message : 'chain-error');
  }
}

function recordBatch(batch) {
  return send((c) =>
    c.createBatch(batch.id, batch.flora_type || '', toUnits(batch.weight_kg), batch.photo_hash || '')
  );
}

function recordTransfer({ batchId, toAddress, weightKg, geo }) {
  return send((c) =>
    c.recordTransfer(batchId, toAddress || ethers.ZeroAddress, toUnits(weightKg), geo || '')
  );
}

function recordQuality({ batchId, passed, certificateHash }) {
  return send((c) => c.recordQuality(batchId, Boolean(passed), certificateHash || ''));
}

function recordMint({ batchId, jarCount }) {
  return send((c) => c.recordMint(batchId, BigInt(Math.max(1, Number(jarCount) || 1))));
}

async function getChainStatus() {
  if (!CONTRACT_ADDRESS) {
    return { connected: false, mode: 'mock-mode', blockNumber: 'mock-mode' };
  }
  try {
    getContract();
    const blockNumber = await provider.getBlockNumber();
    return { connected: true, mode: 'live', blockNumber };
  } catch {
    return { connected: false, mode: 'mock-mode', blockNumber: 'mock-mode' };
  }
}

module.exports = { recordBatch, recordTransfer, recordQuality, recordMint, getChainStatus };
