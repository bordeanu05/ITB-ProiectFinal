// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {IBTToken} from "../src/IBTToken.sol";

contract MintTokens is Script {
    function run(address tokenAddress, address to, uint256 amount) public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        IBTToken token = IBTToken(tokenAddress);

        // Mint tokens
        token.mint(to, amount);

        // Log to console
        console2.log("Minted tokens:");
        console2.log("  To:", to);
        console2.log("  Amount:", amount);
        console2.log("  New Balance:", token.balanceOf(to));

        vm.stopBroadcast();
    }
}
