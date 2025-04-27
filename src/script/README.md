# Scripts

This directory contains utility scripts for various operations.

## generateMintData.ts

This script generates a JSON file containing data for minting tokens:

- Fetches all pending token purchases from the database
- Creates a structured JSON file with two arrays:
  - `recipients`: All wallet addresses that have pending token purchases
  - `amounts`: The corresponding token amounts for each recipient
- Saves the file to an `output` directory with a timestamp

### Usage

```bash
# Run from the project root
npm run generate-mint-data
```

### Output

The script will generate a file in the `output` directory (creates the directory if it doesn't exist) with a name in the format:

```bash
mint-data-YYYY-MM-DD-HH-MM-SS.json
```

Example output file content:

```json
{
  "recipients": ["0x123abc...", "0x456def..."],
  "amounts": [100, 50]
}
```

### Error Handling

- If no pending purchases are found, the script will log a message and exit without creating a file
- Any errors during execution will be logged to the console
