import React from "react";
import { BsFacebook, BsGithub } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc"; // Import Google logo

const SocialLogin = () => {
  return (
    <div className="d-flex justify-content-center gap-3 mt-3">
      <FcGoogle className="social-icon" /> {/* Google logo */}
      <BsFacebook className="social-icon" style={{ color: "#4267B2" }} /> {/* Facebook default color */}
      <BsGithub className="social-icon" style={{ color: "#FFFFFF" }} /> {/* GitHub white color */}
    </div>
  );
};

export default SocialLogin;
