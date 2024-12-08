# Fallout Shelter Save Editor

A browser-based save file editor for *Fallout Shelter*. This web app allows users to modify their game saves directly from the browser, with no downloads required. Hosted on GitHub Pages, it provides an easy way to edit vault data, dweller attributes, and more, all online.

## Features

- Modify vault resources (caps, food, water, power, etc.).
- Edit dweller stats (health, happiness, strength, etc.).
- Unlock items and outfits.
- Change room layouts and capacities.
- Full compatibility with *Fallout Shelter* save files from multiple platforms.

## Requirements

- **Web Browser**: Any modern web browser (Chrome, Firefox, Safari, Edge, etc.).
- **Save File**: A compatible *Fallout Shelter* save file (Android, iOS, or PC).
  - Android: Save files can be extracted via ADB or from the device's storage.
  - iOS: Use iTunes or access files on a jailbroken device.
  - PC: Located in `:Users/<username>/AppData/Fallout Shelter/files`.

## Usage

### Step 1: Open the Web App

Navigate to the web app hosted on GitHub Pages:
[https://kaotickj.github.io/fallout-shelter-save-editor](https://kaotickj.github.io/fallout-shelter-save-editor)

### Step 2: Upload Your Save File

1. Click on the "Upload Save" button.
2. Select the save file from your device:
   - **Android/iOS**: Extract the save file using the appropriate method (ADB for Android, iTunes for iOS).
   - **PC**: Find your save file in `:Users/<username>/AppData/Fallout Shelter/files`.

### Step 3: Edit Your Save File

Once the save file is loaded into the app:
- **Vault Resources**: Adjust the amount of caps, food, water, and power.
- **Dwellers**: Modify dweller stats such as health, happiness, and strength.
- **Rooms**: Change or unlock various room types, or adjust room capacities.
- **Items**: Unlock items and outfits for your dwellers.

### Step 4: Save Your Changes

After making changes:
- Click the "Save" button to download the modified save file.
- Overwrite your original file or create a backup before applying it in the game.

### Step 5: Load the Edited Save File in Your Game

- **Android/iOS**: Transfer the modified save file back to your device using the reverse method you used to extract it.
- **PC**: Place the file back in `:Users/<username>/AppData/Fallout Shelter/files`.

## Limitations

- The web app currently supports basic save file modifications and may not cover every advanced feature of *Fallout Shelter*.
- Due to browser limitations, certain file types or sizes may not be supported for upload.

## Contributing

Contributions are welcome! If you'd like to add features or report bugs, please submit issues or pull requests via GitHub.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
