// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {IBTToken} from "../src/IBTToken.sol";

contract DeployToken is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the token
        IBTToken token = new IBTToken();

        // Log to console
        console2.log("Token deployed to:", address(token));

        vm.stopBroadcast();
    }
}
