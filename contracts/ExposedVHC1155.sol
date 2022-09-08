// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./VHC1155.sol";

contract ExposedVHC1155 is VHC1155 {
    constructor(string memory uri_) VHC1155(uri_) {
        require(bytes(uri_).length > 0, "You must provide deploy argument");
    }

    function getLatestTokenOwner(uint256 index)
        external
        view
        returns (address)
    {
        return _tokenOwners[index];
    }
}
