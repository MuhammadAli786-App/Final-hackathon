// import { useState, useEffect } from 'react'
// import { useNavigate, useParams } from 'react-router-dom'
// import Header from '../components/Header'
// import { Card, Button } from '../components/CommonComponents'
// import { patientService, appointmentService } from '../services/apiService'
// import '../styles/Dashboard.css'

// export default function PatientProfile() {
//   const { id } = useParams()
//   const navigate = useNavigate()
//   const [patient, setPatient] = useState(null)
//   const [appointments, setAppointments] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')

//   useEffect(() => {
//     fetchPatientData()
//   }, [id])

//   const fetchPatientData = async () => {
//     try {
//       setLoading(true)
//       const [patRes, appRes] = await Promise.all([
//         patientService.getById(id),
//         appointmentService.getAll({ patientId: id })
//       ])

//       setPatient(patRes.data)
//       setAppointments(appRes.data)
//     } catch (err) {
//       setError('Failed to load patient data')
//       console.error(err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (loading) {
//     return (
//       <>
//         <Header />
//         <div className="loading">Loading patient profile...</div>
//       </>
//     )
//   }

//   if (!patient) {
//     return (
//       <>
//         <Header />
//         <div className="container" style={{ paddingTop: '40px' }}>
//           <Card>
//             <p>Patient not found</p>
//             <Button onClick={() => navigate(-1)}>Go Back</Button>
//           </Card>
//         </div>
//       </>
//     )
//   }

//   return (
//     <>
//       <Header />
//       <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
//         {error && <div className="error-box">{error}</div>}

//         {/* Patient Overview */}
//         <Card title="Patient Information">
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
//             <div>
//               <p><strong>Name:</strong> {patient.name}</p>
//               <p><strong>Age:</strong> {patient.age} years</p>
//               <p><strong>Gender:</strong> {patient.gender}</p>
//             </div>
//             <div>
//               <p><strong>Contact:</strong> {patient.contact}</p>
//               <p><strong>Registered:</strong> {new Date(patient.createdAt).toLocaleDateString()}</p>
//             </div>
//           </div>

//           {patient.medicalHistory && (
//             <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
//               <strong>Medical History:</strong>
//               <p style={{ marginTop: '8px', color: '#555' }}>{patient.medicalHistory}</p>
//             </div>
//           )}

//           <div style={{ display: 'flex', gap: '10px' }}>
//             <Button variant="primary" onClick={() => navigate(`/patients/edit/${id}`)}>
//               Edit Profile
//             </Button>
//             <Button variant="primary" onClick={() => navigate(`/appointments/new?patientId=${id}`)}>
//               Schedule Appointment
//             </Button>
//             <Button variant="primary" onClick={() => navigate(`/history/${id}`)}>
//               Medical History
//             </Button>
//           </div>
//         </Card>

//         {/* Documents */}
//         {patient.documents && patient.documents.length > 0 && (
//           <Card title="Attached Documents">
//             <div className="field-list">
//               {patient.documents.map((doc, idx) => (
//                 <div key={idx} className="field-list-item">
//                   <span>📄 {doc.fileName}</span>
//                   <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>
//                     Download
//                   </a>
//                 </div>
//               ))}
//             </div>
//           </Card>
//         )}

//         {/* Appointments */}
//         <Card title="Appointment History">
//           {appointments.length > 0 ? (
//             <div className="list-container">
//               <table>
//                 <thead>
//                   <tr>
//                     <th>Date</th>
//                     <th>Doctor</th>
//                     <th>Status</th>
//                     <th>Reason</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {appointments.map(appt => (
//                     <tr key={appt._id}>
//                       <td>{new Date(appt.appointmentDate).toLocaleDateString()}</td>
//                       <td>{appt.doctorId?.name || 'TBD'}</td>
//                       <td>
//                         <span className={`status-badge status-${appt.status}`}>
//                           {appt.status}
//                         </span>
//                       </td>
//                       <td>{appt.reason || '-'}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           ) : (
//             <p>No appointments recorded yet.</p>
//           )}
//         </Card>
//       </div>
//     </>
//   )
// }




// 1️⃣ import api from utils
import api from "../utlis/api";





import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import { Card, Button } from "../components/CommonComponents";
import { patientService, appointmentService } from "../services/apiService";
import "../styles/Dashboard.css";

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  // const fetchPatientData = async () => {
  //   try {
  //     setLoading(true);

  //     const [patRes, appRes] = await Promise.all([
  //       patientService.getById(id),
  //       appointmentService.getAll({ patientId: id }),
  //     ]);

  //     setPatient(patRes.data);
  //     setAppointments(appRes.data);

  //   } catch (err) {
  //     setError("Failed to load patient data");
  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
const fetchPatientData = async () => {
  try {
    setLoading(true);

    const [patRes, appRes] = await Promise.all([
      api.get(`/patients/${id}`),  // previously patientService.getById
      api.get(`/appointments`, { params: { patientId: id } }) // previously appointmentService.getAll
    ]);

    setPatient(patRes.data);
    setAppointments(appRes.data);
  } catch (err) {
    setError('Failed to load patient data');
    console.error(err);
  } finally {
    setLoading(false);
  }
};
  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this patient?");
    if (!confirmDelete) return;

    try {
      await patientService.delete(id);
      alert("Patient deleted successfully");
      navigate("/patients");
    } catch (err) {
      alert("Failed to delete patient");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="loading">Loading patient profile...</div>
      </>
    );
  }

  if (!patient) {
    return (
      <>
        <Header />
        <div className="container" style={{ paddingTop: "40px" }}>
          <Card>
            <p>Patient not found</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="container" style={{ paddingTop: "40px", paddingBottom: "40px" }}>
        {error && <div className="error-box">{error}</div>}

        {/* Patient Info */}
        <Card title="Patient Information">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            <div>
              <p><strong>Name:</strong> {patient.name || "N/A"}</p>
              <p><strong>Age:</strong> {patient.age || "-"}</p>
              <p><strong>Gender:</strong> {patient.gender || "-"}</p>
            </div>

            <div>
              <p><strong>Contact:</strong> {patient.contact || "-"}</p>
              <p>
                <strong>Registered:</strong>{" "}
                {patient.createdAt
                  ? new Date(patient.createdAt).toLocaleDateString()
                  : "-"}
              </p>
            </div>
          </div>

          {patient.medicalHistory && (
            <div
              style={{
                marginBottom: "20px",
                padding: "15px",
                backgroundColor: "#f8f9fa",
                borderRadius: "6px",
              }}
            >
              <strong>Medical History:</strong>
              <p style={{ marginTop: "8px", color: "#555" }}>
                {patient.medicalHistory}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>

            {/* <Button
              variant="primary"
              onClick={() => navigate(`/appointments/new?patientId=${id}`)}
              disabled={user.plan === "free"}
            >
              Schedule Appointment
            </Button>

            <Button
              variant="primary"
              onClick={() => navigate(`/patients/edit/${id}`)}
              disabled={user.plan === "free"}
            >
              Edit Profile
            </Button> */}
<Button
  variant="primary"
  onClick={() => {
    if (user.plan === 'free') {
      alert('Upgrade your plan to schedule appointments');
      return;
    }
    navigate(`/appointments/new?patientId=${id}`);
  }}
>
  Schedule Appointment
</Button>

<Button
  variant="primary"
  onClick={() => {
    if (user.plan === 'free') {
      alert('Upgrade your plan to edit patient profiles');
      return;
    }
    navigate(`/patients/edit/${id}`);
  }}
>
  Edit Profile
</Button>

            <Button
              variant="primary"
              onClick={() => navigate(`/history/${id}`)}
            >
              Medical History
            </Button>

            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={user.plan === "free"}
            >
              Delete Patient
            </Button>

          </div>
        </Card>

        {/* Documents */}
        {patient.documents && patient.documents.length > 0 && (
          <Card title="Attached Documents">
            <div className="field-list">
              {patient.documents.map((doc, idx) => (
                <div key={idx} className="field-list-item">
                  <span>📄 {doc.fileName || "Document"}</span>

                  {doc.url && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#667eea" }}
                    >
                      Download
                    </a>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Appointment History */}
        <Card title="Appointment History">

          {appointments.length > 0 ? (

            <div className="list-container">
              <table>

                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Doctor</th>
                    <th>Status</th>
                    <th>Reason</th>
                  </tr>
                </thead>

                <tbody>
                  {appointments.map((appt) => (

                    <tr key={appt._id}>
                      <td>
                        {appt.date
                          ? new Date(appt.date).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>{appt.doctorId?.name || "TBD"}</td>

                      <td>
                        <span className={`status-badge status-${appt.status || "N/A"}`}>
                          {appt.status || "N/A"}
                        </span>
                      </td>

                      <td>{appt.notes || "-"}</td>
                    </tr>

                  ))}
                </tbody>

              </table>
            </div>

          ) : (
            <p>No appointments recorded yet.</p>
          )}

        </Card>

      </div>
    </>
  );
}
