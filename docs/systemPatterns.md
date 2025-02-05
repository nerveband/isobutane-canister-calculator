# System Patterns and Architecture

## Architecture Overview
The application will follow a simple, modular architecture:

```
isobutane-canister-calculator/
├── src/                    # Source code
│   ├── calculator/         # Core calculation logic
│   ├── ui/                 # User interface components
│   └── utils/             # Utility functions
├── tests/                  # Test files
└── docs/                   # Documentation
```

## Key Technical Decisions
1. Web-based implementation for maximum accessibility
2. Client-side calculations for privacy and offline use
3. Responsive design for mobile and desktop use
4. Unit testing for calculation accuracy

## Design Patterns
- Module Pattern for code organization
- Factory Pattern for creating calculation instances
- Observer Pattern for UI updates
- Strategy Pattern for different calculation methods

## Code Style
- ES6+ JavaScript standards
- Clear function and variable naming
- Comprehensive error handling
- Detailed code comments
- TypeScript for type safety 