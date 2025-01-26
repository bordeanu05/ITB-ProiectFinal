-include .env

.PHONY: anvil deploy

# Start eth
anvil:
	anvil

# Deploy IBT
deploy:
	@forge script script/DeployToken.s.sol:DeployToken \
		--rpc-url $(RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		--broadcast

# forge script script/MintTokens.s.sol:MintTokens \
#     --sig "run(address,address,uint256)" \
#     0x5FbDB2315678afecb367f032d93F642f64180aa3 \
#     0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
#     1000000000000000000 \
#     --rpc-url http://localhost:8545 \
#     --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
#     --broadcast

# forge script script/BurnTokens.s.sol:BurnTokens \
#     --sig "run(address,address,uint256)" \
#     0x5FbDB2315678afecb367f032d93F642f64180aa3 \
#     0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
#     1000000000000000000 \
#     --rpc-url http://localhost:8545 \
#     --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
#     --broadcast