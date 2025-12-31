#!/bin/bash
# init.sh - Smart Convex project setup
# Detects if user is logged into Convex CLI and adjusts behavior accordingly

set -e

echo "=============================================="
echo "  Convex MVP Builder - Setup"
echo "=============================================="
echo ""

# =============================================================================
# STEP 1: Check Node.js version
# =============================================================================
echo "Checking Node.js version..."

if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found."
    echo ""
    echo "Please install Node.js 20.9.0 or higher:"
    echo "  Download: https://nodejs.org/"
    echo "  Or use nvm: nvm install 20"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "WARNING: Node.js $NODE_VERSION detected. Convex requires Node.js 20+."
    echo "  Current: $(node -v)"
    echo "  Required: v20.9.0 or higher"
    echo ""
    echo "Please upgrade Node.js before continuing."
    exit 1
fi

echo "Node.js $(node -v) detected"
echo ""

# =============================================================================
# STEP 2: Check Python version (for autonomous agent)
# =============================================================================
echo "Checking Python version..."

PYTHON_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")' 2>/dev/null)
if [[ -z "$PYTHON_VERSION" ]]; then
    echo "WARNING: Python 3 not found."
    echo "  The autonomous agent requires Python 3.10+"
    echo "  Install from: https://www.python.org/downloads/"
    echo ""
elif [[ $(echo "$PYTHON_VERSION < 3.10" | bc -l) -eq 1 ]]; then
    echo "WARNING: Python $PYTHON_VERSION detected."
    echo "  The autonomous agent requires Python 3.10+"
    echo "  Install from: https://www.python.org/downloads/"
    echo ""
else
    echo "Python $PYTHON_VERSION detected"
    echo ""
fi

# =============================================================================
# STEP 3: Install npm dependencies
# =============================================================================
echo "Installing npm dependencies..."
npm install

echo ""

# =============================================================================
# STEP 4: Check Convex CLI authentication
# =============================================================================
echo "Checking Convex CLI status..."

if npx convex whoami &>/dev/null 2>&1; then
    # User is logged in - full automatic setup
    CONVEX_USER=$(npx convex whoami 2>&1 | head -1)
    echo "Logged in as: $CONVEX_USER"
    echo ""

    # Check if Convex is already configured
    if [ ! -f ".env.local" ] || ! grep -q "CONVEX_DEPLOYMENT" .env.local 2>/dev/null; then
        echo "Initializing Convex backend..."
        echo "This will create a new Convex project."
        echo ""

        # Run Convex dev once to initialize
        npx convex dev --once --configure=new || {
            echo ""
            echo "Convex initialization requires interactive setup."
            echo "Please run: npx convex dev"
            echo "Then follow the prompts to create or link a project."
            exit 1
        }

        echo ""
        echo "Convex backend created!"
    else
        echo "Convex already configured"
    fi

    # Generate/update types
    echo ""
    echo "Generating TypeScript types..."
    npx convex codegen || true

    echo ""
    echo "=============================================="
    echo "  SETUP COMPLETE!"
    echo "=============================================="
    echo ""
    echo "  To start development, run:"
    echo "    npm run dev"
    echo ""
    echo "  This starts both Next.js and Convex in parallel."
    echo ""
    echo "  Your app will be available at:"
    echo "    http://localhost:3000"
    echo ""

else
    # User is NOT logged into Convex CLI
    echo "Not logged into Convex CLI"
    echo ""
    echo "=============================================="
    echo "  CONVEX SETUP REQUIRED"
    echo "=============================================="
    echo ""
    echo "  npm dependencies have been installed."
    echo ""
    echo "  To complete setup, follow these steps:"
    echo ""
    echo "  1. Log into Convex (creates free account if needed):"
    echo "     npx convex login"
    echo ""
    echo "  2. Initialize your Convex backend:"
    echo "     npx convex dev"
    echo "     (Select 'create a new project' when prompted)"
    echo ""
    echo "  3. In a separate terminal, start Next.js:"
    echo "     npm run dev:frontend"
    echo ""
    echo "  Or after step 2 completes, you can run:"
    echo "     npm run dev"
    echo "     (This runs both Convex and Next.js together)"
    echo ""
    echo "  Need a Convex account?"
    echo "    Sign up free at: https://convex.dev"
    echo ""
    echo "=============================================="
fi

# =============================================================================
# STEP 5: Check git remote
# =============================================================================
echo ""
CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null)
if [[ "$CURRENT_REMOTE" == *"pushREC/convex-mvp-builder"* ]]; then
    echo "=============================================="
    echo "  GIT REMOTE SETUP"
    echo "=============================================="
    echo ""
    echo "  Your git remote still points to the template repository."
    echo "  To push your work to your own GitHub repo:"
    echo ""
    echo "  Option 1 - Update remote manually:"
    echo "    git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    echo ""
    echo "  Option 2 - Use GitHub CLI:"
    echo "    gh repo create my-app --private --source=. --remote=origin --push"
    echo ""
    echo "=============================================="
fi

echo ""
echo "Run './scripts/preflight.sh' to verify all agent dependencies."
