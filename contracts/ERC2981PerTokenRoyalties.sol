// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "./ERC2981Base.sol";

/**
 * @title ERC2981PerTokenRoyalties
 * @dev This is a contract used to add ERC2981 support to ERC721 and 1155
 *      allowing for royalties to be set on a per token ID basis
 */
abstract contract ERC2981PerTokenRoyalties is ERC2981Base {
    mapping(uint256 => RoyaltyInfo) internal _royalties;

    /**
     * @dev Sets token royalties
     * @param tokenId the token ID to register royalties against
     * @param recipient recipient of the royalties
     * @param amount percentage (using 2 decimals - 10000 = 100, 0 = 0)
     */
    function _setTokenRoyalty(
        uint256 tokenId,
        address recipient,
        uint256 amount
    ) internal {
        require(amount <= 10000, "ERC2981Royalties: Amount too high");
        _royalties[tokenId] = RoyaltyInfo(recipient, uint24(amount));
    }

    /**
     * @dev Update token royalty
     * @param tokenId - the NFT asset for which royalty information is updated
     * @param recipient - the receipient of the royalty amount
     * @param amount - the value of royalty to be use to deduce royalty amount
     */
    function updateTokenRoyalty(
        uint256 tokenId,
        address recipient,
        uint256 amount
    ) external {
        require(
            _royalties[tokenId].recipient != address(0x0),
            "ERC2981Royalties: Token not found"
        );
        _setTokenRoyalty(tokenId, recipient, amount);
    }

    /**
     * @dev See {IERC2981Royalties-royaltyInfo}.
     */
    function royaltyInfo(uint256 tokenId, uint256 value)
        external
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        RoyaltyInfo memory royalties = _royalties[tokenId];
        receiver = royalties.recipient;
        royaltyAmount = (value * royalties.amount) / 10000;
    }
}
