# Demonstration of broken LQ behaviour

## Prepare
- Make sure Deno is installed
- Make sure SurrealDB is installed

## To run
- First, start SurrealDB (if you haven't already)
  - `deno task dev:surreal`
  - Or otherwise have a DB instance running with the options configured in the `main.ts` file.
- Second, run the script
  - Once: `deno task dev`
  - Watch mode: `deno task dev:watch` (will rerun everytime you save the `main.ts` file)

## Issue this script demonstrates
This demo demonstrates two issues:
- We have a live query named "LIVE". This LQ has a `WHERE` clause which filters only people that are verified.
  - It fails to send any deletions to the client, which could be explained by maybe the filter being applied to the deleted record (where the data does not exist anymore)
- We have a live query named "NONE". This LQ has a `WHERE` clause which filters only people where `verified` is `NONE`.
  - This sends through only all the deletions, which demonstrates that the filters for deletions are applied to the deleted record (where the data does not exist anymore)
- We have a live query named "ALTQ". This LQ does not have any filters and will send over every message coming through.