// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {IBTToken} from "../src/IBTToken.sol";

contract BurnTokens is Script {
    function run(address tokenAddress, address from, uint256 amount) public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        IBTToken token = IBTToken(tokenAddress);

        uint256 preBurnBalance = token.balanceOf(from);

        // Burn tokens
        token.burn(from, amount);

        // Log to console
        console2.log("Burned tokens:");
        console2.log("  From:", from);
        console2.log("  Amount:", amount);
        console2.log("  Previous Balance:", preBurnBalance);
        console2.log("  New Balance:", token.balanceOf(from));

        vm.stopBroadcast();
    }
}
