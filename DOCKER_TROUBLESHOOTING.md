# Docker Troubleshooting Guide

## Issue: Cannot connect to Docker daemon

### Error Message:
```
ERROR: error during connect: Head "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/_ping": 
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

### Solution: Start Docker Desktop

#### On Windows:

1. **Start Docker Desktop manually:**
   - Press `Windows Key` and search for "Docker Desktop"
   - Click on "Docker Desktop" to launch it
   - Wait for Docker Desktop to fully start (you'll see a whale icon in the system tray)

2. **Verify Docker is running:**
   ```bash
   docker info
   ```
   You should see server information, not an error.

3. **Alternative: Start via command line:**
   ```powershell
   # Try to start Docker Desktop
   Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
   ```
   
   Or if installed in a different location:
   ```powershell
   & "C:\Program Files\Docker\Docker\Docker Desktop.exe"
   ```

#### Check Docker Desktop Status:

```bash
# Check if Docker daemon is running
docker ps

# If you see an error, Docker Desktop is not running
```

### Once Docker Desktop is Running:

1. **Build the image:**
   ```bash
   docker build -t mortgage-planning-tool .
   ```

2. **Run with Docker Compose:**
   ```bash
   docker compose up -d
   ```

3. **Or run directly:**
   ```bash
   docker run -d -p 8080:80 --name mortgage-app mortgage-planning-tool
   ```

### Common Issues:

#### Issue 1: Docker Desktop won't start
- **Solution:** Restart your computer
- Check if virtualization is enabled in BIOS
- Ensure WSL 2 is installed (Windows Subsystem for Linux)

#### Issue 2: "WSL 2 installation is incomplete"
- Install WSL 2: `wsl --install`
- Restart your computer
- Start Docker Desktop again

#### Issue 3: Port already in use
- Change the port in `docker-compose.yml`:
  ```yaml
  ports:
    - "3000:80"  # Use port 3000 instead of 8080
  ```

#### Issue 4: Permission denied
- Ensure Docker Desktop is running
- Try running PowerShell/Command Prompt as Administrator

### Verify Installation:

```bash
# Check Docker version
docker --version

# Check Docker Compose version
docker compose version

# Check if Docker daemon is accessible
docker info

# List running containers
docker ps

# List all containers (including stopped)
docker ps -a
```

### Quick Test:

Once Docker Desktop is running, test with a simple command:

```bash
docker run hello-world
```

If this works, Docker is properly configured and you can proceed with building your application.

