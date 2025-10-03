import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("BookDatabase", function () {
  it("Should get the initial book count", async function () {
    const bookDatabase = await ethers.deployContract("BookDatabase");

    expect(await bookDatabase.bookCount()).to.equal(0);
  });

  it('Should add a book and retrieve it by ID', async function () {
    const bookDatabase = await ethers.deployContract('BookDatabase');

    await bookDatabase.addBook({ title: 'Harry Potter', yearPublished: 2004 });

    expect(await bookDatabase.bookCount()).to.equal(1);
  });

  it('Should edit a book', async function () {
    const bookDatabase = await ethers.deployContract('BookDatabase');
    await bookDatabase.addBook({ title: 'Harry Potter', yearPublished: 2004 });
    await bookDatabase.editBook(1, { title: 'Harry Potter 2.0', yearPublished: 2004 });

    const book = await bookDatabase.books(1);

    expect(book.title).to.equal('Harry Potter 2.0');
  });

  it('Should delete a book', async function () {
    const bookDatabase = await ethers.deployContract('BookDatabase');
    await bookDatabase.addBook({ title: 'Harry Potter', yearPublished: 2004 });
    await bookDatabase.removeBook(1);

    expect(await bookDatabase.bookCount()).to.equal(0);
  });

  it('Should NOT a book', async function () {
    const [owner, otherAccount] = await ethers.getSigners();
    const bookDatabase = await ethers.deployContract('BookDatabase');

    await expect(bookDatabase.connect(otherAccount).removeBook(1))
      .to
      .be
      .revertedWith("You don't have permission to do that");
  });
});
