# OpenClaw — VPS Setup Guide

**Account:** admin@bizelevate.au | **Server:** Hostinger KVM 1, Ubuntu 24.04 LTS | **Agent User:** clawd
**Last Updated:** 2026-04-30

> This page is for rebuilding the VPS from scratch. For daily operations and agent workflows, see **OpenClaw — Agent Workflows**.

---

## Step 1 — Provision VPS — DONE

- Platform: Hostinger KVM 1, Ubuntu 24.04 LTS, 12 months
- Root password: saved to Norton Password Manager

## Step 2 — Create Telegram Bot — DONE

- Bot: @BizElvateBot
- Created via @BotFather
- Token saved to Norton Password Manager

## Step 3 — Initial Server Setup — DONE

```bash
adduser clawd
usermod -aG sudo clawd
ufw allow OpenSSH
ufw enable
```

## Step 4 — Install OpenClaw — DONE

```bash
curl -sSL https://openclaw.dev/install.sh | bash
```

OpenClaw installs to `~/.npm-global/bin/` — not in PATH by default. Fix:

```bash
export PATH="$HOME/.npm-global/bin:$PATH"
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

Config and workspace locations:

- Config: `~/.openclaw/openclaw.json`
- Workspace: `~/.openclaw/workspace`
- Sessions: `~/.openclaw/agents/main/sessions`

## Step 5 — Configure OpenClaw — DONE

```bash
openclaw configure
```

Wizard choices made:

- Gateway: Local (this machine), port 18789
- Model: openai/gpt-4o-mini
- Web search: Gemini (Google Search) — API key stored
- web_fetch: Yes (keyless HTTP fetch enabled)
- Telegram: configured with @BizElvateBot token
- Skills: all skipped for now (see Agent Workflows page)
- Hooks: skipped

> To paste in the configure wizard: use right-click, not Ctrl+V.

## Step 6 — Start Gateway — DONE

```bash
screen -S openclaw
openclaw gateway
```

## Step 7 — Telegram Pairing — DONE

First `/start` showed pairing code. Approved via:

```bash
openclaw pairing approve telegram <CODE>
```

Pairing is one-time per Telegram user.

---

## Appendix: PATH Fix

If `openclaw` is not found after re-login:

```bash
export PATH="$HOME/.npm-global/bin:$PATH"
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

---

## Appendix: Systemd Service (Not Available on This VPS)

Systemd user services are unavailable on the current Hostinger KVM VPS. Use `screen` for persistence (see Agent Workflows page).

If you move to a VPS that supports systemd:

```
[Unit]
Description=OpenClaw Gateway
After=network.target

[Service]
User=clawd
ExecStart=/usr/local/bin/openclaw gateway
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable openclaw
sudo systemctl start openclaw
sudo systemctl status openclaw
```
