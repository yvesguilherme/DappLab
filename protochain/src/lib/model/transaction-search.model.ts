import Transaction from "../transaction.ts";

export default interface ITranscationSearch { 
  transaction: Transaction;
  mempoolIndex: number;
  blockIndex: number;
} 