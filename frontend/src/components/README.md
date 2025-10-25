# Reusable Form Components

This directory contains reusable form components that provide consistent styling and behavior across the application.

## Components

### Input
A customizable input component with support for start and end icons, and clickable end buttons.

```tsx
import { Input } from '../components';

<Input
  type="text"
  placeholder="Enter your name"
  startIcon={<UserIcon />}
  endButton={<ActionButton />}
  error={hasError}
/>
```

**Props:**
- `startIcon?: ReactNode` - Icon displayed at the start of the input (non-clickable)
- `endIcon?: ReactNode` - Icon displayed at the end of the input (non-clickable)
- `endButton?: ReactNode` - Clickable element displayed at the end of the input
- `error?: boolean` - Shows error styling
- `fullWidth?: boolean` - Makes input full width (default: true)
- All standard HTML input props

### Select
A customizable select component with support for start and end icons.

```tsx
import { Select } from '../components';

<Select
  startIcon={<RoleIcon />}
  error={hasError}
  options={[
    { value: 'admin', label: 'Administrator' },
    { value: 'user', label: 'User' }
  ]}
/>
```

**Props:**
- `startIcon?: ReactNode` - Icon displayed at the start of the select
- `endIcon?: ReactNode` - Icon displayed at the end of the select
- `error?: boolean` - Shows error styling
- `fullWidth?: boolean` - Makes select full width (default: true)
- `options?: Array<{value, label, disabled?}>` - Options for the select
- All standard HTML select props

### PasswordInput
A specialized input for passwords with show/hide toggle button that follows the same design system.

```tsx
import { PasswordInput } from '../components';

<PasswordInput
  placeholder="Enter password"
  startIcon={<LockIcon />}
  error={hasError}
/>
```

**Props:**
- `showToggle?: boolean` - Whether to show the toggle button (default: true)
- All Input props except `type`, `endIcon`, and `endButton` (handled internally)
- The toggle button is styled consistently with the design system and positioned correctly

### FormField
A wrapper component for form fields that includes label, input, and error messages.

```tsx
import { FormField, Input } from '../components';

<FormField
  label="Email Address"
  required
  error={errors.email}
  helpText="We'll never share your email"
>
  <Input
    type="email"
    value={email}
    onChange={handleChange}
    startIcon={<EmailIcon />}
  />
</FormField>
```

**Props:**
- `label?: string` - Field label
- `required?: boolean` - Shows required asterisk
- `error?: string` - Error message to display
- `helpText?: string` - Help text shown when no error
- `className?: string` - Additional CSS classes
- `children: ReactNode` - The form input component

## Usage Example

```tsx
import React, { useState } from 'react';
import { FormField, Input, Select, PasswordInput, Button } from '../components';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: ''
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        label="Email"
        required
        error={errors.email}
      >
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          startIcon={<EmailIcon />}
          error={!!errors.email}
        />
      </FormField>

      <FormField
        label="Password"
        required
        error={errors.password}
      >
        <PasswordInput
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          startIcon={<LockIcon />}
          error={!!errors.password}
        />
      </FormField>

      <FormField
        label="Role"
        error={errors.role}
      >
        <Select
          value={formData.role}
          onChange={(e) => setFormData({...formData, role: e.target.value})}
          startIcon={<RoleIcon />}
          options={[
            { value: 'admin', label: 'Administrator' },
            { value: 'user', label: 'User' }
          ]}
          error={!!errors.role}
        />
      </FormField>

      <Button type="submit" variant="primary">
        Login
      </Button>
    </form>
  );
};
```

## Styling

All components use Tailwind CSS classes and follow the application's design system:
- Consistent border radius, padding, and colors
- Focus states with blue ring
- Error states with red styling
- Smooth transitions
- Responsive design

## Accessibility

Components include proper ARIA attributes and keyboard navigation support.