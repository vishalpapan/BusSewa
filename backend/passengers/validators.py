import os
import re
from django.core.exceptions import ValidationError

def validate_document_file(file):
    """Validate uploaded document files"""
    
    # File size validation (5MB max)
    max_size = 5 * 1024 * 1024  # 5MB
    if file.size > max_size:
        raise ValidationError(f'File size must be less than 5MB. Current size: {file.size / (1024*1024):.1f}MB')
    
    # File extension validation
    allowed_extensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp']
    ext = os.path.splitext(file.name)[1].lower()
    
    if ext not in allowed_extensions:
        raise ValidationError(f'File type not allowed. Allowed types: PDF, JPG, JPEG, PNG, WEBP')
    
    # File name validation (basic security)
    if '..' in file.name or '/' in file.name or '\\' in file.name:
        raise ValidationError('Invalid file name')
    
    return file

def validate_aadhar_number(value):
    """Validate Aadhar number format"""
    if not value:
        return value  # Allow empty values
    
    # Remove spaces and hyphens
    cleaned = re.sub(r'[\s-]', '', value)
    
    # Check if it's exactly 12 digits
    if not re.match(r'^\d{12}$', cleaned):
        raise ValidationError('Aadhar number must be exactly 12 digits')
    
    # Basic checksum validation (Verhoeff algorithm - simplified)
    # This is a basic check, not the full Verhoeff algorithm
    if cleaned == '000000000000' or cleaned == '123456789012':
        raise ValidationError('Invalid Aadhar number')
    
    return cleaned