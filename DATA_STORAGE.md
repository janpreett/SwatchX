# SwatchX Data Storage

## Database Location

SwatchX uses SQLite database with intelligent location detection:

### Development Mode
- **Location**: `./backend/data/swatchx.db`
- **Purpose**: Easy access during development

### Production/Executable Mode
- **Windows**: `%APPDATA%\SwatchX\swatchx.db`
  - Example: `C:\Users\YourName\AppData\Roaming\SwatchX\swatchx.db`
- **Linux/Mac**: `~/.swatchx/swatchx.db`
  - Example: `/home/username/.swatchx/swatchx.db`

## Why This Approach?

1. **User Data Safety**: Data is stored in user's application data directory
2. **Permissions**: User always has write access to their own AppData folder
3. **Portability**: Exe can be moved anywhere, data stays with the user
4. **Standard Practice**: Follows OS conventions for application data

## Packaging for Distribution

When packaging with PyInstaller:

```bash
pyinstaller --onefile --windowed main.py
```

The database will automatically be created in the appropriate user directory on first run.

## Data Backup

Users can backup their data by copying the entire SwatchX folder:
- **Windows**: Copy `%APPDATA%\SwatchX\` folder
- **Linux/Mac**: Copy `~/.swatchx/` folder
