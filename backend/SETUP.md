# Car Showroom Backend Setup

## Initial Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Update the environment variables as needed

3. **Create Admin Account**
   ```bash
   npm run create-admin
   ```

4. **Start the Server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Admin Login Credentials

- **Email:** admin@carshowroom.com
- **Password:** CarShowroom2024@AdminSecurePass (or check your .env file)

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm run create-admin` - Create the permanent admin account
- `npm test` - Run tests (placeholder)

## Database Structure

The application uses MongoDB with the following collections:
- **Users** - Admin and user accounts
- **Brands** - Car brands
- **Cars** - Car inventory
- **Banners** - Homepage banners
- **Rentals** - Available rental cars

## Admin Dashboard

Access the admin dashboard at: http://localhost:5174 (or your configured ADMIN_URL)