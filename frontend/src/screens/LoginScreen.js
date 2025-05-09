import React from 'react';
import { Link } from 'react-router-dom';

function LoginScreen() {
  return (
    <div>
      <h1>Login Screen</h1>
      <p>This is the login page.</p>
      <Link to="/main-menu">Go to Main Menu (Simulate Login)</Link>
    </div>
  );
}
export default LoginScreen;
