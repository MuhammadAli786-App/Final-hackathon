# Frontend Setup & Running Guide

## Installation Steps

### 1. Navigate to Frontend Directory
```bash
cd "c:\final hakathon\frontend"
```

### 2. Install Dependencies
```bash
npm install
```

This will install:
- React 18.2
- React Router DOM 6.20
- Axios 1.6
- Recharts 2.10 (for charts)
- Date-fns 2.30 (for date formatting)
- Vite 5.0 (build tool)

### 3. Start Development Server
```bash
npm run dev
```

The application will start on **http://localhost:3000**

### 4. Backend Integration

Make sure the backend is running on **http://localhost:5000**

You should see console output like:
```
  VITE v5.0.8  ready in 234 ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

## Testing the Application

### 1. Open Login Page
Navigate to http://localhost:3000/login

### 2. Use Demo Credentials
- **Admin**: admin@clinic.com / Admin@123
- **Doctor**: doctor@clinic.com / Doctor@123  
- **Receptionist**: receptionist@clinic.com / Receptionist@123
- **Patient**: patient@clinic.com / Patient@123

### 3. Explore Features

#### Admin Dashboard
- View system statistics
- See total patients, doctors, appointments
- Check revenue and analytics
- View common diagnoses chart
- Manage patients and appointments

#### Doctor Dashboard
- View appointments
- Create prescriptions
- Use AI symptom checker
- See prescription statistics

#### Receptionist Dashboard
- Register new patients
- Schedule appointments
- Manage pending appointments
- View patient records

#### Patient Dashboard
- View personal health records
- Check appointment history
- Use symptom checker
- View medical history timeline

## Project Features

### ✅ Complete Pages
- ✅ Login & Authentication
- ✅ Role-based Dashboards (4 roles)
- ✅ Patient Management (Create, Edit, View)
- ✅ Appointment Booking & Management
- ✅ Prescription Creation
- ✅ AI Symptom Checker with Analysis
- ✅ Medical History Timeline
- ✅ Analytics with Charts
- ✅ Document Uploads
- ✅ 404 Error Page

### 📊 Dashboard Components
Each dashboard displays:
- Key statistics with icons
- Interactive charts (Line, Bar, Pie)
- Recent data tables
- Quick action buttons
- Role-specific analytics

### 🎯 Forms Included
- Patient Registration/Edit
- Appointment Scheduling
- Prescription Creation (with multiple medicines)
- Symptom Analysis
- Document Upload

## API Endpoints Used

The frontend connects to these backend endpoints:

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/signup`

### Patients
- `GET /api/patients` - List all
- `POST /api/patients` - Create
- `GET /api/patients/:id` - Get one
- `PUT /api/patients/:id` - Update
- `DELETE /api/patients/:id` - Delete

### Appointments
- `GET /api/appointments` - List with filters
- `POST /api/appointments` - Create
- `PUT /api/appointments/:id` - Update status
- `DELETE /api/appointments/:id` - Cancel

### Prescriptions
- `POST /api/prescriptions` - Create
- `GET /api/prescriptions/:id` - Get
- `GET /api/prescriptions/:id/pdf` - Download PDF
- `POST /api/prescriptions/:id/explain` - AI Explanation

### Diagnosis
- `POST /api/diagnosis/check` - AI Symptom Checker
- `GET /api/diagnosis/patient/:id` - Get history
- `GET /api/diagnosis/:id` - Get specific log

### Analytics
- `GET /api/analytics/admin` - Admin stats
- `GET /api/analytics/doctor` - Doctor stats

### File Uploads
- `POST /api/uploads/patient-document` - Upload to patient
- `POST /api/uploads/prescription-attachment` - Upload to prescription
- `DELETE /api/uploads/file` - Delete file

## Browser DevTools

Open Developer Tools to see:
- **Network Tab**: API requests/responses
- **Console**: Errors and debugging
- **Application**: Stored tokens & user data
- **React DevTools**: Component hierarchy

## Customization

### Styling
Edit CSS files in `src/styles/`:
- Colors: Look for `#667eea` (primary) and `#764ba2` (secondary)
- Fonts: Edit in `index.css`
- Components: Edit specific `*.css` files

### API URL
If backend is on different URL, update in `src/services/apiService.js`:
```javascript
const API_BASE_URL = 'http://localhost:5000/api'
// Change to your backend URL
```

### Adding New Pages
1. Create new component in `src/pages/`
2. Add route in `App.jsx`
3. Import and add to Routes

## Production Build

### Build for Production
```bash
npm run build
```

Output goes to `dist/` folder

### Preview Production Build
```bash
npm run preview
```

## Troubleshooting

### Port 3000 Already in Use
```bash
# Kill process on port 3000
npm run dev -- --port 3001
```

### API Connection Failed
- Check backend is running on port 5000
- Verify CORS is enabled in backend
- Check browser console for errors

### Token Issues
- Clear localStorage in DevTools
- Login again
- Check token format in localStorage

### Styles Not Loading
- Clear browser cache
- Restart dev server
- Check CSS file imports

## Development Tips

### Hot Reload
Changes to files automatically refresh the browser - no restart needed!

### Console Output
Check browser console (F12) for:
- API errors
- Component warnings
- Authentication issues

### Network Requests
Check Network tab in DevTools to:
- See all API calls
- Check response status
- View response data
- Debug API errors

## Next Steps After Running

1. **Test Each Role**: Login with all 4 demo accounts
2. **Create Test Data**: Add patients, appointments, prescriptions
3. **Test AI Features**: Use symptom checker
4. **Check Analytics**: View dashboard statistics
5. **Test File Uploads**: Upload documents to patient profiles

## Performance Tips

- Vite provides instant HMR (Hot Module Replacement)
- Charts render efficiently with Recharts
- API responses are cached where appropriate
- Images and large files use Cloudinary CDN

## Questions/Issues?

Refer to:
- `README.md` - Project overview
- `vite.config.js` - Build configuration
- `src/services/apiService.js` - API setup
- Backend `README.md` - API documentation

---

Happy developing! 🚀
