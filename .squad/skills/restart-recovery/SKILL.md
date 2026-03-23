---
name: restart-recovery
description: "Snapshot and restore full dev environment after machine restart. Captures running services, agency sessions, backlog state, and auto-recovers on login. Use when: about to restart, recovering from restart, setting up auto-recovery."
domain: "workflow-recovery"
confidence: "high"
source: "manual"
tools:
  - name: "powershell"
    description: "Execute recovery scripts and register Task Scheduler"
    when: "Always — scripts are OS-level"
---

# Restart Recovery

## When to Use

- You're about to restart/reboot the machine and want to preserve state
- The machine just rebooted and you need everything back
- You want auto-recovery on login (Task Scheduler / systemd / launchd)

## When Not to Use

- Session was closed normally (use session-recovery plugin instead)
- Looking for git history (use `git log`)
- Only need to find a past session (use session-recovery plugin)

## How It Works

Three phases: **Snapshot** → **Recovery** → **Auto-trigger**

### Phase 1: Snapshot (Before Restart)

Create `.squad/restart-snapshot.json` capturing:

```json
{
  "timestamp": "2026-03-17T18:00:00Z",
  "services": [
    { "name": "Squad Monitor", "status": "running" },
    { "name": "Ralph Watch", "status": "running" },
    { "name": "Dashboard UI", "status": "running" },
    { "name": "CLI Tunnel Hub", "status": "running" }
  ],
  "agency_sessions": [
    {
      "id": "128c9345-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "name": "RP/Aspire Research",
      "cwd": ".",
      "status": "running"
    }
  ],
  "ralph_status": {
    "rounds_completed": 3,
    "issues_processed": ["#778", "#800"],
    "rate_limited": true,
    "next_items": ["#763", "#795"]
  },
  "pending_git": {
    "uncommitted_changes": false,
    "unpushed_commits": 2
  }
}
```

**How to create the snapshot:**
1. Scan running processes for known services (Squad Monitor, Ralph Watch, Dashboard UI, CLI Tunnel Hub)
2. Query session_store for active agency sessions in the current working directory
3. Capture Ralph state (rounds, issues, rate limit status)
4. Check git status for uncommitted/unpushed work
5. Write to `.squad/restart-snapshot.json`

### Phase 2: Recovery (After Restart)

Run `scripts/recover-from-restart.ps1` (Windows) or `scripts/recover-from-restart.sh` (Linux/Mac).

The script:
1. Reads `.squad/restart-snapshot.json`
2. Validates all inputs (path traversal protection, UUID format checks)
3. Launches services via an **allowlist** (only known service names accepted)
4. Resumes agency sessions with validated session IDs
5. Prints a recovery summary

**Manual recovery (in Copilot CLI):**
```
recover from restart
```
Or:
```
agency copilot --yolo --agent squad -p "recover from restart - read .squad/restart-snapshot.json and restore everything"
```

### Phase 3: Auto-trigger (Optional)

**Windows (Task Scheduler):**
```powershell
$action = New-ScheduledTaskAction -Execute "pwsh.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$PWD\scripts\recover-from-restart.ps1`""
$trigger = New-ScheduledTaskTrigger -AtLogOn
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName "Squad-RecoverFromRestart" -Action $action -Trigger $trigger -Settings $settings -Description "Auto-recover Squad services after restart"
```

**Linux (systemd user service):**
```ini
# ~/.config/systemd/user/squad-recover.service
[Unit]
Description=Squad Restart Recovery
After=network.target

[Service]
Type=oneshot
ExecStart=/bin/bash /path/to/repo/scripts/recover-from-restart.sh
WorkingDirectory=/path/to/repo

[Install]
WantedBy=default.target
```

Then: `systemctl --user enable squad-recover.service`

**macOS (launchd):**
```xml
<!-- ~/Library/LaunchAgents/com.squad.recover.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.squad.recover</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/path/to/repo/scripts/recover-from-restart.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
```

Then: `launchctl load ~/Library/LaunchAgents/com.squad.recover.plist`

## Security

- **Allowlist-only service launching** — only known service names trigger pre-defined commands
- **Path validation** — all paths checked against repo root (no directory traversal)
- **UUID format validation** — session IDs must match strict UUID v4 pattern
- **No shell injection** — snapshot fields are never interpolated into shell commands

## Scripts Reference

| Script | Platform | Purpose |
|--------|----------|---------|
| `scripts/recover-from-restart.ps1` | Windows | Full recovery with validation |
| `scripts/recover-from-restart.sh` | Linux/Mac | Full recovery with validation |

## Related

- **session-recovery** plugin — for finding and resuming individual past sessions
- This plugin handles full environment restore (multiple services + sessions + state)
