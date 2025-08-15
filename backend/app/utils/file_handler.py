import os
import shutil
import uuid
from pathlib import Path
from typing import Optional
import re
from fastapi import UploadFile, HTTPException


class FileHandler:
    """Handles file uploads for expense attachments"""
    
    ALLOWED_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'}
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    
    def __init__(self, base_path: str = "data/attachments"):
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)
    
    def sanitize_filename(self, filename: str) -> str:
        """Sanitize filename to prevent conflicts and security issues"""
        # Remove path components and special characters
        filename = os.path.basename(filename)
        filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
        
        # Limit filename length
        name, ext = os.path.splitext(filename)
        if len(name) > 50:
            name = name[:50]
        
        return f"{name}{ext}"
    
    def generate_unique_filename(self, original_filename: str) -> str:
        """Generate a unique filename to avoid conflicts"""
        sanitized = self.sanitize_filename(original_filename)
        name, ext = os.path.splitext(sanitized)
        unique_id = str(uuid.uuid4())[:8]
        return f"{name}_{unique_id}{ext}"
    
    def validate_file(self, file: UploadFile) -> None:
        """Validate file type and size"""
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        # Check file extension
        ext = Path(file.filename).suffix.lower()
        if ext not in self.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"File type not allowed. Allowed types: {', '.join(self.ALLOWED_EXTENSIONS)}"
            )
        
        # Check file size if available
        if hasattr(file.file, 'seek') and hasattr(file.file, 'tell'):
            file.file.seek(0, 2)  # Seek to end
            size = file.file.tell()
            file.file.seek(0)  # Reset to beginning
            
            if size > self.MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail=f"File too large. Maximum size: {self.MAX_FILE_SIZE // (1024*1024)}MB"
                )
    
    async def save_file(self, file: UploadFile) -> str:
        """Save uploaded file and return relative path"""
        self.validate_file(file)
        
        # Generate unique filename
        unique_filename = self.generate_unique_filename(file.filename)
        file_path = self.base_path / unique_filename
        
        # Save file
        try:
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
        
        # Return relative path
        return os.path.join("data", "attachments", unique_filename)
    
    def delete_file(self, file_path: str) -> bool:
        """Delete a file given its relative path"""
        try:
            # Convert relative path to absolute
            full_path = Path(file_path)
            if not full_path.is_absolute():
                full_path = Path(file_path)
            
            if full_path.exists():
                full_path.unlink()
                return True
            return False
        except Exception:
            return False
    
    def get_absolute_path(self, relative_path: str) -> Optional[Path]:
        """Get absolute path from relative path"""
        try:
            full_path = Path(relative_path)
            if full_path.exists():
                return full_path
            return None
        except Exception:
            return None


# Global instance
file_handler = FileHandler()
