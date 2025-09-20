import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    desiredPosition: "",
    experience: "",
    department: "",
    industry: "",
    location: "",
    targetCompany: "",
  
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        "https://mock-ai-1-8xa5.onrender.com/api/auth/profile-setup",
        {
          method: "POST",
          credentials: "include", // send cookies
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (res.ok) {
        navigate("/categories"); // redirect after profile save
      } else {
        console.error("Failed to save profile:", await res.text());
      }
    } catch (err) {
      console.error("Error saving profile:", err);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-orange-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg space-y-4 border border-orange-200"
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-orange-800">
          Complete Your Profile
        </h2>

        {[
          { name: "desiredPosition", type: "text", placeholder: "Desired Position" },
          { name: "experience", type: "number", placeholder: "Years of Experience" },
          { name: "department", type: "text", placeholder: "Department" },
          { name: "industry", type: "text", placeholder: "Industry" },
          { name: "location", type: "text", placeholder: "Location" },
          { name: "targetCompany", type: "text", placeholder: "Target Company" },
       
        ].map((field) => (
          <input
            key={field.name}
            type={field.type}
            name={field.name}
            placeholder={field.placeholder}
            value={form[field.name]}
            onChange={handleChange}
            className="w-full p-3 border border-orange-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            required
          />
        ))}

        <button
          type="submit"
          className="w-full bg-orange-600 text-white p-3 rounded-lg hover:bg-orange-700 transition font-medium"
        >
          Save & Continue
        </button>
      </form>
    </div>
  );
};

export default ProfileSetup;
