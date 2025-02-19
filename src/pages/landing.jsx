import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/landing.css";

const AquaSense = () => {
  const navigate = useNavigate(); 

  const handleLoginClick = () => {
    navigate("/login");  
  };

  return (
    <div className="aquasense-main-container">
      {/* Navbar */}
      <nav className="aquasense-navbar">
        <h1 className="aquasense-brand">AQUASENSE</h1>
        <ul className="aquasense-navigation">
          <li><a href="#" className="nav-link-home">Home</a></li>
          <li><a href="#" className="nav-link-about">About</a></li>
          <li><a href="#" className="nav-link-services">Services</a></li>
          <li><a href="#" className="nav-link-contact">Contact</a></li>
        </ul>
      </nav>

      {/* Hero Section */}
      <header className="aquasense-hero-section">
        <h2 className="hero-welcome-text">Welcome to Aquasense</h2>
        <h1 className="hero-main-title">Water Quality Monitoring System</h1>
        <p className="hero-description">Lorem ipsum dolor sit amet consectetur adipiscing elit...</p>
        <button 
          className="hero-btn-contact" 
          onClick={handleLoginClick}  // Trigger navigate on click
        >
          Get in Touch
        </button>
      </header>

      <section className="aquasense-about-section">
        <div className="about-container">
          {/* Left Side - Image */}
          <div className="about-image">
            <img src="your-image-path/image.png" alt="Aquasense Robot" />
          </div>

          {/* Right Side - Content */}
          <div className="about-content">
            <p className="about-subtitle">ABOUT US</p>
            <h3 className="about-heading">When It Comes To H2O, We Don’t Go With The Flow</h3>
            <p className="about-description">
              Lorem ipsum Neque porro quisquam est qui do lorem ipsum quia dolor sit amet, Neque porro elit...
            </p>
            <button className="about-btn-learn-more">Read More</button>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="aquasense-services-section">
        <div className="services-info">
          <h3 className="services-header">Our Services</h3>
          <h2 className="services-main-title">
            Experience The Power Of <span className="highlight-text">Innovation.</span>
          </h2>
          <p className="services-description">
            Lorem ipsum Neque porro quisquam est qui do lorem ipsum quia dolor sit amet...
          </p>
          <button className="services-btn-view-all">View All</button>
        </div>
        
        <div className="services-list">
          <div className="service-card sanitation">
            <h4 className="service-title">Water Sanitation</h4>
            <p className="service-description">Lorem ipsum Neque do porro quisquam est qui do quam</p>
          </div>
          <div className="service-card monitoring">
            <h4 className="service-title">Real-Time Monitoring</h4>
            <p className="service-description">Lorem ipsum Neque do porro quisquam est qui do quam</p>
          </div>
        </div>
      </section>

      <section className="aquasense-contact-section">
        <div className="contact-container">
          <div className="contact-info">
            <h2 className="contact-title">
              GET IN <span className="highlight-text">TOUCH</span>
            </h2>
            <hr className="contact-divider" />
            <p className="contact-description">
              Lorem ipsum Neque porro quisquam est qui do lorem ipsum quia dolor sit amet, 
              Neque porro elit NeDaque porro.
            </p>

            <div className="contact-details">
              <div className="contact-item">
                <img src="/icons/location.png" alt="Location" className="contact-icon" />
                <div>
                  <h4>Office Address</h4>
                  <p>General Trias, Cavite</p>
                </div>
              </div>

              <div className="contact-item">
                <img src="/icons/phone.png" alt="Phone" className="contact-icon" />
                <div>
                  <h4>Call Us</h4>
                  <p>123456789</p>
                </div>
              </div>

              <div className="contact-item">
                <img src="/icons/mail.png" alt="Mail" className="contact-icon" />
                <div>
                  <h4>Mail Us</h4>
                  <p>your@email.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="contact-form">
            <form>
              <label>Your Name</label>
              <input type="text" placeholder="Enter your name" />

              <label>Your Email</label>
              <input type="email" placeholder="Enter your email" />

              <label>Your Message</label>
              <textarea placeholder="Enter your message"></textarea>

              <button className="btn-submit" type="submit">Send Message</button>
            </form>
          </div>
        </div>
      </section>

      <footer className="footer">
        <h2 className="footer-title">AQUASENSE</h2>
        <nav className="footer-nav">
          <a href="#">Categories</a>
          <a href="#">About</a>
          <a href="#">Services</a>
          <a href="#">Portfolio</a>
          <a href="#">Pages</a>
          <a href="#">Support</a>
        </nav>
        <p className="footer-text">
          Lorem ipsum Neque porro quisquam est qui do lorem ipsum quia dolor sit amet, 
          Neque porro elit NeDaque porro.
        </p>
        <div className="footer-socials">
          <a href="#"><img src="/icons/facebook.png" alt="Facebook" /></a>
          <a href="#"><img src="/icons/instagram.png" alt="Instagram" /></a>
          <a href="#"><img src="/icons/whatsapp.png" alt="WhatsApp" /></a>
          <a href="#"><img src="/icons/linkedin.png" alt="LinkedIn" /></a>
          <a href="#"><img src="/icons/pinterest.png" alt="Pinterest" /></a>
          <a href="#"><img src="/icons/twitter.png" alt="Twitter" /></a>
        </div>
        <p className="footer-copyright">
          Copyright © 2003-2023 Creatic Agency. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default AquaSense;
