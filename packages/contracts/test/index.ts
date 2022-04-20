import { expect } from "chai";
import { Signer } from "ethers";
import { ethers } from "hardhat";
import { Token } from "../typechain";

describe("Token", function () {
  let token: Token;
  let signers: Signer[];

  beforeEach(async function () {
    signers = await ethers.getSigners();
  });

  it("can deploy the contract", async function () {
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy();
    expect(token.address).to.contain("0x");
  });

  it("Can retrieve a Token tokenuri", async function () {
    const minted = await token.safeMint(await signers[0].getAddress());
    const tokenuri = await token.tokenURI(1);

    expect(tokenuri).to.contain("http://");
  });
});
