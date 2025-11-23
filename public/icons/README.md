# App Icons

This directory contains app icons for the Kannada Learning PWA.

## Required Icons

- `icon-192.png` - 192x192px icon for PWA manifest
- `icon-512.png` - 512x512px icon for PWA manifest

## Placeholder

A placeholder SVG (`icon.svg`) is provided with the Kannada letter "ಕ" (ka).
Convert this to PNG at the required sizes:

```bash
# Using ImageMagick or similar tool
convert icon.svg -resize 192x192 icon-192.png
convert icon.svg -resize 512x512 icon-512.png
```

Or use an online SVG to PNG converter.

## Design Guidelines

- Use bright, child-friendly colors
- Feature a Kannada letter or educational symbol
- Ensure good contrast for visibility
- Follow PWA icon best practices (maskable safe zone)
