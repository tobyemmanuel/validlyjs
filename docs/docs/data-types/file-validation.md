# File Validation

Comprehensive file validation including size constraints, MIME types, extensions, and image dimensions.

## Basic File Validation

ValidlyJS provides extensive file validation capabilities for handling file uploads with support for size limits, format validation, and image-specific constraints.

### Fluent API

```javascript
import { Validator, file } from 'validlyjs_2';

const validator = new Validator({
  avatar: file().required().image().max('2MB').mimeTypes(['image/jpeg', 'image/png']),
  document: file().required().extensions(['pdf', 'doc', 'docx']).max('10MB'),
  profilePicture: file().optional().image().dimensions().width(300).height(300)
});

// File object structure (from HTML input or FormData)
const result = await validator.validate({
  avatar: {
    name: 'avatar.jpg',
    size: 1048576, // 1MB in bytes
    type: 'image/jpeg'
  },
  document: {
    name: 'resume.pdf',
    size: 5242880, // 5MB in bytes
    type: 'application/pdf'
  }
});
```

### String Format

```javascript
const validator = new Validator({
  avatar: 'required|file|image|max:2048|mimes:jpeg,png',
  document: 'required|file|extensions:pdf,doc,docx|max:10240',
  profilePicture: 'file|image|dimensions:width=300,height=300'
});
```

### Array Format

```javascript
const validator = new Validator({
  avatar: ['required', 'file', 'image', 'max:2048', 'mimes:jpeg,png'],
  document: ['required', 'file', 'extensions:pdf,doc,docx', 'max:10240'],
  profilePicture: ['file', 'image', 'dimensions:width=300,height=300']
});
```

## Available File Rules

### mimeTypes(types)

Validates that the file has one of the specified MIME types.

```javascript
file().mimeTypes(['image/jpeg', 'image/png', 'image/gif'])
// String: 'file|mimes:jpeg,png,gif'
```

### extensions(extensions)

Validates that the file has one of the specified extensions.

```javascript
file().extensions(['jpg', 'png', 'pdf'])
// String: 'file|extensions:jpg,png,pdf'
```

### min(size)

Validates that the file is at least the specified size.

```javascript
file().min('100KB')
file().min(102400) // bytes
// String: 'file|min:100'
```

### max(size)

Validates that the file is at most the specified size.

```javascript
file().max('5MB')
file().max(5242880) // bytes
// String: 'file|max:5120'
```

### between(min, max)

Validates that the file size is between the specified range.

```javascript
file().between('100KB', '2MB')
file().between(102400, 2097152)
// String: 'file|between:100,2048'
```

### image()

Validates that the file is an image (JPEG, PNG, GIF, BMP, SVG, or WebP).

```javascript
file().image()
// String: 'file|image'
```

## Image Dimension Validation

For image files, you can validate specific dimensions:

### width(width)

Validates that the image has exactly the specified width.

```javascript
file().image().dimensions().width(800)
// String: 'file|image|dimensions:width=800'
```

### height(height)

Validates that the image has exactly the specified height.

```javascript
file().image().dimensions().height(600)
// String: 'file|image|dimensions:height=600'
```

### minWidth(width)

Validates that the image width is at least the specified value.

```javascript
file().image().dimensions().minWidth(200)
// String: 'file|image|dimensions:min_width=200'
```

### maxWidth(width)

Validates that the image width is at most the specified value.

```javascript
file().image().dimensions().maxWidth(1920)
// String: 'file|image|dimensions:max_width=1920'
```

### minHeight(height)

Validates that the image height is at least the specified value.

```javascript
file().image().dimensions().minHeight(150)
// String: 'file|image|dimensions:min_height=150'
```

### maxHeight(height)

Validates that the image height is at most the specified value.

```javascript
file().image().dimensions().maxHeight(1080)
// String: 'file|image|dimensions:max_height=1080'
```

## File Size Units

ValidlyJS supports various file size units for convenience:

| Unit | Description | Example |
| --- | --- | --- |
| B   | Bytes | `file().max('1024B')` |
| KB  | Kilobytes (1024 bytes) | `file().max('500KB')` |
| MB  | Megabytes (1024 KB) | `file().max('10MB')` |
| GB  | Gigabytes (1024 MB) | `file().max('2GB')` |
| Number | Bytes (numeric) | `file().max(1048576)` |

## Common Use Cases

### Profile Picture Upload

```javascript
const profileValidator = new Validator({
  profilePicture: file()
    .required()
    .image()
    .max('2MB')
    .mimeTypes(['image/jpeg', 'image/png'])
    .dimensions()
    .minWidth(150)
    .minHeight(150)
    .maxWidth(1000)
    .maxHeight(1000)
});

// Valid profile picture
await profileValidator.validate({
  profilePicture: {
    name: 'profile.jpg',
    size: 1048576, // 1MB
    type: 'image/jpeg',
    width: 500,
    height: 500
  }
}); // ✓
```

### Document Upload

```javascript
const documentValidator = new Validator({
  resume: file()
    .required()
    .extensions(['pdf', 'doc', 'docx'])
    .max('5MB'),
  coverLetter: file()
    .optional()
    .extensions(['pdf', 'txt'])
    .max('2MB'),
  portfolio: file()
    .optional()
    .extensions(['pdf', 'zip'])
    .max('20MB')
});

// Valid documents
await documentValidator.validate({
  resume: {
    name: 'john_doe_resume.pdf',
    size: 2097152, // 2MB
    type: 'application/pdf'
  },
  coverLetter: {
    name: 'cover_letter.pdf',
    size: 524288, // 512KB
    type: 'application/pdf'
  }
}); // ✓
```

### Media Gallery Upload

```javascript
const galleryValidator = new Validator({
  thumbnail: file()
    .required()
    .image()
    .max('500KB')
    .dimensions()
    .width(300)
    .height(200),
  fullImage: file()
    .required()
    .image()
    .max('10MB')
    .mimeTypes(['image/jpeg', 'image/png', 'image/webp'])
    .dimensions()
    .minWidth(800)
    .minHeight(600),
  video: file()
    .optional()
    .mimeTypes(['video/mp4', 'video/webm'])
    .max('100MB')
});

// Valid media files
await galleryValidator.validate({
  thumbnail: {
    name: 'thumb.jpg',
    size: 204800, // 200KB
    type: 'image/jpeg',
    width: 300,
    height: 200
  },
  fullImage: {
    name: 'full_image.jpg',
    size: 5242880, // 5MB
    type: 'image/jpeg',
    width: 1920,
    height: 1080
  }
}); // ✓
```

### Bulk File Upload

```javascript
const bulkValidator = new Validator({
  'files.*': file()
    .required()
    .extensions(['jpg', 'png', 'pdf', 'doc', 'docx', 'txt'])
    .max('5MB'),
  'images.*': file()
    .optional()
    .image()
    .max('2MB')
    .dimensions()
    .maxWidth(2000)
    .maxHeight(2000)
});

// Valid bulk upload
await bulkValidator.validate({
  files: [
    {
      name: 'document1.pdf',
      size: 1048576,
      type: 'application/pdf'
    },
    {
      name: 'document2.docx',
      size: 2097152,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }
  ],
  images: [
    {
      name: 'photo1.jpg',
      size: 1572864,
      type: 'image/jpeg',
      width: 1200,
      height: 800
    }
  ]
}); // ✓
```

## Working with HTML File Inputs

Here's how to integrate file validation with HTML file inputs:

### HTML Form

```html
<form id="uploadForm">
  <div>
    <label for="avatar">Profile Picture:</label>
    <input type="file" id="avatar" name="avatar" accept="image/*">
  </div>
  
  <div>
    <label for="documents">Documents:</label>
    <input type="file" id="documents" name="documents" multiple accept=".pdf,.doc,.docx">
  </div>
  
  <button type="submit">Upload Files</button>
</form>
```

### JavaScript Integration

```javascript
import { Validator, file } from 'validlyjs_2';

const validator = new Validator({
  avatar: file().required().image().max('2MB'),
  'documents.*': file().required().extensions(['pdf', 'doc', 'docx']).max('10MB')
});

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const files = {};
  
  // Process single file
  const avatarFile = formData.get('avatar');
  if (avatarFile && avatarFile.size > 0) {
    files.avatar = {
      name: avatarFile.name,
      size: avatarFile.size,
      type: avatarFile.type
    };
  }
  
  // Process multiple files
  const documentFiles = formData.getAll('documents');
  if (documentFiles.length > 0) {
    files.documents = documentFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type
    }));
  }
  
  // Validate files
  const result = await validator.validate(files);
  
  if (result.isValid) {
    console.log('Files are valid, proceeding with upload...');
    // Proceed with actual file upload
  } else {
    console.log('Validation errors:', result.errors);
    // Display errors to user
  }
});
```

## Error Messages

File validation provides clear, specific error messages:

```javascript
const validator = new Validator({
  avatar: file().required().image().max('1MB')
});

const result = await validator.validate({
  avatar: {
    name: 'large_image.jpg',
    size: 5242880, // 5MB
    type: 'image/jpeg'
  }
});

console.log(result.errors);
// {
//   avatar: ['The avatar may not be greater than 1024 kilobytes.']
// }
```

### Default Error Messages

| Rule | Default Message |
| --- | --- |
| mimeTypes | The `{field}` must be a file of type: `{types}`. |
| extensions | The `{field}` must have one of the following extensions: `{extensions}`. |
| min | The `{field}` must be at least `{min}` kilobytes. |
| max | The `{field}` may not be greater than `{max}` kilobytes. |
| between | The `{field}` must be between `{min}` and `{max}` kilobytes. |
| image | The `{field}` must be an image. |
| dimensions | The `{field}` has invalid image dimensions. |

## Performance Tips

### Client-Side Validation

Validate file size and type on the client before upload to save bandwidth.

### Optimize Images

Consider image compression before validation for better user experience.

### Progressive Validation

Validate basic properties (size, type) before more expensive checks (dimensions).

### Security First

Always validate file types on the server-side for security.
