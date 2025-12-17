// SPDX-License-Identifier: CC0 1.0 Universal
pragma solidity ^0.8.28;

import {Zarya} from "../src/Zarya.sol";
import {PartyOrgan} from "../src/libraries/PartyOrgans.sol";
import {EnumerableSet} from "@openzeppelin-contracts-5.4.0-rc.1/utils/structs/EnumerableSet.sol";

/**
 * @dev Test helper contract that exposes internal functionality for testing
 */
contract ZaryaTestHelper is Zarya {
    using EnumerableSet for EnumerableSet.AddressSet;

    /**
     * @dev Add a member to an organ directly (for testing purposes only)
     */
    function addMemberForTesting(address member, PartyOrgan organ) external {
        _partyMembersRegistry.membersByOrgan[organ].add(member);
    }

    /**
     * @dev Remove a member from an organ directly (for testing purposes only)
     */
    function removeMemberForTesting(address member, PartyOrgan organ) external {
        _partyMembersRegistry.membersByOrgan[organ].remove(member);
    }

    /**
     * @dev Check if an address is a member of an organ (for testing purposes only)
     */
    function isMemberForTesting(address member, PartyOrgan organ) external view returns (bool) {
        return _partyMembersRegistry.membersByOrgan[organ].contains(member);
    }
}
