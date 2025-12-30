#!/usr/bin/env python3
"""
Autonomous Coding Agent Demo
============================

A minimal harness demonstrating long-running autonomous coding with Claude.
This script implements the two-agent pattern (initializer + coding agent) and
incorporates all the strategies from the long-running agents guide.

REQUIRES: Python 3.10+

Example Usage:
    python3 autonomous_agent.py --project-dir ./claude_clone_demo
    python3 autonomous_agent.py --project-dir ./claude_clone_demo --max-iterations 5
"""

import sys

# =============================================================================
# PYTHON VERSION CHECK (REQUIRED: 3.10+)
# =============================================================================
if sys.version_info < (3, 10):
    print("=" * 60)
    print("ERROR: Python 3.10 or higher is required.")
    print("=" * 60)
    print(f"\nYou are running Python {sys.version_info.major}.{sys.version_info.minor}")
    print(f"Full version: {sys.version}")
    print("\nTo fix this:")
    print("  1. Install Python 3.10+: https://www.python.org/downloads/")
    print("  2. Use: python3.10 autonomous_agent.py (or python3.11, etc.)")
    print("  3. Or create a virtual environment with Python 3.10+")
    print("\nOn macOS with Homebrew:")
    print("  brew install python@3.11")
    print("  python3.11 autonomous_agent.py --project-dir ./my-app")
    print("=" * 60)
    sys.exit(1)

import argparse
import asyncio
from pathlib import Path

from agents import run_autonomous_agent


# Configuration
DEFAULT_MODEL = "claude-sonnet-4-5-20250929"


def parse_args() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Autonomous Coding Agent Demo - Long-running agent harness",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Start fresh project
  python autonomous_agent.py --project-dir ./claude_clone

  # Use a specific model
  python autonomous_agent.py --project-dir ./claude_clone --model claude-sonnet-4-5-20250929

  # Limit iterations for testing
  python autonomous_agent.py --project-dir ./claude_clone --max-iterations 5

  # Continue existing project
  python autonomous_agent.py --project-dir ./claude_clone

Authentication (one of):
  1. Claude Pro/Max subscription: Run 'claude login' first (recommended)
  2. API key: export ANTHROPIC_API_KEY='sk-ant-...'
        """,
    )

    parser.add_argument(
        "--project-dir",
        type=Path,
        default=Path("./autonomous_demo_project"),
        help="Directory for the project (default: generations/autonomous_demo_project). Relative paths automatically placed in generations/ directory.",
    )

    parser.add_argument(
        "--max-iterations",
        type=int,
        default=None,
        help="Maximum number of agent iterations (default: unlimited)",
    )

    parser.add_argument(
        "--model",
        type=str,
        default=DEFAULT_MODEL,
        help=f"Claude model to use (default: {DEFAULT_MODEL})",
    )

    parser.add_argument(
        "--feature-count",
        type=int,
        default=50,
        help="Target number of features to generate (default: 50)",
    )

    return parser.parse_args()


def main() -> None:
    """Main entry point."""
    args = parse_args()

    # Authentication is checked in agents/client.py
    # Supports both Claude subscription (via 'claude login') and API key

    # Automatically place projects in generations/ directory unless already specified
    project_dir = args.project_dir
    if not str(project_dir).startswith("generations/"):
        # Convert relative paths to be under generations/
        if project_dir.is_absolute():
            # If absolute path, use as-is
            pass
        else:
            # Prepend generations/ to relative paths
            project_dir = Path("generations") / project_dir

    # Run the agent
    try:
        asyncio.run(
            run_autonomous_agent(
                project_dir=project_dir,
                model=args.model,
                max_iterations=args.max_iterations,
                feature_count=args.feature_count,
            )
        )
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
        print("To resume, run the same command again")
    except Exception as e:
        print(f"\nFatal error: {e}")
        raise


if __name__ == "__main__":
    main()
