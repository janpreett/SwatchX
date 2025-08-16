# 🚛 SwatchX - Fleet Expense Management System

A comprehensive web application for managing fleet expenses, service providers, trucks, trailers, and fuel stations with robust data integrity and user management.

## ✨ Features

### 🔐 Authentication & Security
- **User Registration & Login**: Secure JWT-based authentication
- **Security Questions**: Password reset via security questions
- **Profile Management**: Update display name and change password
- **Account Deletion**: Safe account removal with company data preservation

### 💰 Expense Management
- **Multiple Categories**: Truck, trailer, fuel, and general expenses
- **File Attachments**: Support for expense receipts and documents
- **Company Separation**: Swatch and SWS company support
- **Export Functionality**: CSV export for expense reports

### 🏢 Management Entities
- **Service Providers**: Unique names with no duplicates
- **Trucks**: Unique truck numbers with no duplicates
- **Trailers**: Unique trailer numbers with no duplicates
- **Fuel Stations**: Unique names with no duplicates

### 📱 User Experience
- **Responsive Design**: Mobile and desktop optimized
- **Real-time Search**: Find existing entries quickly
- **Bulk Operations**: Select and manage multiple items
- **Error Handling**: Clear feedback for all operations

## 🏗️ Architecture

### Backend (FastAPI + SQLAlchemy)
- **Python 3.8+**: Modern async web framework
- **SQLite Database**: Lightweight, file-based storage
- **Unique Constraints**: Database-level duplicate prevention
- **RESTful API**: Clean, consistent endpoints

### Frontend (React + Mantine)
- **TypeScript**: Type-safe development
- **Mantine UI**: Beautiful, accessible components
- **React Router**: Client-side navigation
- **Context API**: Global state management

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PowerShell (Windows)

### Installation
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SwatchX
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Start the application**
   ```bash
   # From root directory
   .\start.ps1
   ```

## 📊 Database Schema

### Core Tables
- **users**: Authentication and profile data
- **expenses**: Main expense records with categories
- **service_providers**: Service provider management
- **trucks**: Truck fleet tracking
- **trailers**: Trailer fleet tracking
- **fuel_stations**: Fuel station information

### Key Relationships
- Expenses reference service providers, trucks, trailers, and fuel stations
- All management entities have unique constraints
- User deletion preserves company data integrity

## 🔧 API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User authentication
- `GET /auth/me` - Get current user
- `PUT /auth/profile` - Update profile
- `DELETE /auth/account` - Delete account

### Expenses
- `GET /expenses/` - List expenses with filtering
- `POST /expenses/` - Create new expense
- `PUT /expenses/{id}` - Update expense
- `DELETE /expenses/{id}` - Delete expense

### Management Entities
- `GET /service-providers/` - List service providers
- `POST /service-providers/` - Create service provider
- `PUT /service-providers/{id}` - Update service provider
- `DELETE /service-providers/{id}` - Delete service provider

## 🎯 Data Integrity Features

### Unique Constraints
- **Service Providers**: No duplicate names allowed
- **Trucks**: No duplicate numbers allowed
- **Trailers**: No duplicate numbers allowed
- **Fuel Stations**: No duplicate names allowed

### Business Logic
- **Referential Integrity**: Cannot delete entities used by expenses
- **Data Preservation**: Company data maintained during user management
- **Automatic Cleanup**: Duplicate prevention at database level

## 🛡️ Security Features

### Password Security
- **Bcrypt Hashing**: Secure password storage
- **Complexity Requirements**: Strong password validation
- **Security Questions**: Account recovery system

### Data Protection
- **JWT Tokens**: Secure authentication
- **User Isolation**: Proper data separation
- **Input Validation**: XSS and injection prevention

## 📱 User Interface

### Management Pages
- **Service Providers**: Add, edit, delete, and search
- **Trucks**: Fleet management with unique numbers
- **Trailers**: Trailer tracking and management
- **Fuel Stations**: Fuel station database

### Expense Management
- **Form-based Entry**: Category-specific input fields
- **File Uploads**: Receipt and document attachments
- **Bulk Operations**: Efficient data management
- **Export Tools**: Data analysis and reporting

## 📄 License

This project is proprietary software. All rights reserved.

---

**SwatchX** - Professional fleet expense management for modern businesses.
