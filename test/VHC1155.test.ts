const { constants } = require("@openzeppelin/test-helpers");
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ContractTransaction } from "ethers";
import { ethers } from "hardhat";
import { VHC1155, VHC1155__factory } from "../typechain";
import { mock_data } from "./util";

describe("Contract", () => {
  let VHContract: VHC1155__factory;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;
  let user4: SignerWithAddress;

  beforeEach(async () => {
    VHContract = await ethers.getContractFactory("VHC1155");
    [owner, user1, user2, user3, user4] = await ethers.getSigners();
  });

  describe("Deployment", () => {
    it("Should revert contract deployment without constructor argument", async () => {
      await expect(VHContract.deploy("")).to.be.revertedWith(
        "You must provide deploy argument"
      );
    });

    it("Should successfully deploy contract with constructor argument", async () => {
      const contract = await VHContract.deploy(mock_data.uri);
      await contract.deployed();
      expect(await contract.owner()).to.be.equal(owner.address);
    });
  });

  describe("Functions", () => {
    let contract: VHC1155;

    beforeEach(async () => {
      contract = await VHContract.deploy(mock_data.uri);
      await contract.deployed();
    });

    describe(".supportsInterface", () => {
      it("Should support ERC165, ERC2981, ERC1155", async () => {
        const assertions = mock_data.supportedInterfaceIds.map(async (id) => {
          expect(await contract.supportsInterface(id)).to.be.true;
        });
        await Promise.all(assertions);
      });

      it("Should NOT support ERC721", async () => {
        const assertions = mock_data.unSupportedInterfaceIds.map(async (id) => {
          expect(await contract.supportsInterface(id)).to.be.false;
        });
        await Promise.all(assertions);
      });
    });

    describe(".setURI", () => {
      it("Should be callable by contract owner", async () => {
        expect(await contract.owner()).to.equal(owner.address);
        await expect(contract.setURI(mock_data.newUri)).to.not.be.reverted;
      });

      it("Should NOT be callable by non-owner", async () => {
        expect(await contract.owner()).to.equal(owner.address);

        await expect(
          contract.connect(user1).setURI(mock_data.newUri)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    describe(".uri", () => {
      it("Should return correct uri", async () => {
        expect(await contract.uri(0)).to.be.equal(mock_data.uri);
      });

      it("Should return correct new uri after change", async () => {
        contract.setURI(mock_data.newUri);
        expect(await contract.uri(0)).to.be.equal(mock_data.newUri);
      });
    });

    describe(".exists", () => {
      it("Should return false if token does NOT exist", async () => {
        expect(await contract.exists(mock_data.tokenIdZero)).to.be.false;
      });
    });

    describe(".totalSupply", () => {
      it("Should return correct total supply of a token", async () => {
        expect(await contract.totalSupply(0)).to.be.equal(0);
      });
    });

    describe(".nextTokenId", () => {
      it("Should return correct next tokenId", async () => {
        expect(await contract.nextTokenId()).to.be.equal(mock_data.tokenIdZero);
        await contract.mint(
          user1.address,
          mock_data.tokenIdZero,
          mock_data.tokenAmount.single,
          user2.address,
          mock_data.royaltyValue
        );
        await contract.mint(
          user1.address,
          mock_data.tokenIdOne,
          mock_data.tokenAmount.single,
          user2.address,
          mock_data.royaltyValue
        );
        expect(await contract.nextTokenId()).to.be.equal(mock_data.tokenIdTwo);
      });
    });

    describe(".mint", () => {
      let transactionSingle: ContractTransaction;

      beforeEach(async () => {
        transactionSingle = await contract.mint(
          user1.address,
          mock_data.tokenIdZero,
          mock_data.tokenAmount.single,
          user2.address,
          mock_data.royaltyValue
        );
      });

      it("Should mint for owner only", async () => {
        expect(await contract.owner()).to.equal(owner.address);
        expect(transactionSingle).to.not.be.reverted;
      });

      it("Should NOT mint for non-owner", async () => {
        expect(await contract.owner()).to.equal(owner.address);
        await expect(
          contract
            .connect(user1)
            .mint(
              user2.address,
              mock_data.tokenIdZero,
              mock_data.tokenAmount.single,
              user3.address,
              mock_data.royaltyValue
            )
        ).to.be.revertedWith("VHC1155: only token owner can mint");
      });

      it("Should mint single token", async () => {
        expect(await contract.owner()).to.equal(owner.address);
        expect(transactionSingle).to.not.be.reverted;
        expect(await contract.exists(mock_data.tokenIdZero)).to.be.true;
        expect(await contract.totalSupply(mock_data.tokenIdZero)).to.be.equal(
          mock_data.tokenAmount.single
        );
      });

      it("Should mint multiple tokens on the same tokenId", async () => {
        const transactionMultiple = await contract.mint(
          user1.address,
          mock_data.tokenIdOne,
          mock_data.tokenAmount.multiple,
          user2.address,
          mock_data.royaltyValue
        );
        expect(transactionMultiple).to.not.be.reverted;
        expect(await contract.exists(mock_data.tokenIdOne)).to.be.true;
        expect(await contract.totalSupply(mock_data.tokenIdOne)).to.be.equal(
          mock_data.tokenAmount.multiple
        );
      });

      it("Should default new mint to next tokenId", async () => {
        const transactionSingleTwo = await contract.mint(
          user1.address,
          mock_data.tokenIdTwo, //should be tokenIdOne
          mock_data.tokenAmount.single,
          user2.address,
          mock_data.royaltyValue
        );
        expect(transactionSingleTwo).to.not.be.reverted;
        expect(await contract.exists(mock_data.tokenIdOne)).to.be.true;
        expect(await contract.nextTokenId()).to.be.equal(mock_data.tokenIdTwo);
      });

      it("Should update _tokenOwners IF new mint", async () => {
        const ExVHContract = await ethers.getContractFactory("ExposedVHC1155");
        const expContract = await ExVHContract.deploy(mock_data.uri);
        await expContract.mint(
          user2.address,
          mock_data.tokenIdZero,
          mock_data.tokenAmount.single,
          user3.address,
          mock_data.royaltyValue
        );

        await expContract.mint(
          user2.address,
          mock_data.tokenIdOne,
          mock_data.tokenAmount.single,
          user3.address,
          mock_data.royaltyValue
        );
        expect(await expContract.getLatestTokenOwner(1)).to.be.equal(
          owner.address
        );
      });

      it("Should NOT update _tokenOwners IF NOT new mint", async () => {
        const ExVHContract = await ethers.getContractFactory("ExposedVHC1155");
        const expContract = await ExVHContract.deploy(mock_data.uri);
        await expContract.mint(
          user2.address,
          mock_data.tokenIdZero,
          mock_data.tokenAmount.single,
          user3.address,
          mock_data.royaltyValue
        );

        await expContract.mint(
          user2.address,
          mock_data.tokenIdZero,
          mock_data.tokenAmount.single,
          user3.address,
          mock_data.royaltyValue
        );
        expect(await expContract.getLatestTokenOwner(1)).to.be.equal(
          constants.ZERO_ADDRESS
        );
      });
    });

    describe(".royaltyInfo", () => {
      it("Should return correct royalty amount", async () => {
        const tokens = 15;
        await contract.mint(
          user1.address,
          mock_data.tokenIdZero,
          mock_data.tokenAmount.single,
          user2.address,
          mock_data.royaltyValue
        );
        await contract.mint(
          user1.address,
          mock_data.tokenIdOne,
          mock_data.tokenAmount.single,
          user2.address,
          0
        );
        const royaltyAmountZero = await contract.royaltyInfo(
          mock_data.tokenIdZero,
          tokens
        );
        const royaltyAmountOne = await contract.royaltyInfo(
          mock_data.tokenIdOne,
          tokens
        );
        expect(royaltyAmountZero[1].toNumber()).to.be.equal(
          mock_data.getRoyaltyAmount(mock_data.royaltyValue, tokens)
        );
        expect(royaltyAmountOne[1].toNumber()).to.be.equal(
          mock_data.getRoyaltyAmount(0, tokens)
        );
      });
    });

    describe(".updateTokenRoyalty", () => {
      it("Should update royalty amount", async () => {
        const tokens = 12;
        const royaltyValueOne = 3500;
        const royaltyValueTwo = 5000;
        await contract.mint(
          user1.address,
          mock_data.tokenIdZero,
          mock_data.tokenAmount.multiple,
          user2.address,
          royaltyValueOne
        );

        expect(await contract.exists(0)).to.be.true

        const royaltyAmountOne = await contract.royaltyInfo(
          mock_data.tokenIdZero,
          tokens
        );

        expect(royaltyAmountOne[1].toNumber()).to.be.equal(
          mock_data.getRoyaltyAmount(royaltyValueOne, tokens)
        );

        await contract.updateTokenRoyalty(
          mock_data.tokenIdZero,
          user2.address,
          royaltyValueTwo
        );

        const royaltyAmountTwo = await contract.royaltyInfo(
          mock_data.tokenIdZero,
          tokens
        );

        expect(royaltyAmountTwo[1].toNumber()).to.be.equal(
          mock_data.getRoyaltyAmount(royaltyValueTwo, tokens)
        );
      });

      it("Should NOT update royalty amount of non-existent token", async () => {
        const royaltyValue = 3500;

        await expect(
          contract.updateTokenRoyalty(
            mock_data.tokenIdOne,
            user2.address,
            royaltyValue
          )
        ).to.be.revertedWith("ERC2981Royalties: Token not found");
      });
    });

    describe(".mintBatch", () => {
      const ids = [0, 1, 2];
      const amounts = [20, 23, 40];
      const royaltyRecipients: string[] = [];
      const royaltyValues = [2500, 1000, 0];

      beforeEach(() => {
        royaltyRecipients.push(user1.address, user2.address, user3.address);
      });

      it("Should batch mint assets", async () => {
        const batchTransaction = await contract.mintBatch(
          user1.address,
          ids,
          amounts,
          royaltyRecipients,
          royaltyValues
        );

        expect(batchTransaction).to.not.be.reverted;
      });

      it("Should NOT batch mint assets when arrays length mismatch", async () => {
        const mismatchIds = ids.slice(1);
        const mismatchAmounts = amounts.slice(1);
        const mismatchRoyaltyRecipients = royaltyRecipients.slice(1);
        const mismatchRoyaltyValues = royaltyValues.slice(1);

        const mismatchIdsTx = contract.mintBatch(
          user1.address,
          mismatchIds,
          amounts,
          royaltyRecipients,
          royaltyValues
        );

        const mismatchAmountsTx = contract.mintBatch(
          user1.address,
          ids,
          mismatchAmounts,
          royaltyRecipients,
          royaltyValues
        );

        const mismatchRoyaltyRecipientsTx = contract.mintBatch(
          user1.address,
          ids,
          amounts,
          mismatchRoyaltyRecipients,
          royaltyValues
        );

        const mismatchRoyaltyValuesTx = contract.mintBatch(
          user1.address,
          ids,
          amounts,
          royaltyRecipients,
          mismatchRoyaltyValues
        );

        const mismatches = [
          mismatchIdsTx,
          mismatchAmountsTx,
          mismatchRoyaltyRecipientsTx,
          mismatchRoyaltyValuesTx,
        ];

        const assertions = mismatches.map(async (mismatch) => {
          await expect(mismatch).to.be.revertedWith(
            "ERC1155: Arrays length mismatch"
          );
        });

        await Promise.all(assertions);
      });
    });
  });
});
