# SKYSOAR Report Card System
A web-based report card system for SKYSOAR International School.

## Classes
- Nursery 1, 2, 3
- Primary 1, 2, 3
- JSS1, 2, 3
- SS1, 2, 3

## Deployment
### Frontend (Netlify)
- Repository: `skysoar-report-card`
- Deployed at: `https://your-netlify-site.netlify.app`
- Build settings:
  - Branch: `main`
  - Publish directory: `frontend`

### Backend (Render)
- Repository: `skysoar-report-card`
- Deployed at: `https://your-backend.onrender.com`
- Build settings:
  - Root directory: `backend`
  - Environment: Node
  - Build command: `npm install`
  - Start command: `npm start`
- Environment variables: `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
- Import `backend/database.sql` into MySQL.