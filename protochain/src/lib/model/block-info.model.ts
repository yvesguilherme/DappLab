/**
 * The BlockInfo interface represents the structure of a block in the blockchain.
 */
export default interface IBlockInfo {
  index: number;
  previousHash: string;
  difficulty: number;
  maxDifficulty: number;
  feePerTx: number;
  data: string;
}