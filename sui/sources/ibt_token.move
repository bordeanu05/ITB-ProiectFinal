module ibt_token::ibt {
    use std::option;
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    public struct IBT has drop {}

    fun init(witness: IBT, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness,
            9,
            b"IBT",
            b"Introducere in Blockchain Token",
            b"",
            option::none(),
            ctx
        );

        transfer::public_transfer(treasury, tx_context::sender(ctx));
        transfer::public_freeze_object(metadata);
    }

    // Mint coins
    public entry fun mint(
        treasury_cap: &mut TreasuryCap<IBT>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        coin::mint_and_transfer(treasury_cap, amount, recipient, ctx);
    }

    // Burn coins
    public entry fun burn(
        treasury_cap: &mut TreasuryCap<IBT>,
        coin: Coin<IBT>
    ) {
        coin::burn(treasury_cap, coin);
    }
}
