# Zarya Frontend

> Web3 interface for the Zarya DAIPO (Decentralized Autonomous Intra-Party Organization)

A Vue 3 + TypeScript + Vite frontend application for decentralized party governance through blockchain-based voting and opinion formalization.

## Overview

Web interface for the Zarya DAO governance system enabling:

- **DAO Voting** - 8 types of proposals through Ethereum smart contracts
- **Opinion Matrices** - Categorical and numerical party positions
- **Party Structure** - Hierarchical organs from local to central level
- **Real-time Updates** - Blockchain event monitoring and live vote tracking
- **Data Explorer** - REST API access with PDF report generation
- **Multilingual** - English and Russian support

## Technology Stack

- **Framework:** Vue 3 with Composition API & `<script setup>`
- **Language:** TypeScript 5+
- **Build Tool:** Vite 6+
- **Web3:** `@wagmi/vue`, `viem`, `@metamask/sdk`
- **State Management:** `@tanstack/vue-query`, Vue Router 4
- **Styling:** SCSS with `sass-embedded`
- **i18n:** `vue-i18n` (Russian/English)

## Project Structure

```
src/
├── components/          # Vue components by feature
│   ├── Account.vue, Connect.vue, Navigation.vue, Button.vue, Toast.vue
│   ├── landing/Landing.vue
│   ├── voting/Voting.vue        # Main voting dashboard with tabs
│   ├── data/                    # Data Explorer with API integration
│   │   ├── Data.vue, LoginForm.vue, ReportDownloader.vue
│   ├── categoricalValueVoting/  # 4 components: main, actions, block, stats
│   ├── numericalValueVoting/    # Same pattern for each voting type
│   ├── decimalsVoting/
│   ├── membershipVoting/
│   ├── membershipRevocationVoting/
│   ├── statementVoting/
│   ├── themeVoting/
│   └── categoryVoting/
├── composables/         # Reusable logic
│   ├── useZaryaContract.ts      # 20+ contract read functions
│   ├── useVotingActions.ts      # Write: create, vote, finalize
│   ├── useVotingCache.ts        # In-memory cache with auto-updates
│   ├── useVotingScanner.ts      # Historical blockchain scanning
│   ├── useVotingWatcher.ts      # Real-time event monitoring
│   ├── usePartyOrgan.ts         # Party hierarchy utilities
│   └── useDataExplorer.ts       # REST API integration
├── types/               # TypeScript definitions
│   ├── contract.ts, contract-events.ts, vote.ts
├── locales/             # i18n translations (500+ keys each)
│   ├── en.json, ru.json
├── assets/
│   ├── abis/Zarya.json          # Contract ABI
│   ├── images/                  # Logos (EN/RU)
│   └── scss/                    # Feature-based styles (BEM)
├── App.vue, main.ts, routing.ts, wagmi.ts, zarya.ts, vite-env.d.ts
```

## Getting Started

### Prerequisites

- Node.js 18+
- Bun (recommended) or npm/yarn/pnpm
- MetaMask browser extension
- Sepolia ETH from [sepoliafaucet.com](https://sepoliafaucet.com/)

### Installation

```bash
bun install  # or npm install
```

### Configuration

Update in [src/zarya.ts](src/zarya.ts) and [src/wagmi.ts](src/wagmi.ts):
- Contract address (Sepolia)
- RPC endpoint (Alchemy/Infura)
- API backend URL
- Historical scan range

### Development

```bash
bun run dev  # → http://localhost:5173
```

### Build

```bash
bun run build  # → dist/
bun run preview  # → http://localhost:4173
```

## Smart Contract Integration

Connects to **Zarya smart contract** on **Sepolia testnet** (Chain ID: 11155111). Configuration in [src/zarya.ts](src/zarya.ts).

### Key Composables

**useZaryaContract.ts** - 20+ read functions:
- `useVotingResults`, `useIsVotingActive`, `useIsVotingFinalized`
- `useHasVoted`, `useTheme`, `useStatement`, `useCategory`, `useDecimals`
- `usePartyOpinionCategorical`, `usePartyOpinionNumerical`
- `useIsMember`, `useOrganName`

**useVotingActions.ts** - Write operations:
- `createVoting(params)` - Create new voting (8 types)
- `castVote(votingId, support)` - Cast FOR/AGAINST vote
- `finalizeVoting(votingId)` - Execute after voting period

**useVotingCache.ts** - In-memory caching with automatic blockchain event updates

**useVotingScanner.ts** - Historical blockchain scanning with configurable date ranges

**useVotingWatcher.ts** - Real-time event monitoring for instant UI updates

**usePartyOrgan.ts** - 8 organ types (LocalSoviet → Congress), hierarchy utilities

**useDataExplorer.ts** - REST API integration for backend data access

## Voting Types

8 voting types with consistent UI pattern (`*Voting.vue`, `*VotingActions.vue`, `*VotingBlock.vue`, `*VotingStats.vue`):

### 1. Categorical Value (`SuggestionType.CategoricalValue = 6`)
Set discrete values in opinion matrix (e.g., "Support"/"Oppose"/"Neutral")
- **Params**: organ, x, y, value, valueAuthor
- **Effect**: Updates `partyOpinionCategorical[organ][x][y]`

### 2. Numerical Value (`SuggestionType.NumericalValue = 7`)
Set numerical values (budget, tax rates, quotas)
- **Params**: organ, x, y, value, valueAuthor
- **Effect**: Updates `partyOpinionNumerical[organ][x][y]`

### 3. Membership (`SuggestionType.Membership = 0`)
Add member to party organ
- **Params**: organ, member address
- **Effect**: Adds to `organMembers[organ]`

### 4. Membership Revocation (`SuggestionType.MembershipRevocation = 1`)
Remove member from party organ
- **Params**: organ, member address
- **Effect**: Removes from `organMembers[organ]`

### 5. Category (`SuggestionType.Category = 2`)
Define category for matrix cell
- **Params**: organ, x, y, category, categoryName
- **Effect**: Updates `cellCategory[x][y]`

### 6. Decimals (`SuggestionType.Decimals = 3`)
Set decimal precision for numerical cell
- **Params**: organ, x, y, decimals (0-18)
- **Effect**: Updates `cellDecimals[x][y]`

### 7. Theme (`SuggestionType.Theme = 4`)
Create/modify theme (matrix row)
- **Params**: isCategorical, x, theme name
- **Effect**: Updates `themes[isCategorical][x]`

### 8. Statement (`SuggestionType.Statement = 5`)
Create/modify statement (matrix column)
- **Params**: isCategorical, x, y, statement text
- **Effect**: Updates `statements[isCategorical][x][y]`

**Lifecycle**: Creation → Voting Period → Finalization → Contract State Update

## Party Organ Hierarchy

The Zarya system supports **8 hierarchical party organ types** (enum `PartyOrganType` in [src/types/vote.ts](src/types/vote.ts)):

### Local Level
- **0: LocalSoviet** - Local party committee for day-to-day operations
- **1: LocalGeneralAssembly** - Local membership assembly for major decisions

### Regional Level
- **2: RegionalSoviet** - Regional party committee coordinating local organs
- **3: RegionalConference** - Regional delegates conference
- **4: RegionalGeneralAssembly** - Full regional membership assembly

### Central Level
- **5: Chairperson** - Party leadership position with executive authority
- **6: CentralSoviet** - Central party committee for national policy
- **7: Congress** - Supreme party organ with full membership representation

Each organ type has different:
- **Membership requirements** - Who can join and vote
- **Voting powers** - Which types of votings can be initiated
- **Scope of authority** - What decisions the organ can make
- **Representation** - How many members and geographic coverage

Organs are referenced by their **`bytes32` hash** in smart contracts for gas efficiency.

## Internationalization

- **Russian** (`ru`) - Default, 500+ keys
- **English** (`en`) - Full coverage, 500+ keys
- Files: [src/locales/](src/locales/)
- Switchable via navigation bar

## Data Explorer

The **Data Explorer** ([/data](src/components/data/Data.vue) route) provides a comprehensive interface to the Zarya REST API backend for accessing structured party data, statistics, and reports.

### Features

#### Authentication System
- **Login Form**: Session-based authentication with Spring Security
- **Default Credentials**: `oleg` / `rassvet` (configurable in backend)
- **Session Management**: Automatic cookie handling via browser
- **Logout**: Clean session termination with backend coordination

#### Data Browsing
Access paginated endpoints for party data:

- **Categorical Cells** - `GET /auth/data/cells/categorical`
  - Party opinion matrix categorical values
  - Includes organ, theme, statement, category, value information
  - Pagination support (page/size parameters)

- **Numerical Cells** - `GET /auth/data/cells/numerical`
  - Party opinion matrix numerical values
  - Includes decimal precision and value ranges
  - Filterable and sortable results

- **Themes** - `GET /auth/data/themes`
  - All party themes (categorical and numerical matrices)
  - Theme descriptions and creation metadata

- **Statements** - `GET /auth/data/statements`
  - All party statements linked to themes
  - Statement text and context information

- **Organs** - `GET /auth/data/organs`
  - Party organ structure and hierarchy
  - Membership lists and organ metadata

#### Report Generation
- **PDF Reports** - `GET /auth/report`
  - Comprehensive party data export
  - Professional formatting with all matrices
  - Download as PDF file
  - Includes voting history, current positions, membership

#### API Configuration
- **Dynamic URL**: Configure API base URL in the UI
- **CORS Support**: Cross-origin requests with credentials
- **Error Handling**: User-friendly error messages for API failures
- **Loading States**: Progress indicators during data fetching

### Usage Example

1. Navigate to [/data](http://localhost:5173/data) route
2. Login with credentials (default: `oleg`/`rassvet`)
3. Browse data categories using tabs
4. Use pagination controls to navigate results
5. Download PDF report for comprehensive data export
6. Logout when finished

### Backend Integration

The frontend expects a REST API backend (see [zarya-api](../zarya-api/)) with:
- Spring Boot application running on `http://localhost:8080` (configurable)
- Spring Security session authentication
- CORS configuration allowing frontend origin
- JSON response format for data endpoints
- PDF generation for report endpoint

## Dependencies

```json
{
  "@metamask/sdk": "^0.34.0",
  "@tanstack/vue-query": "latest",
  "@wagmi/vue": "latest",
  "buffer": "^6.0.3",
  "viem": "latest",
  "vue": "latest",
  "vue-i18n": "^11.2.8",
  "vue-router": "^4.6.4"
}
```

## Web3 & Security

- **Wagmi v2** for Web3 with MetaMask connector
- **Sepolia testnet** (Chain ID: 11155111)
- Type-safe contract interactions
- LocalStorage for wallet connections
- Session-based API authentication

## Related Projects

**[zarya-contracts](../zarya-contracts/)** - Solidity smart contracts (Foundry)  
**[zarya-api](../zarya-api/)** - Spring Boot REST API

## License

See root repository for license information.
