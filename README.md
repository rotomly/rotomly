# rotomly

## Setup

The main setup goal is getting the *massive* amounts of data into the card database.

There are two ways of going about this.

1. Run the factory to download the cache from pokemontcg.io
2. Get the cached set of card metadata from a pre-existing package

Once that is done the factory will spit out a *very* large sqlite database that contains all cards, images, and metadata. This database is readonly and does not need to be modified. This will serve as the supplementary database to the "game" database which will reference cards by their universal ID.
