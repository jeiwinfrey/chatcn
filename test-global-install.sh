#!/bin/bash

# Test script for global installation and npx execution
# This script tests Requirements 14.6 and 14.7

set -e

echo "=========================================="
echo "Testing chatcn CLI Installation Methods"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Build the package
echo "Step 1: Building the package..."
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi
echo ""

# Test 2: Test npm pack (simulate publishing)
echo "Step 2: Creating package tarball..."
TARBALL=$(npm pack 2>&1 | tail -n 1)
if [ -f "$TARBALL" ]; then
    echo -e "${GREEN}✓ Package created: $TARBALL${NC}"
else
    echo -e "${RED}✗ Failed to create package${NC}"
    exit 1
fi
echo ""

# Test 3: Test global installation
echo "Step 3: Testing global installation..."
echo -e "${YELLOW}Installing globally from tarball...${NC}"
npm install -g "$TARBALL"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Global installation successful${NC}"
else
    echo -e "${RED}✗ Global installation failed${NC}"
    exit 1
fi
echo ""

# Test 4: Test chatcn command from any directory
echo "Step 4: Testing 'chatcn' command execution from different directory..."
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"
echo -e "${YELLOW}Current directory: $(pwd)${NC}"

# Test --version flag
chatcn --version
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 'chatcn --version' works from any directory${NC}"
else
    echo -e "${RED}✗ 'chatcn --version' failed${NC}"
    exit 1
fi

# Test --help flag
chatcn --help > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 'chatcn --help' works from any directory${NC}"
else
    echo -e "${RED}✗ 'chatcn --help' failed${NC}"
    exit 1
fi

# Return to original directory
cd - > /dev/null
rm -rf "$TEMP_DIR"
echo ""

# Test 5: Uninstall global package
echo "Step 5: Cleaning up global installation..."
npm uninstall -g chatcn
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Global uninstall successful${NC}"
else
    echo -e "${RED}✗ Global uninstall failed${NC}"
fi
echo ""

# Test 6: Test npx execution
echo "Step 6: Testing npx execution without global install..."
echo -e "${YELLOW}Running 'npx chatcn --version' using local tarball...${NC}"

# Create a temporary directory for npx test
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"
echo -e "${YELLOW}Current directory: $(pwd)${NC}"

# Copy tarball to temp directory
cp "$OLDPWD/$TARBALL" .

# Test npx with local tarball (use --yes to skip prompts)
npx --yes "$TARBALL" --version
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 'npx chatcn --version' works without global install${NC}"
else
    echo -e "${RED}✗ 'npx chatcn --version' failed${NC}"
    exit 1
fi

# Test npx help
npx --yes "$TARBALL" --help > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 'npx chatcn --help' works without global install${NC}"
else
    echo -e "${RED}✗ 'npx chatcn --help' failed${NC}"
    exit 1
fi

# Return to original directory
cd - > /dev/null
rm -rf "$TEMP_DIR"
echo ""

# Cleanup tarball
echo "Step 7: Cleaning up..."
rm -f "$TARBALL"
echo -e "${GREEN}✓ Cleanup complete${NC}"
echo ""

echo "=========================================="
echo -e "${GREEN}All tests passed!${NC}"
echo "=========================================="
echo ""
echo "Summary:"
echo "  ✓ Package builds successfully"
echo "  ✓ Package can be installed globally"
echo "  ✓ 'chatcn' command works from any directory"
echo "  ✓ 'npx chatcn' works without global install"
echo ""
echo "Requirements validated:"
echo "  ✓ 14.6: CLI executable as 'chatcn' from any directory"
echo "  ✓ 14.7: CLI executable with npx without global installation"
