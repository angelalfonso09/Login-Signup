import React from "react";
import { BsFacebook, BsGithub } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc"; // Import Google logo
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom"; // to navigate after successful login
import axios from "axios"; // Import axios to make API requests

const SocialLogin = () => {
  const navigate = useNavigate();

  // Google login function
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const user = result.user;

      // You can now access the user information
      console.log(user);

      // Send user data to the backend
      const userData = {
        email: user.email,
        name: user.displayName, // Use the correct property (displayName for name)
      };

      // Send the user data to your backend
      await axios.post("http://localhost:5000/save-user", userData);

      // Redirect to dashboard after saving the user data
      navigate("/dashboard");

    } catch (error) {
      console.error("Google login error:", error.message);
    }
  };

  return (
    <div className="d-flex justify-content-center gap-3 mt-3">
      <FcGoogle
        className="social-icon"
        onClick={handleGoogleLogin} // Handle click event to login with Google
      />
    </div>
  );
};

export default SocialLogin;
