# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.3.0] - 2025-10-24

### Added
- **File view modes**: Support for both list and grid views for file browsing
- **View mode toggle**: UI buttons to switch between list and grid display modes
- **Default file view configuration**: System-wide setting for preferred file view mode
- **Responsive grid layout**: Card-based grid view with icons and metadata for files and folders
- **View mode persistence**: User preference saved and loaded from configuration
- **Enhanced FileList component**: Dual rendering modes (list table and grid cards)
- **File view configuration API**: Backend support for default file view settings

### Changed
- **FileBrowser component**: Added view mode state management and toggle controls
- **FileList component**: Refactored to support both list and grid rendering modes
- **Database initialization**: Added default file view mode configuration seeding
- **API responses**: File upload config endpoint now includes default file view setting
- **Frontend hooks**: useFileBrowser hook now manages view mode preferences

### UI/UX
- **View toggle buttons**: Intuitive list/grid toggle in file browser toolbar
- **Grid view cards**: Visual cards showing file/folder icons, names, sizes, and dates
- **List view table**: Traditional table layout with columns for file information
- **Consistent styling**: Both views maintain design consistency with Tailwind CSS

### Technical Details
- **Configuration system**: Extended with `default_file_view` setting (values: 'list' or 'grid')
- **TypeScript interfaces**: Updated FileUploadConfig to include defaultFileView property
- **State management**: View mode synchronized between local state and system configuration
- **Component architecture**: Modular FileList component with conditional rendering

## [4.2.0] - 2025-10-24

### Added
- **Enhanced file upload validation**: Added blocked file extensions checking alongside MIME type validation
- **Guitar Pro file support**: Added `application/x-guitar-pro` MIME type for .gp files
- **Configuration management panel**: New frontend component for managing system configurations
- **File moving functionality**: Ability to move files between virtual folders with drag-and-drop support
- **MoveFilesModal component**: Modal dialog for selecting destination folder when moving files
- **Configuration hooks**: `useConfiguration` hook for managing system settings
- **File move hooks**: `useFileMove` hook for handling file relocation operations
- **Configuration page**: New admin page for system configuration management

### Changed
- **FileService validation**: Enhanced `isFileTypeAllowed()` method to check both MIME types and blocked extensions
- **Database initialization**: Added default configurations for `allowed_file_types` and `blocked_file_extensions`
- **File upload endpoint**: Updated `/api/files/upload/config` to return blocked extensions information
- **Frontend file upload**: Improved validation feedback showing specific blocked extensions

### Security
- **File extension blocking**: Prevents upload of executable and script files (.exe, .bat, .cmd, .py, etc.)
- **Enhanced validation**: Two-layer validation combining MIME type allowlists with extension blocklists

### Fixed
- **File type validation**: Resolved issue where .py files could be uploaded despite text/* allowlist
- **Configuration persistence**: Ensured blocked file extensions are properly seeded in database

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