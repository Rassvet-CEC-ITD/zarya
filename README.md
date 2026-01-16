# Zarya - Decentralized Autonomous Intra-Party Organization (DAIPO)

> **Mathematically formalized party opinion through blockchain voting**

Zarya is a distributed software system designed to formalize, manage, and analyze political party opinions using DAO (Decentralized Autonomous Organization) technology and statistical analysis. It provides a transparent and democratic framework for decision-making.

## 🎯 Overview

The system implements a mathematically rigorous approach to collective decision-making, where party opinion is formalized as a pair of matrices containing continuous and categorical random variables. All changes to these matrices are governed by blockchain-based voting that mirrors the party's charter structure.

**Key Features:**
- 🗳️ **DAO-based Governance** - Blockchain voting aligned with party structure (a political party structure inside the smart-contract)
- 🧮 **Mathematical Formalization** - Opinion represented as statistical matrices
- 📊 **Statistical Analysis** - Automated aggregation and predictive modeling (histogram & avg :3 )
- 📝 **Auto-generation** - Human-readable documents from formalized data (general report pdf generation)
- 🔮 **Forecasting** - Predict changes in party position (1) see the avg, 2) make prediction - simple)

## 📁 Project Structure

This monorepo contains three main subprojects:

### 1. **zarya-contracts** - Smart Contract Layer
Solidity-based smart contracts built with Foundry, implementing the DAO governance system.

**Technology Stack:**
- Solidity ^0.8.28
- Foundry (Forge)
- OpenZeppelin Contracts v5.4.0

**Core Components:**
- `Zarya.sol` - Main contract coordinating the system
- `Matricies.sol` - Storage for opinion matrices (continuous & categorical)
- `Votings.sol` - Voting mechanisms and lifecycle management
- `PartyOrgans.sol` - Party structure and membership registry
- `Regions.sol` - Geographic organizational units

**Documentation:**
- [Smart Contracts README](zarya-contracts/README.md)
- [Whitepaper](zarya-contracts/whitepaper.md) (Russian)

### 2. **zarya-frontend** - Web Interface
Nuxt.js-based frontend providing user interaction with the DAO.

**Technology Stack:**
- Nuxt 3
- Vue 3
- Wagmi/Viem (Web3 integration)
- TanStack Query
- i18n (multilingual support)

**Features:**
- Voting interface with progress tracking
- Party opinion listing and visualization
- Wallet connection (Web3)
- Responsive design with SCSS

**Key Components:**
- Voting modal and cards
- Categorical distribution charts
- Continuous statistics displays
- Status badges and progress indicators

### 3. **zarya-api** - Backend Services
Spring Boot-based API layer providing additional services and integrations.

**Technology Stack:**
- Java 25
- Spring Boot 3.5.7
- Spring Security
- Thymeleaf
- Maven

**Purpose:**
- GraphQL client integration
- Backend services and business logic
- Security and authentication layer

## 🚀 Getting Started

### Prerequisites
- **For Contracts:** Foundry, Solidity compiler
- **For Frontend:** Node.js 18+, bun
- **For API:** JDK 25, Maven

### Quick Start

#### Smart Contracts
```bash
cd zarya-contracts
forge install
forge build
forge test
```

#### Frontend
```bash
cd zarya-frontend
bun install
bun run dev
```

#### Backend API
```bash
cd zarya-api
./mvnw spring-boot:run
```

## 🧮 How It Works

The system represents party opinion as **𝓜 = (𝓧, 𝓨)**, where:
- **𝓧** - Matrix of continuous random variables (quantitative measures)
- **𝓨** - Matrix of categorical random variables (categorical assessments)

Each cell in these matrices can only be modified through:
1. **Proposal** - A party member proposes a new value
2. **Voting** - The appropriate organ votes according to party charter
3. **Aggregation** - Accepted values are added to the sample and statistics recalculated

The smart contracts enforce that only the correct party organ (Congress, Council, Regional Office, etc.) can vote on each specific topic based on matrix row encoding.

## 📊 Voting Types

- **Membership Voting** - Adding/removing party members
- **Categorical Value Voting** - Discrete choice decisions
- **Continuous Value Voting** - Quantitative assessments
- **Theme Voting** - Adding new topics to matrices
- **Statement Voting** - Defining column semantics

## 🔗 Integration

The three layers work together:
1. **Contracts** store immutable voting results and matrix data on blockchain
2. **Frontend** provides UI for members to propose and vote
3. **API** offers additional services, analytics, and external integrations

## 📄 License

This project is licensed under CC0 1.0 Universal - see individual subproject licenses for details.

## 📚 Additional Resources

- [Presentation](https://docs.google.com/presentation/d/1mRsgTg3XsrVSvXpRoXnVyLOgX2QSJKPEfJUwnsZz_Uk/edit?usp=sharing) (Russian)
- [Whitepaper](zarya-contracts/whitepaper.md) (Russian) - Detailed theoretical foundation

---

*Built for transparent, democratic, and mathematically sound party governance.*
