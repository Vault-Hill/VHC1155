// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "./ERC2981PerTokenRoyalties.sol";

/**
 * @title VHC1155
 * @dev Vault Hill City's ERC1155 contract
 */
contract VHC1155 is ERC1155, Ownable, ERC1155Supply, ERC2981PerTokenRoyalties {
    constructor(string memory uri_) ERC1155(uri_) {}

    mapping(uint256 => address) internal _tokenOwners;

    /**
     * @dev See {ERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155, ERC2981Base)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Update `_uri` to `newUri`
     * @param newUri updated URI for all token metadata
     */
    function setURI(string memory newUri) public onlyOwner {
        _setURI(newUri);
    }

    /**
     * @dev Mint amount token of type `id` to `to`
     * @param to the recipient of the token
     * @param id id of the token type to mint
     * @param amount amount of the token type to mint
     * @param royaltyRecipient the recipient for royalties (if royaltyValue > 0)
     * @param royaltyValue the royalties asked for (EIP2981)
     */
    function mint(
        address to,
        uint256 id,
        uint256 amount,
        address royaltyRecipient,
        uint256 royaltyValue
    ) external {
        require(_tokenOwners[id] == address(0x0) || _tokenOwners[id] == msg.sender, "VHC1155: only token owner can mint");

        _mint(to, id, amount, "");
        _tokenOwners[id] = msg.sender;

        if (royaltyValue > 0) {
            _setTokenRoyalty(id, royaltyRecipient, royaltyValue);
        }
    }

    /**
     * @dev Mint several tokens at once
     * @param to the recipient of the token
     * @param ids array of ids of the token types to mint
     * @param amounts array of amount to mint for each token type
     * @param royaltyRecipients an array of recipients for royalties (if royaltyValues[i] > 0)
     * @param royaltyValues an array of royalties asked for (EIP2981)
     */
    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        address[] memory royaltyRecipients,
        uint256[] memory royaltyValues
    ) external {
        require(
            ids.length == royaltyRecipients.length &&
                ids.length == royaltyValues.length,
            "ERC1155: Arrays length mismatch"
        );
        for (uint256 i = 0; i < ids.length; i++) {
            require(_tokenOwners[ids[i]] == address(0x0) || _tokenOwners[ids[i]] == msg.sender, "VHC1155: only token owner can mint");
        }

        _mintBatch(to, ids, amounts, "");

        for (uint256 i; i < ids.length; i++) {
            if (_tokenOwners[ids[i]] == address(0x0)) {
                _tokenOwners[ids[i]] = msg.sender;
            }
            if (royaltyValues[i] > 0) {
                _setTokenRoyalty(
                    ids[i],
                    royaltyRecipients[i],
                    royaltyValues[i]
                );
            }
        }
    }

    /**
     * @dev See {ERC1155-_beforeTokenTransfer}.
     */
    function _beforeTokenTransfer(address operator, address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        internal
        override(ERC1155, ERC1155Supply)
    {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}
