// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {HelloWorld} from "./HelloWorld.sol";
import {Test} from "forge-std/Test.sol";

// Solidity tests are compatible with foundry, so they
// use the same syntax and offer the same functionality.

contract HelloWorldTest is Test {
    HelloWorld helloWorld;

    function setUp() public {
        helloWorld = new HelloWorld();
    }

    function test_InitialValue() public view {
        require(
            keccak256(bytes(helloWorld.greet())) == keccak256(bytes("Hello World!")),
            "Initial greeting should be 'Hello, World!'"
        );
    }

    function test_SetGreet() public {
        string memory newGreet = "Hi there!";
        helloWorld.setGreet(newGreet);
        require(
            keccak256(bytes(helloWorld.greet())) == keccak256(bytes(newGreet)),
            "Greeting should be updated to 'Hi there!'"
        );
    }
}
