# Overview

A Stock Price Checker application that allows users to view real-time stock prices and interact with a "like" system for stocks. This project is part of the freeCodeCamp Information Security curriculum and provides APIs to fetch stock data from external sources while implementing security best practices. The application supports single stock queries and comparison between two stocks, with a voting mechanism that tracks user preferences while maintaining anonymity through IP hashing.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Static HTML/CSS/JavaScript**: Simple client-side interface served from the `/public` directory
- **Form-based interactions**: Two main forms for single stock queries and stock comparisons
- **Fetch API**: Modern JavaScript approach for making API calls to the backend
- **Real-time updates**: Dynamic JSON result display without page refreshes

## Backend Architecture
- **Express.js Framework**: RESTful API server with middleware pipeline
- **Security-first approach**: Helmet.js integration with Content Security Policy, CORS configuration, and request body limits
- **Modular routing**: Separate route handlers for API endpoints and testing utilities
- **Trust proxy configuration**: Proper IP handling for deployment environments like Replit

## Data Storage Solutions
- **In-memory storage**: Current implementation uses JavaScript objects for like tracking
- **MongoDB integration**: Infrastructure prepared with MongoDB client and connection utilities
- **IP-based tracking**: Anonymous user identification through SHA-256 hashing of client IPs
- **Persistent likes system**: Each stock symbol maintains a list of user hashes and total like count

## Authentication and Authorization
- **IP-based rate limiting**: One like per IP address per stock symbol
- **Anonymous tracking**: User privacy maintained through cryptographic hashing
- **No traditional auth**: Stateless approach suitable for public API usage

## External Dependencies
- **Stock data API**: Integration with `stock-price-checker-proxy.freecodecamp.rocks` for real-time stock quotes
- **MongoDB**: Database connection prepared for future persistent storage needs
- **Node-fetch**: HTTP client for external API communication
- **Security middleware**: Helmet.js for security headers and CORS for cross-origin requests

## API Design Patterns
- **RESTful endpoints**: Clean `/api/stock-prices` endpoint with query parameter support
- **Flexible input handling**: Support for both single stock and dual stock comparison queries
- **Error handling**: Graceful handling of invalid stock symbols and network failures
- **Response normalization**: Consistent JSON response format for both single and comparison queries

The architecture emphasizes security, simplicity, and extensibility while meeting the educational requirements of the freeCodeCamp curriculum. The system is designed to handle the transition from in-memory storage to persistent MongoDB storage without major architectural changes.