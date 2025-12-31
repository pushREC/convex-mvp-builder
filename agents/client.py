"""
Claude SDK Client Configuration
===============================

Functions for creating and configuring the Claude Agent SDK client.
"""

import json
import os
from pathlib import Path

from claude_code_sdk import ClaudeCodeOptions, ClaudeSDKClient
from claude_code_sdk.types import HookMatcher

from utils.security import bash_security_hook


# Puppeteer MCP tools for browser automation
PUPPETEER_TOOLS = [
    "mcp__puppeteer__puppeteer_navigate",
    "mcp__puppeteer__puppeteer_screenshot",
    "mcp__puppeteer__puppeteer_click",
    "mcp__puppeteer__puppeteer_fill",
    "mcp__puppeteer__puppeteer_select",
    "mcp__puppeteer__puppeteer_hover",
    "mcp__puppeteer__puppeteer_evaluate",
]

# Playwright MCP tools for browser automation (better React support)
# Playwright's browser_type sends actual keystrokes which triggers React onChange
PLAYWRIGHT_TOOLS = [
    "mcp__playwright__browser_navigate",
    "mcp__playwright__browser_snapshot",
    "mcp__playwright__browser_click",
    "mcp__playwright__browser_type",
    "mcp__playwright__browser_fill_form",
    "mcp__playwright__browser_take_screenshot",
    "mcp__playwright__browser_hover",
    "mcp__playwright__browser_select_option",
    "mcp__playwright__browser_press_key",
    "mcp__playwright__browser_evaluate",
    "mcp__playwright__browser_wait_for",
    "mcp__playwright__browser_tabs",
    "mcp__playwright__browser_navigate_back",
    "mcp__playwright__browser_close",
    "mcp__playwright__browser_install",
]

# Built-in tools
BUILTIN_TOOLS = [
    "Read",
    "Write",
    "Edit",
    "Glob",
    "Grep",
    "Bash",
]


def check_authentication() -> str:
    """
    Check which authentication method is available.

    Returns:
        str: Description of auth method ("subscription" or "api_key")

    Raises:
        ValueError: If no authentication is available
    """
    import subprocess

    # Check if Claude Code CLI is installed and authenticated
    try:
        result = subprocess.run(
            ["claude", "--version"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            # Claude CLI is installed - it will handle auth automatically
            # The SDK uses the CLI's authentication (subscription or API key)
            return "subscription"
    except (subprocess.SubprocessError, FileNotFoundError):
        pass

    # Fall back to API key
    if os.environ.get("ANTHROPIC_API_KEY"):
        return "api_key"

    # No authentication available
    raise ValueError(
        "No authentication found.\n\n"
        "Option 1 - Claude Pro/Max Subscription (recommended):\n"
        "  Run: claude login\n\n"
        "Option 2 - API Key (pay-as-you-go):\n"
        "  export ANTHROPIC_API_KEY='sk-ant-...'\n"
        "  Get key from: https://console.anthropic.com/"
    )


def create_client(project_dir: Path, model: str) -> ClaudeSDKClient:
    """
    Create a Claude Agent SDK client with multi-layered security.

    Authentication is handled automatically by the SDK:
    1. First checks Claude Code CLI auth (subscription via 'claude login')
    2. Falls back to ANTHROPIC_API_KEY environment variable

    Args:
        project_dir: Directory for the project
        model: Claude model to use

    Returns:
        Configured ClaudeSDKClient

    Security layers (defense in depth):
    1. Sandbox - OS-level bash command isolation prevents filesystem escape
    2. Permissions - File operations restricted to project_dir only
    3. Security hooks - Bash commands validated against an allowlist
       (see security.py for ALLOWED_COMMANDS)
    """
    # Check and display authentication method
    auth_method = check_authentication()
    if auth_method == "subscription":
        print("Authentication: Claude Code subscription (via 'claude login')")
    else:
        print("Authentication: API key (ANTHROPIC_API_KEY)")

    # Create comprehensive security settings
    # Note: Using relative paths ("./**") restricts access to project directory
    # since cwd is set to project_dir
    security_settings = {
        "sandbox": {"enabled": True, "autoAllowBashIfSandboxed": True},
        "permissions": {
            "defaultMode": "acceptEdits",  # Auto-approve edits within allowed directories
            "allow": [
                # Allow all file operations within the project directory
                "Read(./**)",
                "Write(./**)",
                "Edit(./**)",
                "Glob(./**)",
                "Grep(./**)",
                # Bash permission granted here, but actual commands are validated
                # by the bash_security_hook (see security.py for allowed commands)
                "Bash(*)",
                # Allow browser automation MCP tools
                *PUPPETEER_TOOLS,
                *PLAYWRIGHT_TOOLS,
            ],
        },
    }

    # Ensure project directory exists before creating settings file
    project_dir.mkdir(parents=True, exist_ok=True)

    # Write settings to a file in the project directory
    settings_file = project_dir / ".claude_settings.json"
    with open(settings_file, "w") as f:
        json.dump(security_settings, f, indent=2)

    print(f"Created security settings at {settings_file}")
    print("   - Sandbox enabled (OS-level bash isolation)")
    print(f"   - Filesystem restricted to: {project_dir.resolve()}")
    print("   - Bash commands restricted to allowlist (see security.py)")
    print("   - MCP servers: puppeteer, playwright (browser automation)")
    print()

    return ClaudeSDKClient(
        options=ClaudeCodeOptions(
            model=model,
            system_prompt="You are an expert full-stack developer building a production-quality web application.",
            allowed_tools=[
                *BUILTIN_TOOLS,
                *PUPPETEER_TOOLS,
                *PLAYWRIGHT_TOOLS,
            ],
            mcp_servers={
                "puppeteer": {"command": "npx", "args": ["puppeteer-mcp-server"]},
                "playwright": {"command": "npx", "args": ["@anthropic/mcp-server-playwright"]},
            },
            hooks={
                "PreToolUse": [
                    HookMatcher(matcher="Bash", hooks=[bash_security_hook]),
                ],
            },
            max_turns=1000,
            cwd=str(project_dir.resolve()),
            settings=str(settings_file.resolve()),  # Use absolute path
        )
    )
