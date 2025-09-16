import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api/auth";

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
      const res = await fetch(`${API_BASE_URL}/profile-setup`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        // Redirect to category page after saving profile
        navigate("/categories");
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
        <h2 className="text-2xl font-bold mb-4 text-center text-orange-800">Complete Your Profile</h2>

        <input
          type="text"
          name="desiredPosition"
          placeholder="Desired Position"
          value={form.desiredPosition}
          onChange={handleChange}
          className="w-full p-3 border border-orange-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          required
        />

        <input
          type="number"
          name="experience"
          placeholder="Years of Experience"
          value={form.experience}
          onChange={handleChange}
          className="w-full p-3 border border-orange-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          required
        />

        <input
          type="text"
          name="department"
          placeholder="Department"
          value={form.department}
          onChange={handleChange}
          className="w-full p-3 border border-orange-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          required
        />

        <input
          type="text"
          name="industry"
          placeholder="Industry"
          value={form.industry}
          onChange={handleChange}
          className="w-full p-3 border border-orange-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          required
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          className="w-full p-3 border border-orange-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          required
        />

        <input
          type="text"
          name="targetCompany"
          placeholder="Target Company"
          value={form.targetCompany}
          onChange={handleChange}
          className="w-full p-3 border border-orange-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          required
        />

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