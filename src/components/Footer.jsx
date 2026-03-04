function Footer() {
  return (
    <div style={{
      background: "#2c2c2c",
      color: "white",
      padding: "60px 10%"
    }}>
      <div className="grid grid-3">
        <div>
          <h3>HealthSync</h3>
          <p>AI-powered predictive healthcare system.</p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <p>About</p>
          <p>Services</p>
          <p>Terms</p>
        </div>
        <div>
          <h4>Contact</h4>
          <p>Email: support@healthsync.com</p>
        </div>
      </div>
    </div>
  );
}
export default Footer;