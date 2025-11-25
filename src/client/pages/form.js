import { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import "../styles.css";
import "../styles/form.css";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    attachment: null,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    document.title = "Feedback Form";
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0]; // Get the selected file
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file); // Convert file to Base64
      reader.onload = () => {
        setFormData((prevData) => ({
          ...prevData,
          attachment: reader.result, // Store Base64 data
        }));
      };
      reader.onerror = (error) => {
        console.error("Error converting file:", error);
        alert("Failed to attach file.");
      };
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    emailjs
      .send(
        "service_c1tp7mk", // Replace with your actual Service ID
        "template_uc6exw8", // Replace with your actual Template ID
        formData,
        "DxhUG8EGDG-5U66Q9" // Replace with your actual Public Key
      )
      .then((response) => {
        console.log("Email sent successfully!", response);
        alert("Message sent successfully!");
        setFormData({ name: "", email: "", message: "", attachment: null }); // Clear form
      })
      .catch((error) => {
        console.error("Error sending email:", error);
        alert("Failed to send message.");
      });
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <fieldset>
        <legend>Contact Us</legend>

        <label>
          Name:
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Email:
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Message:
          <textarea
            name="message"
            placeholder="What is your message?"
            value={formData.message}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Attach an Image (optional):
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </label>

        <button className="submit" type="submit">
          Send
        </button>
      </fieldset>
    </form>
  );
}
