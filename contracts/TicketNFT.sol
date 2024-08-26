// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract TicketNFT is ERC721URIStorage {
    uint256 public nextTokenId;

    struct TicketDetails {
        string eventName;
        string eventDetails;
        uint256 eventDate;
        uint32 seat;
    }

    mapping(uint256 => TicketDetails) public ticketDetails;
    mapping(address => uint256[]) private _ownedTokens;

    constructor() ERC721("Event Ticket", "ETKT") {}

    function mint(
        address to,
        string memory _eventName,
        string memory _eventDetails,
        uint256 _eventDate,
        uint32 _seat
    ) external returns (uint256) {
        uint256 tokenId = nextTokenId;
        _safeMint(to, tokenId);
        ticketDetails[tokenId] = TicketDetails({
            eventName: _eventName,
            eventDetails: _eventDetails,
            eventDate: _eventDate,
            seat: _seat
        });
        _ownedTokens[to].push(tokenId);
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

    function getOwnedTokens(address owner) public view returns (uint256[] memory) {
        return _ownedTokens[owner];
    }

    function _generateTokenURI(
        string memory _eventName,
        string memory _eventDetails,
        uint256 _eventDate,
        uint32 _seat
    ) internal pure returns (string memory) {
        string memory svgImage = string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">',
            '<rect width="100%" height="100%" fill="#4CAF50" />',
            '<text x="10" y="20" font-size="20" fill="white">Event: ', _eventName, '</text>',
            '<text x="10" y="50" font-size="16" fill="white">Timestamp: ', uint2str(_eventDate), '</text>',
            '<text x="10" y="80" font-size="16" fill="white">Seat: ', uint2str(_seat), '</text>',
            '</svg>'
        ));
        string memory base64SVG = Base64.encode(bytes(svgImage));

        return string(abi.encodePacked(
            'data:application/json;utf8,',
            '{"name":"', _eventName, '",',
            '"description":"', _eventDetails, '",',
            '"date":"', uint2str(_eventDate), '",',
            '"seat":"', uint2str(_seat), '",',
            '"image":"data:image/svg+xml;base64,', base64SVG, '"}'
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

library Base64 {
    string internal constant TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    
    function encode(bytes memory data) internal pure returns (string memory) {
        uint256 encodedLen = 4 * ((data.length + 2) / 3);
        string memory result = new string(encodedLen);
        bytes memory table = bytes(TABLE);
        bytes memory encoded = bytes(result);
        
        uint256 i = 0;
        uint256 j = 0;
        while (i < data.length) {
            uint256 a = uint8(data[i++]);
            uint256 b = i < data.length ? uint8(data[i++]) : 0;
            uint256 c = i < data.length ? uint8(data[i++]) : 0;
            
            uint256 triple = (a << 16) + (b << 8) + c;
            
            encoded[j++] = table[(triple >> 18) & 0x3F];
            encoded[j++] = table[(triple >> 12) & 0x3F];
            encoded[j++] = table[(triple >> 6) & 0x3F];
            encoded[j++] = table[triple & 0x3F];
        }
        
        if (data.length % 3 > 0) {
            encoded[encodedLen - 1] = '=';
        }
        if (data.length % 3 == 1) {
            encoded[encodedLen - 2] = '=';
        }
        
        return result;
    }
}