// import { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import Header from '../components/Header'
// import { StatCard, Card, Button } from '../components/CommonComponents'
// import { analyticsService, appointmentService } from '../services/apiService'
// import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
// import '../styles/Dashboard.css'

// export default function DoctorDashboard() {
//   const [stats, setStats] = useState(null)
//   const [appointments, setAppointments] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')
//   const navigate = useNavigate()

//   useEffect(() => {
//     fetchDashboardData()
//   }, [])

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true)
//       const [statsRes, apptsRes] = await Promise.all([
//         analyticsService.getDoctorStats(),
//         appointmentService.getAll({ status: 'confirmed' })
//       ])

//       setStats(statsRes.data)
//       setAppointments(apptsRes.data.slice(0, 10))
//     } catch (err) {
//       setError('Failed to load dashboard data')
//       console.error(err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (loading) {
//     return (
//       <>
//         <Header />
//         <div className="loading">Loading dashboard...</div>
//       </>
//     )
//   }

//   return (
//     <>
//       <Header />
//       <div className="dashboard">
//         <div className="dashboard-header">
//           <h1>👨‍⚕️ Doctor Dashboard</h1>
//           <p>Your Appointments & Patients</p>
//         </div>

//         <div className="container">
//           {error && <div className="error-box">{error}</div>}

//           {/* Key Stats */}
//           <div className="stats-grid">
//             <StatCard
//               label="Today's Appointments"
//               value={stats?.dailyAppointments || 0}
//               icon="📅"
//             />
//             <StatCard
//               label="Monthly Appointments"
//               value={stats?.monthlyAppointments || 0}
//               icon="📊"
//             />
//             <StatCard
//               label="Prescriptions Created"
//               value={stats?.prescriptionCount || 0}
//               icon="💊"
//             />
//           </div>

//           {/* Charts */}
//           <div className="charts-grid">
//             <Card title="Appointments This Month">
//               <ResponsiveContainer width="100%" height={300}>
//                 <LineChart data={stats?.appointmentsByDay || []}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="day" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Line type="monotone" dataKey="count" stroke="#667eea" strokeWidth={2} />
//                 </LineChart>
//               </ResponsiveContainer>
//             </Card>

//             <Card title="Prescription Stats">
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={stats?.prescriptionsByWeek || []}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="week" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Bar dataKey="count" fill="#764ba2" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </Card>
//           </div>

//           {/* Upcoming Appointments */}
//           <Card title="Upcoming Appointments">
//             <div className="list-container">
//               <table>
//                 <thead>
//                   <tr>
//                     <th>Patient Name</th>
//                     <th>Date</th>
//                     <th>Status</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {appointments.map(appt => (
//                     <tr key={appt._id}>
//                       <td>{appt.patientId?.name || 'N/A'}</td>
//                       <td>{new Date(appt.appointmentDate).toLocaleDateString()}</td>
//                       <td>
//                         <span className={`status-badge status-${appt.status}`}>
//                           {appt.status}
//                         </span>
//                       </td>
//                       <td>
//                         <div className="action-buttons">
//                           <Button variant="primary" onClick={() => navigate(`/patients/${appt.patientId?._id}`)}>
//                             View Patient
//                           </Button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </Card>

//           {/* Quick Actions */}
//           <Card title="Quick Actions">
//             <div className="action-grid">
//               <Button variant="primary" onClick={() => navigate('/diagnosis')}>
//                 🔍 Check Symptoms
//               </Button>
//               <Button variant="primary" onClick={() => navigate('/prescriptions/new')}>
//                 💊 Prescription
//               </Button>
//             </div>
//           </Card>
//         </div>
//       </div>
//     </>
//   )
// }
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { StatCard, Card, Button } from "../components/CommonComponents";
import { analyticsService, appointmentService, patientService } from "../services/apiService";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "../styles/Dashboard.css";

export default function DoctorDashboard() {
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [patients, setPatients] = useState([]);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    // 🔐 Role Protection
    if (!user || user.role !== "doctor") {
      navigate("/login");
      return;
    }

    fetchDashboardData();
  }, []);

  // const fetchDashboardData = async () => {
  //   try {
  //     setLoading(true);

  //     // ✅ DoctorId & status filter removed, backend handles role-based filtering
  //     const [statsRes, apptsRes] = await Promise.all([
  //       analyticsService.getDoctorStats(),
  //       appointmentService.getAll(), // now fetch all appointments for this doctor
  //     ]);

  //     setStats(statsRes.data);
  //     setAppointments(apptsRes.data.slice(0, 10));
  //     const [statsRes, apptsRes, patientsRes] = await Promise.all([
  //       analyticsService.getDoctorStats(),
  //       appointmentService.getAll(),
  //       patientService.getAll(),
  //     ]);

  //     setStats(statsRes.data);
  //     setAppointments(apptsRes.data.slice(0, 10));
  //     setPatients(patientsRes.data.slice(0, 5));
  //   } catch (err) {
  //     setError("Failed to load dashboard data");
  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchDashboardData = async () => {
  try {
    setLoading(true);

    const [statsRes, apptsRes, patientsRes] = await Promise.all([
      analyticsService.getDoctorStats(),
      appointmentService.getAll(),
      patientService.getAll(),
    ]);

    setStats(statsRes.data);
    setAppointments(apptsRes.data.slice(0, 10));
    setPatients(patientsRes.data.slice(0, 5));

  } catch (err) {
    setError("Failed to load dashboard data");
    console.error(err);
  } finally {
    setLoading(false);
  }
};
  if (loading) {
    return (
      <>
        <Header />
        <div className="loading">Loading dashboard...</div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>👨‍⚕️ Doctor Dashboard</h1>
          <p>Your Appointments & Patients</p>
        </div>

        <div className="container">
          {error && <div className="error-box">{error}</div>}

          {/* Stats Section */}
          <div className="stats-grid">
            <StatCard
              label="Today's Appointments"
              value={stats?.dailyAppointments || 0}
              icon="📅"
            />
            <StatCard
              label="Monthly Appointments"
              value={stats?.monthlyAppointments || 0}
              icon="📊"
            />
            <StatCard
              label="Prescriptions Created"
              value={stats?.prescriptionCount || 0}
              icon="💊"
            />
          </div>

          {/* Charts Section */}
          <div className="charts-grid">
            <Card title="Appointments This Month">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats?.appointmentsByDay || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#667eea"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Prescription Stats">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats?.prescriptionsByWeek || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#764ba2" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
<Card title="Recent Patients">
  <div className="list-container">
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Age</th>
          <th>Contact</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {patients.length > 0 ? (
          patients.map((p) => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{p.age}</td>
              <td>{p.contact}</td>
              <td>
                <Button
                  variant="primary"
                  onClick={() => navigate(`/patients/${p._id}`)}
                >
                  View
                </Button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4">No patients yet</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</Card>

          {/* Upcoming Appointments */}
          <Card title="Upcoming Appointments">
            <div className="list-container">
              <table>
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length > 0 ? (
                    appointments.map((appt) => (
                      <tr key={appt._id}>
                        {/* Safe patient name */}
                        <td>{appt.patientId?.name || "Unknown Patient"}</td>

                        {/* Safe date */}
                        <td>
                          {appt.date
                            ? new Date(appt.date).toLocaleDateString()
                            : "N/A"}
                        </td>

                        <td>
                          <span
                            className={`status-badge status-${appt.status}`}
                          >
                            {appt.status || "N/A"}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {/* Disable button if patientId undefined */}
                            <Button
                              variant="primary"
                              disabled={!appt.patientId?._id}
                              onClick={() =>
                                navigate(`/patients/${appt.patientId?._id}`)
                              }
                            >
                              View Patient
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center" }}>
                        No upcoming appointments
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card title="Quick Actions">
            <div className="action-grid">
              <Button variant="primary" onClick={() => navigate("/diagnosis")}>
                🔍 Check Symptoms
              </Button>

              {/* Plan-based lock */}
              {user?.plan !== "free" && (
                <Button
                  variant="primary"
                  onClick={() => navigate("/prescriptions/new")}
                >
                  💊 Prescription
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
