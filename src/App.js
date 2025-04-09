import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import 'bootstrap/dist/css/bootstrap.min.css';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAuIzr0dhRcXqTvi2XrtGreZV8ZxRp2pco",
  authDomain: "smarthome-55493.firebaseapp.com",
  databaseURL: "https://smarthome-55493-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smarthome-55493",
  storageBucket: "smarthome-55493.appspot.com",
  messagingSenderId: "344215361582",
  appId: "1:344215361582:web:ab123cd456ef7890ghij"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

function App() {
  const [ledStatus, setLedStatus] = useState('OFF');
  const [fanStatus, setFanStatus] = useState('OFF');
  const [doorStatus, setDoorStatus] = useState('CLOSED');
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  
  // Login state variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState('');

  // Check auth state on mount and update localStorage accordingly
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedIn(true);
        setEmail(user.email);
        localStorage.setItem('loggedIn', 'true');
      } else {
        setLoggedIn(false);
        localStorage.removeItem('loggedIn');
      }
    });

    // Restore login state from localStorage if available
    if (localStorage.getItem('loggedIn') === 'true') {
      setLoggedIn(true);
    }
    
    return unsubscribeAuth;
  }, []);

  // Listen to realtime database changes
  useEffect(() => {
    const ledRef = ref(database, 'test-led');
    const fanRef = ref(database, 'fan-status');
    const doorRef = ref(database, 'door-status');
    const tempRef = ref(database, 'DHT11/Temperature');
    const humidityRef = ref(database, 'DHT11/Humidity');

    const unsubLed = onValue(ledRef, snapshot => setLedStatus(snapshot.val()));
    const unsubFan = onValue(fanRef, snapshot => setFanStatus(snapshot.val()));
    const unsubDoor = onValue(doorRef, snapshot => setDoorStatus(snapshot.val()));
    const unsubTemp = onValue(tempRef, snapshot => setTemperature(snapshot.val()));
    const unsubHumidity = onValue(humidityRef, snapshot => setHumidity(snapshot.val()));

    return () => {
      unsubLed();
      unsubFan();
      unsubDoor();
      unsubTemp();
      unsubHumidity();
    };
  }, []);

  const toggleLed = () => set(ref(database, 'test-led'), ledStatus === 'ON' ? 'OFF' : 'ON');
  const toggleFan = () => set(ref(database, 'fan-status'), fanStatus === 'ON' ? 'OFF' : 'ON');
  const toggleDoor = () => set(ref(database, 'door-status'), doorStatus === 'OPEN' ? 'CLOSED' : 'OPEN');

  // Firebase Login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoggedIn(true);
      setError('');
      localStorage.setItem('loggedIn', 'true');
    } catch (error) {
      console.error('Login error:', error.message);
      setError('Invalid email or password.');
    }
  };

  // Firebase Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setLoggedIn(false);
      setEmail('');
      setPassword('');
      localStorage.removeItem('loggedIn');
    } catch (error) {
      console.error('Logout error:', error.message);
    }
  };

  if (!loggedIn) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center" style={{ height: '100vh', backgroundColor: '#f4f4f4' }}>
        <div className="w-100">
          <div className="card p-4">
            {/* Use logo512.png for login, made smaller and square */}
            <img 
                src={`${process.env.PUBLIC_URL}/logo512.jpg`} 
              alt="Smart Home Logo" 
              className="img-fluid mb-4 mx-auto d-block" 
              style={{ width: '150px', height: '150px', objectFit: 'cover' }} 
            />
            <h3 className="text-center">Login to Your Smart Home</h3>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label text-center w-100">Email</label>
                <input 
                  type="email" 
                  className="form-control text-center" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-center w-100">Password</label>
                <input 
                  type="password" 
                  className="form-control text-center" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">Login</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`container-fluid text-center ${darkMode ? 'bg-dark text-white' : ''}`} style={{ minHeight: '100vh' }}>
      <h1 className="my-4">IOT BASED SMART HOME</h1>

      {/* CCTV Section */}
      <div className="row justify-content-center mb-4">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h4>CCTV Live Feed</h4>
            </div>
            <div className="card-body">
              <iframe
                title="YouTube Video"
                src="https://www.youtube.com/embed/D4c0UTnNXDM?autoplay=1&mute=1&controls=0&modestbranding=1&showinfo=0&rel=0"
                className="w-100" 
                height="400"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>

      {/* Smart Home Controls Section */}
      <div className="row justify-content-center mb-4">
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body">
              <p className="card-title">Light Control</p>
              <button 
                className={`btn btn-lg w-100 ${ledStatus === 'ON' ? 'btn-primary' : 'btn-secondary'}`} 
                onClick={toggleLed}
              >
                {ledStatus}
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body">
              <p className="card-title">Fan Control</p>
              <button 
                className={`btn btn-lg w-100 ${fanStatus === 'ON' ? 'btn-primary' : 'btn-secondary'}`} 
                onClick={toggleFan}
              >
                {fanStatus}
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body">
              <p className="card-title">Door Control</p>
              <button 
                className={`btn btn-lg w-100 ${doorStatus === 'OPEN' ? 'btn-primary' : 'btn-secondary'}`} 
                onClick={toggleDoor}
              >
                {doorStatus}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Readings Section */}
      <div className="row justify-content-center mb-4">
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body">
              <p className="card-title">Temperature</p>
              <div className="circle d-flex justify-content-center align-items-center" style={{
                height: '120px', 
                width: '120px', 
                borderRadius: '50%', 
                backgroundColor: '#3d5875', 
                color: '#00ff00', 
                fontWeight: 'bold'
              }}>
                {temperature !== null ? `${temperature}°C` : '--'}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body">
              <p className="card-title">Humidity</p>
              <div className="circle d-flex justify-content-center align-items-center" style={{
                height: '120px', 
                width: '120px', 
                borderRadius: '50%', 
                backgroundColor: '#3d5875', 
                color: '#00ff00', 
                fontWeight: 'bold'
              }}>
                {humidity !== null ? `${humidity}%` : '--'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button at the bottom */}
      <div className="row justify-content-center mb-4">
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body">
              {/* <p className="card-title">Logout</p> */}
              <button 
                className="btn btn-lg w-100 btn-danger" 
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
