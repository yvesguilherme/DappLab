import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("HelloWorld", function () {
  it("Should get the initial greeting message", async function () {
    const helloWorld = await ethers.deployContract("HelloWorld");

    expect(await helloWorld.greet()).to.equal("Hello World!");
  });

  it("Should set and get the greeting message", async function () {
    const helloWorld = await ethers.deployContract("HelloWorld");

    await helloWorld.setGreet("Hello, Ethereum!");
    expect(await helloWorld.greet()).to.equal("Hello, Ethereum!");
  });
});
