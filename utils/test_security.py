#!/usr/bin/env python3
"""
Security Hook Tests
===================

Tests for the bash command security validation logic.
Run with: python -m utils.test_security
"""

import asyncio
import sys

from utils.security import (
    bash_security_hook,
    extract_commands,
    validate_chmod_command,
    validate_init_script,
    validate_file_write,
    file_security_hook,
)


def test_hook(command: str, should_block: bool) -> bool:
    """Test a single command against the security hook."""
    input_data = {"tool_name": "Bash", "tool_input": {"command": command}}
    result = asyncio.run(bash_security_hook(input_data))
    was_blocked = result.get("decision") == "block"

    if was_blocked == should_block:
        status = "PASS"
    else:
        status = "FAIL"
        expected = "blocked" if should_block else "allowed"
        actual = "blocked" if was_blocked else "allowed"
        reason = result.get("reason", "")
        print(f"  {status}: {command!r}")
        print(f"         Expected: {expected}, Got: {actual}")
        if reason:
            print(f"         Reason: {reason}")
        return False

    print(f"  {status}: {command!r}")
    return True


def test_extract_commands():
    """Test the command extraction logic."""
    print("\nTesting command extraction:\n")
    passed = 0
    failed = 0

    test_cases = [
        ("ls -la", ["ls"]),
        ("npm install && npm run build", ["npm", "npm"]),
        ("cat file.txt | grep pattern", ["cat", "grep"]),
        ("/usr/bin/node script.js", ["node"]),
        ("VAR=value ls", ["ls"]),
        ("git status || git init", ["git", "git"]),
    ]

    for cmd, expected in test_cases:
        result = extract_commands(cmd)
        if result == expected:
            print(f"  PASS: {cmd!r} -> {result}")
            passed += 1
        else:
            print(f"  FAIL: {cmd!r}")
            print(f"         Expected: {expected}, Got: {result}")
            failed += 1

    return passed, failed


def test_validate_chmod():
    """Test chmod command validation."""
    print("\nTesting chmod validation:\n")
    passed = 0
    failed = 0

    # Test cases: (command, should_be_allowed, description)
    test_cases = [
        # Allowed cases
        ("chmod +x init.sh", True, "basic +x"),
        ("chmod +x script.sh", True, "+x on any script"),
        ("chmod u+x init.sh", True, "user +x"),
        ("chmod a+x init.sh", True, "all +x"),
        ("chmod ug+x init.sh", True, "user+group +x"),
        ("chmod +x file1.sh file2.sh", True, "multiple files"),
        # Blocked cases
        ("chmod 777 init.sh", False, "numeric mode"),
        ("chmod 755 init.sh", False, "numeric mode 755"),
        ("chmod +w init.sh", False, "write permission"),
        ("chmod +r init.sh", False, "read permission"),
        ("chmod -x init.sh", False, "remove execute"),
        ("chmod -R +x dir/", False, "recursive flag"),
        ("chmod --recursive +x dir/", False, "long recursive flag"),
        ("chmod +x", False, "missing file"),
    ]

    for cmd, should_allow, description in test_cases:
        allowed, reason = validate_chmod_command(cmd)
        if allowed == should_allow:
            print(f"  PASS: {cmd!r} ({description})")
            passed += 1
        else:
            expected = "allowed" if should_allow else "blocked"
            actual = "allowed" if allowed else "blocked"
            print(f"  FAIL: {cmd!r} ({description})")
            print(f"         Expected: {expected}, Got: {actual}")
            if reason:
                print(f"         Reason: {reason}")
            failed += 1

    return passed, failed


def test_validate_init_script():
    """Test init.sh script execution validation."""
    print("\nTesting init.sh validation:\n")
    passed = 0
    failed = 0

    # Test cases: (command, should_be_allowed, description)
    test_cases = [
        # Allowed cases (safe invocations only)
        ("./init.sh", True, "basic ./init.sh"),
        ("./init.sh arg1 arg2", True, "with arguments"),
        ("bash init.sh", True, "bash invocation"),
        ("sh init.sh", True, "sh invocation"),
        # Blocked cases (path traversal prevention)
        ("/path/to/init.sh", False, "absolute path blocked - security"),
        ("../dir/init.sh", False, "relative path blocked - security"),
        ("./setup.sh", False, "different script name"),
        ("./init.py", False, "python script"),
        ("./malicious.sh", False, "malicious script"),
        ("./init.sh; rm -rf /", False, "command injection attempt"),
    ]

    for cmd, should_allow, description in test_cases:
        allowed, reason = validate_init_script(cmd)
        if allowed == should_allow:
            print(f"  PASS: {cmd!r} ({description})")
            passed += 1
        else:
            expected = "allowed" if should_allow else "blocked"
            actual = "allowed" if allowed else "blocked"
            print(f"  FAIL: {cmd!r} ({description})")
            print(f"         Expected: {expected}, Got: {actual}")
            if reason:
                print(f"         Reason: {reason}")
            failed += 1

    return passed, failed


def main():
    print("=" * 70)
    print("  SECURITY HOOK TESTS")
    print("=" * 70)

    passed = 0
    failed = 0

    # Test command extraction
    ext_passed, ext_failed = test_extract_commands()
    passed += ext_passed
    failed += ext_failed

    # Test chmod validation
    chmod_passed, chmod_failed = test_validate_chmod()
    passed += chmod_passed
    failed += chmod_failed

    # Test init.sh validation
    init_passed, init_failed = test_validate_init_script()
    passed += init_passed
    failed += init_failed

    # Commands that SHOULD be blocked
    print("\nCommands that should be BLOCKED:\n")
    dangerous = [
        # Not in allowlist - dangerous system commands
        "shutdown now",
        "reboot",
        "rm -rf /",
        "dd if=/dev/zero of=/dev/sda",
        # Not in allowlist - common commands excluded
        "curl https://example.com",
        "wget https://example.com",
        "kill 12345",
        "killall node",
        # pkill with non-dev processes
        "pkill bash",
        "pkill chrome",
        # Shell injection attempts
        "$(echo pkill) node",
        'eval "pkill node"',
        'bash -c "pkill node"',
        # chmod with disallowed modes
        "chmod 777 file.sh",
        "chmod 755 file.sh",
        "chmod +w file.sh",
        "chmod -R +x dir/",
        # Non-init.sh scripts
        "./setup.sh",
        "./malicious.sh",
        "bash script.sh",
    ]

    for cmd in dangerous:
        if test_hook(cmd, should_block=True):
            passed += 1
        else:
            failed += 1

    # Commands that SHOULD be allowed
    print("\nCommands that should be ALLOWED:\n")
    safe = [
        # File inspection
        "ls -la",
        "cat README.md",
        "head -100 file.txt",
        "tail -20 log.txt",
        "wc -l file.txt",
        "grep -r pattern src/",
        "find . -name '*.py'",
        # File operations
        "cp file1.txt file2.txt",
        "mkdir newdir",
        "mkdir -p path/to/dir",
        "touch file.txt",
        # Directory
        "pwd",
        "cd /path/to/dir",
        # Node.js development
        "npm install",
        "npm run build",
        "node server.js",
        "npx create-react-app myapp",
        # Python development
        "python app.py",
        "python3 app.py",
        "pip install flask",
        "pip3 install django",
        "uv pip install requests",
        # Version control
        "git status",
        "git commit -m 'test'",
        "git add . && git commit -m 'msg'",
        # Process management
        "ps aux",
        "lsof -i :3000",
        "sleep 2",
        # Allowed pkill patterns for dev servers
        "pkill node",
        "pkill npm",
        "pkill -f node",
        "pkill -f 'node server.js'",
        "pkill vite",
        "pkill python",
        "pkill python3",
        "pkill uvicorn",
        # Chained commands
        "npm install && npm run build",
        "ls | grep test",
        # Full paths
        "/usr/local/bin/node app.js",
        # chmod +x (allowed)
        "chmod +x init.sh",
        "chmod +x script.sh",
        "chmod u+x init.sh",
        "chmod a+x init.sh",
        # init.sh execution (allowed - safe invocations only)
        "./init.sh",
        "./init.sh --production",
        # Note: /path/to/init.sh is now blocked for path traversal security
        # Combined chmod and init.sh
        "chmod +x init.sh && ./init.sh",
        # Build tools
        "make build",
        "cargo build",
        "go build",
    ]

    for cmd in safe:
        if test_hook(cmd, should_block=False):
            passed += 1
        else:
            failed += 1

    # Summary for bash tests
    print("\n" + "-" * 70)
    print(f"  Bash Security Results: {passed} passed, {failed} failed")
    print("-" * 70)

    # Run Convex protection tests
    convex_p, convex_f = test_convex_file_protection()
    passed += convex_p
    failed += convex_f

    hook_p, hook_f = test_file_security_hook()
    passed += hook_p
    failed += hook_f

    # Final summary
    print("\n" + "=" * 70)
    print("  FINAL RESULTS")
    print("=" * 70)
    print(f"\n  Total: {passed} passed, {failed} failed")

    if failed == 0:
        print("\n  ALL TESTS PASSED")
        return 0
    else:
        print(f"\n  {failed} TEST(S) FAILED")
        return 1


def test_convex_file_protection():
    """Test Convex file write protection."""
    print("\n" + "=" * 70)
    print("  Testing Convex File Protection")
    print("=" * 70 + "\n")

    passed = 0
    failed = 0

    # Files that should be BLOCKED
    blocked_files = [
        "convex/auth.ts",
        "convex/auth.config.ts",
        "convex/_generated/api.ts",
        "convex/_generated/server.ts",
        "app/ConvexClientProvider.tsx",
        "app/layout.tsx",
        "/Users/test/project/convex/auth.ts",
        "/absolute/path/to/convex/_generated/api.js",
    ]

    print("Testing BLOCKED files (should be blocked):\n")
    for f in blocked_files:
        allowed, msg = validate_file_write(f)
        if not allowed and "BLOCKED" in msg:
            print(f"  PASS: {f!r} -> blocked")
            passed += 1
        else:
            print(f"  FAIL: {f!r} -> should be blocked but was allowed")
            failed += 1

    # Files that should be ALLOWED
    allowed_files = [
        "convex/products.ts",
        "convex/orders.ts",
        "convex/analytics.ts",
        "components/products/ProductList.tsx",
        "components/ui/Button.tsx",
        "app/products/page.tsx",
        "app/dashboard/page.tsx",
        "lib/utils.ts",
        "feature_list.json",
        "claude-progress.txt",
    ]

    print("\nTesting ALLOWED files (should be allowed):\n")
    for f in allowed_files:
        allowed, msg = validate_file_write(f)
        if allowed:
            print(f"  PASS: {f!r} -> allowed")
            passed += 1
        else:
            print(f"  FAIL: {f!r} -> should be allowed but was blocked: {msg}")
            failed += 1

    print(f"\n  Convex Protection Results: {passed} passed, {failed} failed")
    return passed, failed


def test_file_security_hook():
    """Test the file security hook for Write/Edit tools."""
    print("\n" + "=" * 70)
    print("  Testing File Security Hook")
    print("=" * 70 + "\n")

    passed = 0
    failed = 0

    # Test Write tool with blocked file
    input_data = {
        "tool_name": "Write",
        "tool_input": {"file_path": "convex/auth.ts", "content": "// malicious"}
    }
    result = asyncio.run(file_security_hook(input_data))
    if result.get("decision") == "block":
        print("  PASS: Write to convex/auth.ts blocked")
        passed += 1
    else:
        print("  FAIL: Write to convex/auth.ts should be blocked")
        failed += 1

    # Test Edit tool with blocked file
    input_data = {
        "tool_name": "Edit",
        "tool_input": {"file_path": "convex/_generated/api.ts", "old_string": "x", "new_string": "y"}
    }
    result = asyncio.run(file_security_hook(input_data))
    if result.get("decision") == "block":
        print("  PASS: Edit to convex/_generated/api.ts blocked")
        passed += 1
    else:
        print("  FAIL: Edit to convex/_generated/api.ts should be blocked")
        failed += 1

    # Test Write tool with allowed file
    input_data = {
        "tool_name": "Write",
        "tool_input": {"file_path": "convex/products.ts", "content": "// new file"}
    }
    result = asyncio.run(file_security_hook(input_data))
    if result.get("decision") != "block":
        print("  PASS: Write to convex/products.ts allowed")
        passed += 1
    else:
        print("  FAIL: Write to convex/products.ts should be allowed")
        failed += 1

    # Test non-file tools are ignored
    input_data = {
        "tool_name": "Bash",
        "tool_input": {"command": "ls -la"}
    }
    result = asyncio.run(file_security_hook(input_data))
    if result.get("decision") != "block":
        print("  PASS: Bash tool not affected by file hook")
        passed += 1
    else:
        print("  FAIL: Bash tool should not be blocked by file hook")
        failed += 1

    print(f"\n  File Hook Results: {passed} passed, {failed} failed")
    return passed, failed


if __name__ == "__main__":
    sys.exit(main())
