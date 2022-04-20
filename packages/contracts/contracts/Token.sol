// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Token is ERC721, Pausable, Ownable {
    using Strings for uint256;

    uint256 immutable TOKEN_COUNT = 1000;

    string baseUri = "http://localhost:3000/api/metadata/";

    uint256 public nextTokenId  = 1;
    constructor() ERC721("Token", "TOKEN") {}

    function setBaseURI(string memory baseUri_) public onlyOwner {
        baseUri = baseUri_;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function safeMint(address to)
        public
    {
        uint256 curTokenId = nextTokenId;
        nextTokenId = nextTokenId + 1;
        _safeMint(to, curTokenId);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        
        return string(
            abi.encodePacked(baseUri, tokenId.toString())
        );
    }
}
