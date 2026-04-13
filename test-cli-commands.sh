#!/bin/bash

# Test script for CLI command functionality
# This verifies that the CLI commands work correctly when installed

set -e

echo "=========================================="
echo "Testing chatcn CLI Command Functionality"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Build and pack
echo "Step 1: Building and packing..."
npm run build > /dev/null 2>&1
TARBALL=$(npm pack 2>&1 | tail -n 1)
echo -e "${GREEN}✓ Package ready: $TARBALL${NC}"
echo ""

# Install globally
echo "Step 2: Installing globally..."
npm install -g "$TARBALL" > /dev/null 2>&1
echo -e "${GREEN}✓ Installed globally${NC}"
echo ""

# Test basic commands
echo "Step 3: Testing basic commands..."

# Test version
VERSION_OUTPUT=$(chatcn --version 2>&1)
if [[ "$VERSION_OUTPUT" == *"0.1.0"* ]]; then
    echo -e "${GREEN}✓ Version command works: $VERSION_OUTPUT${NC}"
else
    echo -e "${RED}✗ Version command failed${NC}"
    exit 1
fi

# Test help
HELP_OUTPUT=$(chatcn --help 2>&1)
if [[ "$HELP_OUTPUT" == *"chatcn"* ]] && [[ "$HELP_OUTPUT" == *"init"* ]] && [[ "$HELP_OUTPUT" == *"add"* ]]; then
    echo -e "${GREEN}✓ Help command works${NC}"
else
    echo -e "${RED}✗ Help command failed${NC}"
    exit 1
fi

# Test init help
INIT_HELP=$(chatcn init --help 2>&1)
if [[ "$INIT_HELP" == *"Initialize a chatbot"* ]]; then
    echo -e "${GREEN}✓ Init help command works${NC}"
else
    echo -e "${RED}✗ Init help command failed${NC}"
    exit 1
fi

# Test add help
ADD_HELP=$(chatcn add --help 2>&1)
if [[ "$ADD_HELP" == *"Add a chatbot template"* ]]; then
    echo -e "${GREEN}✓ Add help command works${NC}"
else
    echo -e "${RED}✗ Add help command failed${NC}"
    exit 1
fi

echo ""

# Test from different directory
echo "Step 4: Testing from different directory..."
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"
echo -e "${YELLOW}Current directory: $(pwd)${NC}"

VERSION_OUTPUT=$(chatcn --version 2>&1)
if [[ "$VERSION_OUTPUT" == *"0.1.0"* ]]; then
    echo -e "${GREEN}✓ Commands work from any directory${NC}"
else
    echo -e "${RED}✗ Commands failed from different directory${NC}"
    exit 1
fi

cd - > /dev/null
rm -rf "$TEMP_DIR"
echo ""

# Cleanup
echo "Step 5: Cleaning up..."
npm uninstall -g chatcn > /dev/null 2>&1
rm -f "$TARBALL"
echo -e "${GREEN}✓ Cleanup complete${NC}"
echo ""

echo "=========================================="
echo -e "${GREEN}All command tests passed!${NC}"
echo "=========================================="
echo ""
echo "Verified commands:"
echo "  ✓ chatcn --version"
echo "  ✓ chatcn --help"
echo "  ✓ chatcn init --help"
echo "  ✓ chatcn add --help"
echo "  ✓ Commands work from any directory"
