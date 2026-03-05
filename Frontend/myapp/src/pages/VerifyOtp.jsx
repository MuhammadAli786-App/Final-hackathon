// import { useState } from "react"
// import { useNavigate, useLocation } from "react-router-dom"
// import { useAuth } from "../context/AuthContext"

// export default function VerifyOtp() {
//   const [otp, setOtp] = useState("")
//   const [error, setError] = useState("")
//   const { verifyOTP } = useAuth()
//   const navigate = useNavigate()
//   const location = useLocation()

//   const queryParams = new URLSearchParams(location.search)
//   const email = queryParams.get("email")
//   const role = queryParams.get("role")

//   const handleVerify = async (e) => {
//     e.preventDefault()
//     setError("")

//     const result = await verifyOTP({ email, otp })

//     if (result.success) {
//       navigate("/login", { replace: true })
//     } else {
//       setError(result.error)
//     }
//   }

//   return (
//     <div className="login-container">
//       <div className="login-box">
//         <h2>Verify OTP</h2>
//         <p>OTP sent to: {email}</p>

//         {error && <div className="error-box">{error}</div>}

//         <form onSubmit={handleVerify}>
//           <input
//             type="text"
//             value={otp}
//             onChange={(e) => setOtp(e.target.value)}
//             placeholder="Enter OTP"
//             required
//           />

//           <button type="submit">Verify</button>
//         </form>
//       </div>
//     </div>
//   )
// }

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Header from "../components/Header"
import "../styles/Login.css"

export default function VerifyOtp() {
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { verifyOTP } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const queryParams = new URLSearchParams(location.search)
  const email = queryParams.get("email")

  const handleVerify = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await verifyOTP({ email, otp })

    if (result.success) {
      navigate("/login", { replace: true })
    } else {
      setError(result.error || "Invalid OTP")
    }

    setLoading(false)
  }

  return (
    <div className="login-container">
      <Header />
      <div className="login-content">
        <div className="login-box">

          <div className="login-header">
            <h1>🔐 Email Verification</h1>
            <p>Enter the OTP sent to your email</p>
          </div>

          <div style={{ textAlign: "center", marginBottom: "15px" }}>
            <small style={{ color: "#666" }}>
              OTP sent to: <strong>{email}</strong>
            </small>
          </div>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleVerify} className="login-form">

            <div className="form-group">
              <label>Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

          </form>

        </div>
      </div>
    </div>
  )
}