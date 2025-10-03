/// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

contract BookDatabase {
    struct Book {
        string title;
        uint16 yearPublished;
    }

    uint32 private nextId = 0;
    address private immutable owner;
    uint public bookCount = 0;
    mapping(uint32 => Book) public books;

    constructor() {
        owner = msg.sender;
    }

    function addBook(Book memory newBook) public {
        nextId++;
        books[nextId] = newBook;
        bookCount++;
    }

    function compare(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }

    function editBook(uint32 id, Book memory updatedBook) public {        
        Book memory oldBook = books[id];

        if (!compare(oldBook.title, updatedBook.title) && !compare(updatedBook.title, "")) {
            books[id].title = updatedBook.title;
        }

        if (oldBook.yearPublished != updatedBook.yearPublished && updatedBook.yearPublished > 0) {
            books[id].yearPublished = updatedBook.yearPublished;
        }
    }

    function removeBook(uint32 id) public restricted {
        if (books[id].yearPublished > 0) {
          delete books[id];
          bookCount--;
        }
    }

    modifier restricted {
        require(msg.sender == owner, "You don't have permission to do that");
        _;
    }
}
