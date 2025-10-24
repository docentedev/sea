# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2025-10-24

### Added
- FileList component for table-style file and folder display
- Custom hooks for better code organization:
  - `useFileBrowser` - File navigation and content loading
  - `useFileUpload` - File upload functionality with drag-and-drop
  - `useFolderOperations` - Folder creation and deletion operations
- Modal components for better user interactions:
  - CreateFolderModal
  - UploadModal
  - DeleteModal
- Enhanced breadcrumb navigation with icons and improved styling

### Changed
- Refactored FileBrowser component from monolithic 704-line component to modular structure
- Improved file browser user experience with better visual feedback
- Enhanced folder view refresh after creating virtual directories
- Better separation of concerns with custom hooks and smaller components

### Fixed
- Folder view not updating after creating new directories
- Improved component reusability and maintainability

## [2.1.1] - 2025-10-23

### Added
- Complete Tailwind CSS integration across all frontend components
- Consistent styling system using utility-first CSS approach

### Changed
- Converted all inline styles to Tailwind CSS classes in React components
- Simplified index.css to contain only Tailwind directives
- Improved maintainability and consistency of frontend styling

### Removed
- Unused App.css file with default Vite styles
- All inline style attributes from React components

### Fixed
- Frontend styling consistency across all pages and components

## [2.1.0] - 2025-10-23

### Added
- Complete authentication system with JWT tokens
- User management with role-based access control (admin/user/guest)
- Admin-protected CRUD operations for user management
- External configuration system (nas-cloud-config.json)
- SQLite database with user and role management
- Fastify middleware for authentication and authorization
- Clean architecture with services and repositories layers

### Changed
- Enhanced security with JWT-based authentication
- Improved project structure with proper separation of concerns

### Fixed
- Resolved TypeScript compilation errors
- Fixed role service dependencies and method implementations

## [2.0.0] - 2025-10-23

### Added
- Initial release of NAS Cloud server
- Single Executable Application (SEA) support
- React 19 frontend with Wouter routing
- Basic health monitoring endpoints
- SQLite database integration
- TypeScript configuration
- Vite build system for frontend

### Changed
- Migrated from basic Node.js server to Fastify framework
- Implemented proper project structure with TypeScript

### Technical Details
- Node.js v23.10.0 with experimental SQLite features
- Fastify web framework
- React 19 with functional components
- SQLite embedded database
- SEA (Single Executable Application) for distribution</content>
<parameter name="filePath">/Users/jonyproduccion/src/personales/cloudDos/sea-test/CHANGELOG.md