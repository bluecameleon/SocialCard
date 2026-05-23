// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title SocialCard — Link social handles to your wallet address
contract SocialCard {
    struct Card {
        string displayName;
        string twitter;
        string discord;
        string telegram;
        string website;
        string bio;
        uint256 createdAt;
        uint256 updatedAt;
    }

    mapping(address => Card) public cards;
    mapping(string => address) private twitterToAddr;
    mapping(string => address) private discordToAddr;

    address[] public cardOwners;
    uint256 public totalCards;

    event CardCreated(address indexed owner, string displayName);
    event CardUpdated(address indexed owner);

    function setCard(
        string calldata displayName,
        string calldata twitter,
        string calldata discord,
        string calldata telegram,
        string calldata website,
        string calldata bio
    ) external {
        bool isNew = cards[msg.sender].createdAt == 0;
        if (isNew) {
            cardOwners.push(msg.sender);
            totalCards++;
            cards[msg.sender].createdAt = block.timestamp;
            emit CardCreated(msg.sender, displayName);
        } else {
            // Clear old index
            if (bytes(cards[msg.sender].twitter).length > 0)
                delete twitterToAddr[cards[msg.sender].twitter];
            if (bytes(cards[msg.sender].discord).length > 0)
                delete discordToAddr[cards[msg.sender].discord];
            emit CardUpdated(msg.sender);
        }
        if (bytes(twitter).length > 0) {
            require(twitterToAddr[twitter] == address(0) || twitterToAddr[twitter] == msg.sender, "Twitter taken");
            twitterToAddr[twitter] = msg.sender;
        }
        if (bytes(discord).length > 0) {
            require(discordToAddr[discord] == address(0) || discordToAddr[discord] == msg.sender, "Discord taken");
            discordToAddr[discord] = msg.sender;
        }
        cards[msg.sender] = Card(displayName, twitter, discord, telegram, website, bio, cards[msg.sender].createdAt, block.timestamp);
        if (isNew) cards[msg.sender].createdAt = block.timestamp;
    }

    function getCard(address owner) external view returns (Card memory) { return cards[owner]; }
    function lookupTwitter(string calldata handle) external view returns (address) { return twitterToAddr[handle]; }
    function lookupDiscord(string calldata handle) external view returns (address) { return discordToAddr[handle]; }
    function hasCard(address owner) external view returns (bool) { return cards[owner].createdAt > 0; }

    function getRecent(uint256 count) external view returns (address[] memory) {
        uint256 len = cardOwners.length;
        uint256 n = count > len ? len : count;
        address[] memory result = new address[](n);
        for (uint256 i = 0; i < n; i++) result[i] = cardOwners[len - 1 - i];
        return result;
    }
}
