// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract HelloWorld {
    string public greet = "Hello World!";

    function setGreet(string memory _greet) public {
        greet = _greet;
    }
}
