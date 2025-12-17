// SPDX-License-Identifier: CC0 1.0 Universal
pragma solidity ^0.8.28;

import {EnumerableSet} from "@openzeppelin-contracts-5.4.0-rc.1/utils/structs/EnumerableSet.sol";

import {Regions} from "./libraries/Regions.sol";
import {PartyOrgans, PartyOrgan} from "./libraries/PartyOrgans.sol";
import {Matricies} from "./libraries/Matricies.sol";
import {Votings} from "./libraries/Votings.sol";

contract Zarya {
    using Regions for Regions.Region;
    using EnumerableSet for EnumerableSet.AddressSet;
    using Votings for Votings.Voting;
    using Matricies for Matricies.PairOfMatricies;

    uint256 public nextVotingId;

    mapping(uint256 => Votings.Voting) internal _votings;
    PartyOrgans.MembersRegistry internal _partyMembersRegistry;
    Matricies.PairOfMatricies internal _matricies;

    modifier onlyMember(PartyOrgan organ) {
        _onlyMember(organ);
        _;
    }

    modifier votingExists(uint256 votingId) {
        _votingExists(votingId);
        _;
    }

    function _onlyMember(PartyOrgan organ) internal view {
        if (!_partyMembersRegistry.membersByOrgan[organ].contains(msg.sender)) {
            revert PartyOrgans.NotActiveMember(organ, msg.sender);
        }
    }

    function _votingExists(uint256 votingId) internal view {
        if (votingId == 0 || votingId > nextVotingId) {
            revert Votings.VotingNotFound(votingId);
        }
    }

    function createMembershipVoting(PartyOrgan organ, address member, uint256 duration)
        external
        onlyMember(organ)
        returns (uint256 votingId)
    {
        votingId = ++nextVotingId;
        _votings[votingId].createMembershipVoting(votingId, msg.sender, duration, organ, member);
    }

    function createCategoryVoting(PartyOrgan organ, uint256 x, uint256 y, uint64 category, uint256 duration)
        external
        onlyMember(organ)
        returns (uint256 votingId)
    {
        votingId = ++nextVotingId;
        _votings[votingId].createCategoryVoting(votingId, msg.sender, duration, organ, x, y, category);
    }

    function createDecimalsVoting(PartyOrgan organ, uint256 x, uint256 y, uint8 decimals, uint256 duration)
        external
        onlyMember(organ)
        returns (uint256 votingId)
    {
        votingId = ++nextVotingId;
        _votings[votingId].createDecimalsVoting(votingId, msg.sender, duration, organ, x, y, decimals);
    }

    function createThemeVoting(bool isCategorical, uint256 x, string memory theme, uint256 duration)
        external
        returns (uint256 votingId)
    {
        votingId = ++nextVotingId;
        _votings[votingId].createThemeVoting(votingId, msg.sender, duration, isCategorical, x, theme);
    }

    function createStatementVoting(bool isCategorical, uint256 x, uint256 y, string memory statement, uint256 duration)
        external
        returns (uint256 votingId)
    {
        votingId = ++nextVotingId;
        _votings[votingId].createStatementVoting(votingId, msg.sender, duration, isCategorical, x, y, statement);
    }

    function createCategoricalValueVoting(
        PartyOrgan organ,
        uint256 x,
        uint256 y,
        uint64 value,
        address valueAuthor,
        uint256 duration
    ) external onlyMember(organ) returns (uint256 votingId) {
        votingId = ++nextVotingId;
        _votings[votingId].createCategoricalValueVoting(votingId, msg.sender, duration, organ, x, y, value, valueAuthor);
    }

    function createNumericalValueVoting(
        PartyOrgan organ,
        uint256 x,
        uint256 y,
        uint64 value,
        address valueAuthor,
        uint256 duration
    ) external onlyMember(organ) returns (uint256 votingId) {
        votingId = ++nextVotingId;
        _votings[votingId].createNumericalValueVoting(votingId, msg.sender, duration, organ, x, y, value, valueAuthor);
    }

    // Voting participation functions
    function castVote(uint256 votingId, bool support, PartyOrgan organ)
        external
        votingExists(votingId)
        onlyMember(organ)
    {
        _votings[votingId].castVote(support, msg.sender);
    }

    function executeVoting(uint256 votingId, uint256 minimumQuorum, uint256 minimumApprovalPercentage)
        external
        votingExists(votingId)
        returns (bool success)
    {
        return _votings[votingId]
            .executeVoting(minimumQuorum, minimumApprovalPercentage, _matricies, _partyMembersRegistry);
    }

    // View functions
    function getVotingResults(uint256 votingId)
        external
        view
        votingExists(votingId)
        returns (Votings.VoteResults memory)
    {
        return _votings[votingId].getVoteResults();
    }

    function hasVoted(uint256 votingId, address member) external view votingExists(votingId) returns (bool) {
        return _votings[votingId].hasPartyMemberVoted(member);
    }

    function isVotingActive(uint256 votingId) external view votingExists(votingId) returns (bool) {
        return _votings[votingId].isActive();
    }

    function isVotingFinalized(uint256 votingId) external view votingExists(votingId) returns (bool) {
        return _votings[votingId].isFinalized();
    }

    // ============ Matrix View Functions ============

    // Theme and Statement Queries
    function getTheme(bool isCategorical, uint256 x) external view returns (string memory) {
        return _matricies.getTheme(isCategorical, x);
    }

    function getStatement(bool isCategorical, uint256 y) external view returns (string memory) {
        return _matricies.getStatement(isCategorical, y);
    }

    // Organ Queries
    function getCategoricalCellOrgan(uint256 x, uint256 y) external view returns (PartyOrgan) {
        return _matricies.getCategoricalCellOrgan(x, y);
    }

    function getNumericalCellOrgan(uint256 x, uint256 y) external view returns (PartyOrgan) {
        return _matricies.getNumericalCellOrgan(x, y);
    }

    // Category Queries
    function getAllowedCategories(uint256 x, uint256 y) external view returns (uint64[] memory) {
        return _matricies.getAllowedCategories(x, y);
    }

    function getCategoryName(uint256 x, uint256 y, uint64 category) external view returns (string memory) {
        return _matricies.getCategoryName(x, y, category);
    }

    function isCategoryAllowed(uint256 x, uint256 y, uint64 category) external view returns (bool) {
        return _matricies.isCategoryAllowed(x, y, category);
    }

    // Cell Info Aggregates
    function getCategoricalCellInfo(uint256 x, uint256 y)
        external
        view
        returns (PartyOrgan organ, uint64[] memory allowedCategories, uint256 sampleLength)
    {
        return _matricies.getCategoricalCellInfo(x, y);
    }

    function getNumericalCellInfo(uint256 x, uint256 y)
        external
        view
        returns (PartyOrgan organ, uint8 decimals, uint256 sampleLength)
    {
        return _matricies.getNumericalCellInfo(x, y);
    }

    // Sample Length Queries
    function getCategoricalSampleLength(uint256 x, uint256 y) external view returns (uint256) {
        return _matricies.getCategoricalSampleLength(x, y);
    }

    function getNumericalSampleLength(uint256 x, uint256 y) external view returns (uint256) {
        return _matricies.getNumericalSampleLength(x, y);
    }

    // Latest Value Queries
    function getCategoricalLatestValue(uint256 x, uint256 y)
        external
        view
        returns (uint32 timestamp, address author, uint64 value)
    {
        Matricies.DecodedCheckpoint memory checkpoint = _matricies.getLatestCategoricalValue(x, y);
        return (checkpoint.timestamp, checkpoint.author, checkpoint.value);
    }

    function getNumericalLatestValue(uint256 x, uint256 y)
        external
        view
        returns (uint32 timestamp, address author, uint64 value)
    {
        Matricies.DecodedCheckpoint memory checkpoint = _matricies.getLatestNumericalValue(x, y);
        return (checkpoint.timestamp, checkpoint.author, checkpoint.value);
    }

    // Indexed Value Access
    function getCategoricalValueAt(uint256 x, uint256 y, uint256 index)
        external
        view
        returns (uint32 timestamp, address author, uint64 value)
    {
        Matricies.DecodedCheckpoint memory checkpoint = _matricies.getCategoricalValueAt(x, y, index);
        return (checkpoint.timestamp, checkpoint.author, checkpoint.value);
    }

    function getNumericalValueAt(uint256 x, uint256 y, uint256 index)
        external
        view
        returns (uint32 timestamp, address author, uint64 value)
    {
        Matricies.DecodedCheckpoint memory checkpoint = _matricies.getNumericalValueAt(x, y, index);
        return (checkpoint.timestamp, checkpoint.author, checkpoint.value);
    }

    // Timestamp Lookup
    function getCategoricalValueAtTimestamp(uint256 x, uint256 y, uint32 timestamp)
        external
        view
        returns (uint32 actualTimestamp, address author, uint64 value)
    {
        Matricies.DecodedCheckpoint memory checkpoint = _matricies.getCategoricalValueAtTimestamp(x, y, timestamp);
        return (checkpoint.timestamp, checkpoint.author, checkpoint.value);
    }

    function getNumericalValueAtTimestamp(uint256 x, uint256 y, uint32 timestamp)
        external
        view
        returns (uint32 actualTimestamp, address author, uint64 value)
    {
        Matricies.DecodedCheckpoint memory checkpoint = _matricies.getNumericalValueAtTimestamp(x, y, timestamp);
        return (checkpoint.timestamp, checkpoint.author, checkpoint.value);
    }

    // Paginated History Queries
    function getCategoricalHistory(uint256 x, uint256 y, uint256 offset, uint256 limit)
        external
        view
        returns (uint32[] memory timestamps, address[] memory authors, uint64[] memory values)
    {
        return _matricies.getCategoricalHistory(x, y, offset, limit);
    }

    function getNumericalHistory(uint256 x, uint256 y, uint256 offset, uint256 limit)
        external
        view
        returns (uint32[] memory timestamps, address[] memory authors, uint64[] memory values)
    {
        return _matricies.getNumericalHistory(x, y, offset, limit);
    }
}
