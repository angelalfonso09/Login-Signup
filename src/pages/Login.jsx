// Login.jsx
import React, { useState } from "react";
import { Container, Card, Modal, Form, Button } from "react-bootstrap";
import LoginForm from "../components/LoginForm";
import SocialLogin from "../components/SocialLogin";
import "../styles/Login/Login.css";
import BackgroundLayout from '../components/BackgroundLayout';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';


const Login = () => {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleCloseTermsModal = () => setShowTermsModal(false);
  const handleShowTermsModal = () => setShowTermsModal(true);
  const handleTermsCheckboxChange = (e) => setTermsChecked(e.target.checked);

  const handleLoginSuccess = (userRole) => {
    setLoginError("");

    if (userRole === "User") {
      localStorage.setItem("showAccessModalOnLoad", "true");
    }

    switch (userRole) {
      case "Super Admin":
        navigate("/dashboard", { replace: true });
        break;
      case "Admin":
        navigate("/adminDB", { replace: true });
        break;
      case "User":
        navigate("/userDB", { replace: true });
        break;
      default:
        navigate("/", { replace: true });
        break;
    }
  };

  const handleLoginFailure = (errorMessage) => {
    setLoginError(errorMessage);
  };

  return (
    <BackgroundLayout variant="purple">
      {/* Apply theme class to the outermost container */}
      <div className={`login-container ${theme}`}>
        <Container className="login-container-inner d-flex justify-content-center align-items-center p-5">
          {/* Apply theme class to the Card.Body */}
          <Card.Body className={`login-card-body ${theme}`}>
            {/* Apply theme-specific text colors */}
            <h2 className={`login-title text-left ${theme === 'dark' ? 'text-white' : 'text-dark'}`}>Login</h2>
            <p className={`login-subtitle text-left ${theme === 'dark' ? 'text-white' : 'text-dark'}`}>Glad you're back!</p>

            <LoginForm
              onLoginSuccess={handleLoginSuccess}
              onLoginFailure={handleLoginFailure}
              termsChecked={termsChecked}
              setTermsChecked={setTermsChecked}
              loginError={loginError}
            />

            <div className="login-divider d-flex align-items-center my-3">
              {/* Apply theme-specific hr and text colors */}
              <hr className={`login-hr flex-grow-1 ${theme === 'dark' ? 'text-white' : 'text-dark'}`} />
              <span className={`login-or-text mx-2 ${theme === 'dark' ? 'text-white' : 'text-dark'}`}>Or</span>
              <hr className={`login-hr flex-grow-1 ${theme === 'dark' ? 'text-white' : 'text-dark'}`} />
            </div>

            <SocialLogin />

            <div className="login-signup-link text-center mt-3">
              {/* Apply theme-specific text colors */}
              <p className={`login-signup-text ${theme === 'dark' ? 'text-white' : 'text-dark'}`}>
                Don't have an account? <a href="/signup" className={`login-signup-link-text ${theme === 'dark' ? 'text-white' : 'text-dark'}`}>Signup</a>
              </p>
            </div>
            <div className="login-footer text-center small">
              {/* Apply theme-specific link color */}
              <a href="#" className={`login-footer-link ${theme === 'dark' ? 'text-light' : 'text-muted'}`} onClick={handleShowTermsModal}>Terms & Conditions</a>
            </div>
          </Card.Body>
        </Container>
      </div>

      {/* Terms and Conditions Modal - Apply unique class name here */}
      <Modal show={showTermsModal} onHide={handleCloseTermsModal} centered className={`login-terms-modal ${theme}`}> {/* <--- ADDED UNIQUE CLASS */}
        <Modal.Header closeButton className={theme === 'dark' ? 'bg-dark text-white' : 'bg-light text-dark'}>
          <Modal.Title>Terms and Conditions - Data Privacy</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '800px', overflowY: 'scroll', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }} className={theme === 'dark' ? 'bg-secondary text-white' : 'bg-light text-dark'}>
          <p>Effective Date: May 29, 2025</p>

          <p>By creating an account and using our website [Your Website Name], you agree to the collection, use, and disclosure of your personal data as described in this Data Privacy section. We are committed to protecting your privacy and handling your data responsibly and in accordance with applicable data protection laws.</p>

          <p><strong>1. Data We Collect Upon Signup</strong></p>
          <p>When you sign up for an account on [Your Website Name], we may collect the following personal data:</p>
          <ul>
            <li><strong>Identity Data:</strong> Your full name, username, and password.</li>
            <li><strong>Contact Data:</strong> Your email address, and optionally, your phone number.</li>
            <li><strong>Demographic Data (Optional):</strong> If you choose to provide it, information such as your date of birth, gender, and location.</li>
            <li><strong>Usage Data:</strong> Information about how you use our website, including your IP address, browser type, operating system, pages viewed, and access times. This is typically collected through cookies and similar tracking technologies (see Section 4).</li>
          </ul>

          <p><strong>2. How We Use Your Data</strong></p>
          <p>We use the data collected from you for the following purposes:</p>
          <ul>
            <li><strong>To Provide and Maintain Our Services:</strong> To create and manage your account, allow you to log in, and provide you with access to the features and functionalities of our website.</li>
            <li><strong>To Communicate with You:</strong> To send you important updates, service announcements, password reset emails, and respond to your inquiries.</li>
            <li><strong>To Improve Our Website and Services:</strong> To understand how users interact with our website, identify areas for improvement, and develop new features.</li>
            <li><strong>For Security and Fraud Prevention:</strong> To protect our website and users from fraudulent activities, unauthorized access, and other security threats.</li>
            <li><strong>For Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes.</li>
            <li><strong>For Marketing and Promotional Purposes (with your consent):</strong> If you opt-in, we may use your contact information to send you newsletters, promotional offers, and information about products or services that may be of interest to you. You can opt-out of these communications at any time.</li>
          </ul>

          <p><strong>3. How We Share Your Data</strong></p>
          <p>We will not sell, rent, or trade your personal data to third parties. We may share your data in the following limited circumstances:</p>
          <ul>
            <li><strong>Service Providers:</strong> We may share your data with trusted third-party service providers who assist us in operating our website and providing our services (e.g., hosting providers, email service providers, analytics providers). These service providers are obligated to protect your data and only use it for the purposes for which we disclose it to them.</li>
            <li><strong>Legal Requirements:</strong> We may disclose your data if required to do so by law or in response to valid requests by public authorities (e.g., a court order or government agency).</li>
            <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of all or a portion of our assets, your personal data may be transferred as part of that transaction. We will notify you via email or a prominent notice on our website of any such change in ownership or control of your personal data.</li>
            <li><strong>With Your Consent:</strong> We may share your data with third parties if you have given us explicit consent to do so.</li>
          </ul>

          <p><strong>4. Cookies and Tracking Technologies</strong></p>
          <p>We use cookies and similar tracking technologies (e.g., web beacons, pixels) to collect and store certain information when you visit our website. These technologies help us to:</p>
          <ul>
            <li>Remember your preferences.</li>
            <li>Analyze website traffic and usage patterns.</li>
            <li>Deliver relevant content and advertisements.</li>
          </ul>
          <p>You can control and manage cookies through your browser settings. However, disabling cookies may affect the functionality of our website.</p>

          <p><strong>5. Data Security</strong></p>
          <p>We implement appropriate technical and organizational measures to protect your personal data from unauthorized access, disclosure, alteration, and destruction. While we strive to protect your data, no method of transmission over the internet or method of electronic storage is 100% secure. Therefore, we cannot guarantee its absolute security.</p>

          <p><strong>6. Your Data Rights</strong></p>
          <p>Depending on your jurisdiction, you may have the following rights regarding your personal data:</p>
          <ul>
            <li><strong>Right to Access:</strong> To request a copy of the personal data we hold about you.</li>
            <li><strong>Right to Rectification:</strong> To request correction of inaccurate or incomplete personal data.</li>
            <li><strong>Right to Erasure ("Right to Be Forgotten"):</strong> To request the deletion of your personal data under certain circumstances.</li>
            <li><strong>Right to Restriction of Processing:</strong> To request that we limit the way we use your personal data.</li>
            <li><strong>Right to Data Portability:</strong> To receive your personal data in a structured, commonly used, and machine-readable format.</li>
            <li><strong>Right to Object:</strong> To object to the processing of your personal data for certain purposes (e.g., direct marketing).</li>
            <li><strong>Right to Withdraw Consent:</strong> Where we rely on your consent to process your data, you have the right to withdraw that consent at any time.</li>
          </ul>
          <p>To exercise any of these rights, please contact us at [Your Contact Email Address]. We will respond to your request in accordance with applicable laws.</p>

          <p><strong>7. Data Retention</strong></p>
          <p>We will retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, including for the purposes of satisfying any legal, accounting, or reporting requirements.</p>

          <p><strong>8. Children's Privacy</strong></p>
          <p>Our website is not intended for children under the age of [e.g., 13 or 16, depending on applicable law]. We do not knowingly collect personal data from children. If we become aware that we have collected personal data from a child without parental consent, we will take steps to remove that information from our servers.</p>

          <p><strong>9. Changes to This Data Privacy Section</strong></p>
          <p>We may update this Data Privacy section from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated terms on our website or by sending you an email. Your continued use of our website after such changes constitutes your acceptance of the updated terms.</p>

          <p><strong>10. Contact Us</strong></p>
          <p>If you have any questions or concerns about this Data Privacy section or our data practices, please contact us at:</p>
          <p>[Your Company Name]<br />
            [Your Company Address]<br />
            [Your Contact Email Address]<br />
            [Your Phone Number (Optional)]
          </p>
        </Modal.Body>
        <Modal.Footer className={theme === 'dark' ? 'bg-dark text-white' : 'bg-light text-dark'}>
          <Button variant="secondary" onClick={handleCloseTermsModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </BackgroundLayout>
  );
};

export default Login;