# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a digital book project showcasing the 65-year history of the Caisse Nationale de Retraites et d'Assurances (CNRA) in Morocco. It's an interactive HTML-based digital book with flip-book functionality using the StPageFlip library.

## Key Components

- **cnra_livre_enrichi.md**: Complete content source in French Markdown format, containing the full historical narrative from 1959-2024
- **livre_digital_cnra_stpageflip.html**: Main interactive HTML book implementation with responsive design
- **01.jpg**: Cover image (CNRA logo)
- **FilmInstitutionnel.mp4**: Institutional video content embedded in the book

## Technical Architecture

### HTML Structure
The main book is built using StPageFlip library for realistic page-turning effects. It includes:
- Interactive page navigation with clickable table of contents
- Dual reading modes: book flip mode and portrait scroll mode
- Draggable progress indicator with zoom controls
- Video integration with fallback support
- Responsive design for mobile and desktop

### CSS Architecture
Uses CSS custom properties (variables) for institutional branding:
- Primary color: `#323e48` (CDG institutional blue)
- Secondary color: `#638c1c` (accent green)
- Tertiary color: `#d8e0e5` (light grey)
- Typography: Poppins font family throughout

### JavaScript Features
- StPageFlip integration for book functionality
- Progress tracking and page navigation
- Video management (pause on page turn)
- Drag-and-drop progress indicator
- Responsive zoom controls
- Mode switching (book/portrait)

## Content Structure

The content follows a chronological narrative structure:
1. **Préambule** - Introduction with institutional video
2. **Historical periods** - Organized by major development phases (1959-1976, 1977-1997, etc.)
3. **Mission & Vision** - Institutional values and strategic direction
4. **Modern developments** - Digital transformation and recent programs
5. **Future outlook** - CAP 2030 strategic plan

## Media Integration

- **Videos**: MP4 format with HTML5 video controls and fallback messaging
- **Images**: Placeholder system with descriptive text for missing assets
- **Timeline components**: CSS-styled chronological displays
- **Infographic placeholders**: Descriptive text for complex data visualizations

## Development Guidelines

### Adding Content
- New pages should follow the existing `.page` structure
- Maintain consistent typography hierarchy (h1, h2, h3)
- Use timeline components for chronological content
- Include media placeholders with descriptive alt text

### Styling
- Follow the established CSS variable system
- Maintain responsive design principles
- Use institutional color palette consistently
- Ensure accessibility with proper ARIA labels

### Testing
- Verify page-flip functionality across browsers
- Test video playback and fallback behavior
- Validate responsive design on mobile devices
- Check accessibility features (keyboard navigation, screen readers)

## Browser Compatibility

Designed for modern browsers supporting:
- HTML5 video
- CSS Grid and Flexbox
- ES6 JavaScript features
- Touch events for mobile interaction

## Performance Considerations

- Uses CDN for StPageFlip library
- Video preload set to "metadata" for faster initial load
- Progressive image loading with fallbacks
- Optimized CSS animations for smooth interactions