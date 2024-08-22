// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TicketNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;

    struct TicketDetails {
        string eventName;
        string eventDetails;
        uint256 eventDate;
        uint256 seat;
    }

    mapping(uint256 => TicketDetails) public ticketDetails;

    constructor(address _initialOwner) ERC721("Event Ticket", "ETKT") Ownable(_initialOwner) {}

    function mint(
        address to,
        string memory _eventName,
        string memory _eventDetails,
        uint256 _eventDate,
        uint256 _seat
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = nextTokenId;
        _safeMint(to, tokenId);
        ticketDetails[tokenId] = TicketDetails({
            eventName: _eventName,
            eventDetails: _eventDetails,
            eventDate: _eventDate,
            seat: _seat
        });

        // Generate tokenURI
        string memory tokenURI = _generateTokenURI(
            _eventName,
            _eventDetails,
            _eventDate,
            _seat
        );
        _setTokenURI(tokenId, tokenURI);
        nextTokenId++;
        return tokenId;
    }

    function _generateTokenURI(
        string memory _eventName,
        string memory _eventDetails,
        uint256 _eventDate,
        uint256 _seat
    ) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '{"name":"', _eventName, '",',
            '"description":"', _eventDetails, '",',
            '"date":', uint2str(_eventDate), ',',
            '"seat":', uint2str(_seat), '}'
        ));
    }

    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}