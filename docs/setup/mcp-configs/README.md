# MCP Configuration Backups

This directory contains alternative MCP configuration files for different environments.

## Files

- **`.mcp.json.example`** - Template configuration with placeholder values for new setup
- **`.mcp.json.wsl`** - Configuration optimized for WSL (Windows Subsystem for Linux) with Unix-style paths
- **`.mcp.json.windows`** - Configuration for native Windows environment with Windows-style paths
- **`.mcp.json.optimized`** - Experimental configuration with alternative server setup

## Active Configuration

The active MCP configuration is located at the project root: `/weavelight/.mcp.json`

Claude Code only reads `.mcp.json` from the project root. These backup files are for reference and environment-specific setups.

## Usage

To switch configurations:

```bash
# Backup current config
cp .mcp.json .mcp.json.backup

# Copy desired config to root
cp docs/setup/mcp-configs/.mcp.json.wsl .mcp.json

# Restart Claude Code to apply changes
```

## Environment Variables Required

All configurations require these environment variables:

- `CONTEXT7_API_KEY` - Get from https://console.upstash.com/
- `GITHUB_PERSONAL_ACCESS_TOKEN` - Get from https://github.com/settings/tokens
- `NOTION_API_KEY` - Get from https://www.notion.so/my-integrations (optional)
- `BROWSERSTACK_USERNAME` - From BrowserStack account (optional)
- `BROWSERSTACK_ACCESS_KEY` - From BrowserStack account (optional)

See `docs/setup/mcp-setup-guide.md` for full setup instructions.
